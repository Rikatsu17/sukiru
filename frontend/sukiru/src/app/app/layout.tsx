"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import { useToast } from "@/lib/toast-context";
import { CreditStamp } from "@/components/CreditStamp";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout, updateLocalUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useLiveUpdates(
    (message) => {
      if (message.type === "balance_update" && typeof message.payload?.credits === "number") {
        updateLocalUser({ credits: message.payload.credits as number });
      }
      if (message.type === "new_application") {
        showToast("Someone just applied to one of your tasks.");
      }
      if (message.type === "application_accepted") {
        showToast("You were accepted for a task. It's in progress now.", "success");
        refreshUser();
      }
      if (message.type === "task_completed") {
        showToast("A task was marked complete and credits moved.", "success");
      }
    },
    isAuthenticated
  );

  function handleLogout() {
    logout();
    showToast("You've been signed out.");
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-stone text-sm">
        Opening your ledger…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="border-b border-rule bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold tracking-tight">Sukiru</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user.full_name}</p>
              <p className="font-mono text-xs text-stamp-dark leading-tight">
                {user.credits} {user.credits === 1 ? "credit" : "credits"}
              </p>
            </div>
            <CreditStamp size="sm" tone="ink" label={`${user.credits} cr`} className="sm:hidden" />
            <button
              onClick={handleLogout}
              className="text-sm text-stone hover:text-danger transition-colors border border-rule rounded-md px-3 py-1.5"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <AppNav />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function AppNav() {
  const pathname = usePathname();
  const items = [
    { href: "/app", label: "Open tasks" },
    { href: "/app/my-tasks", label: "My tasks" },
    { href: "/app/applications", label: "My applications" },
    { href: "/app/transactions", label: "Transactions" },
    { href: "/app/create-task", label: "Create task" },
    { href: "/app/profile", label: "Profile" },
  ];

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1">
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          active={item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)}
        />
      ))}
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      data-active={active}
      className="whitespace-nowrap text-sm px-3.5 py-2.5 rounded-md text-stone hover:text-ink hover:bg-paper-dim transition-colors data-[active=true]:bg-ink data-[active=true]:text-paper"
    >
      {label}
    </Link>
  );
}
