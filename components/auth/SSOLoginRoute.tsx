"use client";

import { useRouter } from "next/navigation";

import { SSOLoginScreen } from "@/components/auth/SSOLoginScreen";
import { useUserStore } from "@/lib/store/useUserStore";

/**
 * Wires the presentational SSO screen to real routing. On sign-in it records
 * the session and hands off to role selection — the first thing the person
 * chooses, before any school data is asked for.
 */
export function SSOLoginRoute() {
  const router = useRouter();

  return (
    <SSOLoginScreen
      onAuthenticated={(provider, email) => {
        useUserStore.getState().signIn(provider, email);
        router.push("/role-selection");
      }}
    />
  );
}
