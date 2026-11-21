import "./globals.css";

export const metadata = {
  title: "Supabase Authentication",
  description: "Next.js with Supabase Authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}