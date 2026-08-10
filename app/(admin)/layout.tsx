import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CasesSync } from "@/components/data/CasesSync";
import { SosSync } from "@/components/data/SosSync";
import { ConsentGuard } from "@/components/consent/ConsentGuard";
import { StaffGuard } from "@/components/auth/StaffGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

/**
 * The staff shell: a fixed sidebar and a wide working area. Case work means
 * comparing rows and reading history side by side, which is a desk job — this
 * side is not designed for a phone, and pretending otherwise would produce a
 * dashboard that is bad at both.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <StaffGuard>
        <ConsentGuard role="admin">
          <CasesSync />
        <SosSync />
          <div className="flex min-h-dvh bg-neutral-50">
            <AdminSidebar />
            <main className="min-w-0 flex-1 px-5 py-6 lg:px-8 lg:py-8">
              <RoleGuard>{children}</RoleGuard>
            </main>
          </div>
        </ConsentGuard>
      </StaffGuard>
    </LanguageProvider>
  );
}
