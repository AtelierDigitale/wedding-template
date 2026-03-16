import SessionProvider from "@/components/SessionProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-crema">
        {children}
      </div>
    </SessionProvider>
  );
}
