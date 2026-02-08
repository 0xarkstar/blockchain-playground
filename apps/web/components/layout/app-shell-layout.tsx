"use client";

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  ActionIcon,
  useMantineColorScheme,
  Menu,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  IconSun,
  IconMoon,
  IconLanguage,
  IconHome,
  IconCube,
  IconCoin,
  IconCode,
  IconDiamond,
  IconLock,
} from "@tabler/icons-react";

import { Link } from "../../i18n/navigation";

const trackNavItems = [
  { key: "home", href: "/", icon: IconHome },
  { key: "fundamentals", href: "/fundamentals", icon: IconCube },
  { key: "defi", href: "/defi", icon: IconCoin },
  { key: "solidity", href: "/solidity", icon: IconCode },
  { key: "tokens", href: "/tokens", icon: IconDiamond },
  { key: "zk", href: "/zk", icon: IconLock },
] as const;

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const t = useTranslations("nav");
  const pathname = usePathname();

  const pathWithoutLocale = pathname.replace(/^\/(en|ko)/, "") || "/";

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Title order={3}>Blockchain Playground</Title>
            </Link>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="default"
              size="lg"
              onClick={toggleColorScheme}
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>
            <Menu shadow="md" width={120}>
              <Menu.Target>
                <ActionIcon
                  variant="default"
                  size="lg"
                  aria-label="Change language"
                >
                  <IconLanguage size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component="a" href={`/en${pathWithoutLocale}`}>
                  <Text size="sm">English</Text>
                </Menu.Item>
                <Menu.Item component="a" href={`/ko${pathWithoutLocale}`}>
                  <Text size="sm">한국어</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {trackNavItems.map((item) => (
          <NavLink
            key={item.key}
            component={Link}
            href={item.href}
            label={t(item.key)}
            leftSection={<item.icon size={18} />}
            active={
              item.href === "/"
                ? pathWithoutLocale === "/"
                : pathWithoutLocale.startsWith(item.href)
            }
            onClick={close}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
