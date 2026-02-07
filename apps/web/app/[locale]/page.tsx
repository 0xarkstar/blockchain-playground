import { useTranslations } from "next-intl";
import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Card,
  Group,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCube,
  IconCoin,
  IconCode,
  IconDiamond,
  IconLock,
} from "@tabler/icons-react";

const tracks = [
  {
    key: "fundamentals" as const,
    icon: IconCube,
    color: "blue",
    href: "/fundamentals",
    ready: true,
  },
  {
    key: "defi" as const,
    icon: IconCoin,
    color: "green",
    href: "/defi",
    ready: true,
  },
  {
    key: "solidity" as const,
    icon: IconCode,
    color: "orange",
    href: "/solidity",
    ready: true,
  },
  {
    key: "tokens" as const,
    icon: IconDiamond,
    color: "violet",
    href: "/tokens",
    ready: true,
  },
  {
    key: "zk" as const,
    icon: IconLock,
    color: "red",
    href: "/zk",
    ready: false,
  },
];

export default function HomePage() {
  const t = useTranslations("home");
  const tTracks = useTranslations("tracks");

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="md" align="center" ta="center">
          <Title order={1} size="3rem">
            {t("hero.title")}
          </Title>
          <Text size="xl" c="dimmed" maw={600}>
            {t("hero.description")}
          </Text>
        </Stack>

        <Stack gap="md">
          <Title order={2}>{t("tracks.title")}</Title>
          <Text c="dimmed">{t("tracks.description")}</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {tracks.map((track) => (
            <Card
              key={track.key}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              component="a"
              href={track.href}
              style={{
                cursor: track.ready ? "pointer" : "default",
                opacity: track.ready ? 1 : 0.7,
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <ThemeIcon size="lg" variant="light" color={track.color}>
                    <track.icon size={20} />
                  </ThemeIcon>
                  {!track.ready && (
                    <Badge variant="outline" color="gray">
                      Coming Soon
                    </Badge>
                  )}
                </Group>
                <Title order={3}>{tTracks(`${track.key}.title`)}</Title>
                <Text size="sm" c="dimmed">
                  {tTracks(`${track.key}.description`)}
                </Text>
                <Group gap="xs">
                  <Badge variant="light" color={track.color} size="sm">
                    {tTracks(`${track.key}.demos`)}
                  </Badge>
                  <Badge variant="light" color="gray" size="sm">
                    {tTracks(`${track.key}.modules`)}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
