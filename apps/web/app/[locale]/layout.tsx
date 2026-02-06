import "@mantine/core/styles.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import { routing } from "../../i18n/routing";
import { theme } from "../../lib/theme";
import { AppShellLayout } from "../../components/layout/app-shell-layout";

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
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider theme={theme} defaultColorScheme="auto">
            <AppShellLayout>{children}</AppShellLayout>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
