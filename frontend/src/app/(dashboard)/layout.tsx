"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Dashboard layout — wraps all authenticated pages (chat, evolution, settings).
 * Handles auth gating so individual pages don't need to.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-primary)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--accent-primary), var(--accent-warm))",
            animation: "orbPulse 2s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
