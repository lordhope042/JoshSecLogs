import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://joshseclogs.com"),
  title: {
    default: "JoshSecLogs — Premium Virtual Number Platform",
    template: "%s | JoshSecLogs",
  },
  description: "Premium Virtual Number Platform",
  keywords: [
    "virtual number",
    "SMS verification",
    "virtual phone number Nigeria",
    "JoshSecLogs",
  ],
  authors: [{ name: "JoshSecLogs" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JoshSecLogs — Premium Virtual Number Platform",
    description: "Premium Virtual Number Platform",
    url: "https://joshseclogs.com",
    siteName: "JoshSecLogs",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JoshSecLogs — Premium Virtual Number Platform",
    description: "Premium Virtual Number Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}