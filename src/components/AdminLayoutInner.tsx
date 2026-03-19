"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-crema">
      {!isLogin && <AdminSidebar />}
      <div className={isLogin ? "" : "pb-20 md:ml-64 md:pb-0"}>
        {children}
      </div>
    </div>
  );
}
