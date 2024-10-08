import "../globals.css";

export const metadata = {
  title: "D-Lottery",
  description: "Pick D-Lottery winner",
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
