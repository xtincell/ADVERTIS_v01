export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background">
      {/* Branding */}
      <div className="flex items-center justify-center py-8">
        <span className="text-2xl font-bold tracking-tight text-primary">
          ADVERTIS
        </span>
      </div>

      {/* Content */}
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
