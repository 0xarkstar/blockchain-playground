import "../globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";

import { routing } from "../../i18n/routing";
import { AppShellLayout } from "../../components/layout/app-shell-layout";
import { Toaster } from "../../components/ui/sonner";

export const metadata: Metadata = {
  title: "Blockchain Playground",
  description:
    "Interactive blockchain education platform — learn by doing with demos, visualizations, and smart contracts",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <AppShellLayout>{children}</AppShellLayout>
            <Toaster richColors position="bottom-right" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
