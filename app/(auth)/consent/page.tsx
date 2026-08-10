import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ConsentScreen } from "@/components/consent/ConsentScreen";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { isRole } from "@/lib/roles";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว — S.Well-Being",
  description:
    "ความยินยอมในการเก็บรวบรวมและประมวลผลข้อมูลส่วนบุคคล ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
};

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  // Consent is per-role, so an unknown role has nothing to consent to.
  if (!isRole(role ?? null)) redirect("/role-selection");

  return (
    <LanguageProvider>
      <style>{`body { background-color: var(--color-role-page); }`}</style>
      <ConsentScreen role={role as "student" | "admin"} />
    </LanguageProvider>
  );
}
