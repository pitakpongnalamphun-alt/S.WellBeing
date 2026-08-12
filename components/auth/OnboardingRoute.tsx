"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProfileCompletionScreen } from "@/components/auth/ProfileCompletionScreen";
import { useUserStore } from "@/lib/store/useUserStore";
import { isRole } from "@/lib/roles";

/**
 * Onboarding sits between role selection and consent. It is reachable only
 * signed-in and only with a valid role in the URL, so it can't be hit out of
 * order; and a returning user who already linked their data skips straight to
 * consent rather than re-typing it.
 */
export function OnboardingRoute() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role");

  const ready = useUserStore((s) => s.ready);
  const session = useUserStore((s) => s.session);
  const profile = useUserStore((s) => s.profile);
  const completeProfile = useUserStore((s) => s.completeProfile);
  const syncFromServer = useUserStore((s) => s.syncFromServer);

  const validRole = isRole(roleParam);

  // เคยกรอกไว้แล้วบนเครื่องอื่น → ดึงกลับมาก่อนตัดสินใจว่าจะให้กรอกใหม่ไหม
  useEffect(() => {
    if (ready && session) void syncFromServer();
  }, [ready, session, syncFromServer]);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/login");
    } else if (!validRole) {
      // No role chosen yet — send them back to pick one.
      router.replace("/role-selection");
    } else if (profile) {
      // Already onboarded — carry the role straight to consent.
      router.replace(`/consent?role=${roleParam}`);
    }
  }, [ready, session, validRole, profile, roleParam, router]);

  // Render nothing until we know the person belongs here. Calling isRole here
  // (not the `validRole` boolean) narrows roleParam to Role for the JSX below.
  if (!ready || !session || !isRole(roleParam) || profile) return null;

  return (
    <ProfileCompletionScreen
      role={roleParam}
      email={session.email ?? undefined}
      initialName={session.name ?? undefined}
      onComplete={({ username, studentId }) => {
        completeProfile(username, studentId);
        router.push(`/consent?role=${roleParam}`);
      }}
    />
  );
}
