"use client";

import Link from "next/link";
import { HelpCircle, Search } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ComposeProvider } from "@/components/compose/compose-context";
import { FloatingComposer } from "@/components/compose/floating-composer";
import { MailboxProvider } from "@/components/mailbox-provider";
import { MailboxSelector } from "@/components/mailbox-selector";
import { AdminNav } from "@/components/admin-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireMailbox>
      <MailboxProvider>
        <ComposeProvider>
          <div className="grid min-h-screen grid-cols-[256px_1fr] bg-[#f6f8fc]">
            <aside className="flex flex-col gap-4 px-3 py-4">
              <AdminNav />
            </aside>
            <div className="flex min-h-screen flex-col">
              <header className="flex h-16 items-center gap-4 pr-4 text-sm">
                <div className="flex h-12 flex-1 max-w-3xl items-center gap-3 rounded-full bg-[#eaf1fb] px-4 text-neutral-600">
                  <Search className="h-5 w-5" />
                  <span className="text-[15px]">Search mail</span>
                </div>
                <Link
                  href="/settings"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-200"
                >
                  <HelpCircle className="h-5 w-5" />
                </Link>
                <MailboxSelector />
              </header>
              <main className="flex-1 overflow-hidden rounded-t-3xl bg-white px-12 py-8 w-fit min-w-172">
                {children}
              </main>
            </div>
            <FloatingComposer />
          </div>
        </ComposeProvider>
      </MailboxProvider>
    </AuthGuard>
  );
}
