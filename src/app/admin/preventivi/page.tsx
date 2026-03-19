"use client";

import AdminGuard from "@/components/AdminGuard";

export default function PreventiviPage() {
  return (
    <AdminGuard allowedRoles={["sposi", "planner"]}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="font-heading text-3xl text-marrone">Preventivi</h1>
        <p className="mt-4 text-grigio">Sezione in costruzione...</p>
      </div>
    </AdminGuard>
  );
}
