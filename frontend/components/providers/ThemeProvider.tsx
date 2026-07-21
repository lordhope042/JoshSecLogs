"use client";

import { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

interface Props {
  children: ReactNode;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      richColors
      expand
      closeButton
      position="top-right"
      duration={4000}
      toastOptions={{
        className:
          "rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-zinc-700 dark:bg-[#111827] dark:text-gray-50",
      }}
    />
  );
}

export function ThemeProvider({
  children,
}: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}

      <ThemedToaster />
    </NextThemesProvider>
  );
}
