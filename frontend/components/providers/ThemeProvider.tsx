"use client";

import { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

interface Props {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}

      <Toaster
        theme="dark"
        richColors
        expand
        closeButton
        position="top-right"
        duration={4000}
        toastOptions={{
          className:
            "rounded-xl border border-zinc-700 shadow-2xl",
          style: {
            background: "#111827",
            color: "#F9FAFB",
          },
        }}
      />
    </NextThemesProvider>
  );
}