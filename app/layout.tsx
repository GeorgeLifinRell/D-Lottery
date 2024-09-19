import "./globals.css";

export const metadata = {
  title: "D-Lottery",
  description: "Decentralized Lottery App",
  icons: {
    icon: [{ url: "./icon.png" }],
  },
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
