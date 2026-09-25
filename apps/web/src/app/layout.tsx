import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Community Power — Good energy. Better together.", template: "%s | Community Power" },
  description: "A supplier-neutral way to understand energy, connect with your community, and explore your options. Local development preview.",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/cp-logo.png" },
};
export const viewport: Viewport = { themeColor: "#0057b7", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
