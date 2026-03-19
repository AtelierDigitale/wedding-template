"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AdminGuard({ children, allowedRoles }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const ruolo = (session?.user as Record<string, unknown>)?.ruolo as string | undefined;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && allowedRoles && ruolo && !allowedRoles.includes(ruolo)) {
      router.replace("/admin");
    }
  }, [status, allowedRoles, ruolo, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-grigio">Caricamento...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (allowedRoles && ruolo && !allowedRoles.includes(ruolo)) {
    return null;
  }

  return <>{children}</>;
}
