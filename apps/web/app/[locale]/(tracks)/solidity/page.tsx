import { useTranslations } from "next-intl";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Badge,
  Group,
  Stack,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {
  IconDatabase,
  IconBraces,
  IconFileCode,
  IconShieldLock,
  IconFlame,
  IconFileText,
  IconBox,
  IconPlugConnected,
  IconBug,
  IconLayersLinked,
  IconTerminal2,
} from "@tabler/icons-react";

const demos = [
  {
    key: "storageLayout" as const,
    slug: "storage-layout",
    icon: IconDatabase,
    difficulty: "beginner",
  },
  {
    key: "abiEncoder" as const,
    slug: "abi-encoder",
    icon: IconBraces,
    difficulty: "beginner",
  },
  {
    key: "dataTypes" as const,
    slug: "data-types",
    icon: IconFileCode,
    difficulty: "beginner",
  },
  {
    key: "accessControl" as const,
    slug: "access-control",
    icon: IconShieldLock,
    difficulty: "beginner",
  },
  {
    key: "gasOptimizer" as const,
    slug: "gas-optimizer",
    icon: IconFlame,
    difficulty: "intermediate",
  },
  {
    key: "eventLogInspector" as const,
    slug: "event-log-inspector",
    icon: IconFileText,
    difficulty: "intermediate",
  },
  {
    key: "dataLocations" as const,
    slug: "data-locations",
    icon: IconBox,
    difficulty: "intermediate",
  },
  {
    key: "contractInteractions" as const,
    slug: "contract-interactions",
    icon: IconPlugConnected,
    difficulty: "intermediate",
  },
  {
    key: "reentrancyAttack" as const,
    slug: "reentrancy-attack",
    icon: IconBug,
    difficulty: "advanced",
  },
  {
    key: "proxyPatterns" as const,
    slug: "proxy-patterns",
    icon: IconLayersLinked,
    difficulty: "advanced",
  },
  {
    key: "assemblyPlayground" as const,
    slug: "assembly-playground",
    icon: IconTerminal2,
    difficulty: "advanced",
  },
] as const;

const difficultyColors = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

export default function SolidityPage() {
  const t = useTranslations("solidity");

  const groups = {
    beginner: demos.filter((d) => d.difficulty === "beginner"),
    intermediate: demos.filter((d) => d.difficulty === "intermediate"),
    advanced: demos.filter((d) => d.difficulty === "advanced"),
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>{t("pageTitle")}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {t("pageDescription")}
          </Text>
        </div>

        {(["beginner", "intermediate", "advanced"] as const).map((level) => (
          <Stack key={level} gap="md">
            <Divider
              label={
                <Badge size="lg" variant="light" color={difficultyColors[level]}>
                  {t(level)}
                </Badge>
              }
            />
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {groups[level].map((demo) => (
                <Card
                  key={demo.slug}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  component="a"
                  href={`solidity/demo/${demo.slug}`}
                  style={{ cursor: "pointer" }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <ThemeIcon
                        size="lg"
                        variant="light"
                        color={difficultyColors[demo.difficulty]}
                      >
                        <demo.icon size={20} />
                      </ThemeIcon>
                    </Group>
                    <Title order={4}>
                      {t(`demos.${demo.key}.title`)}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {t(`demos.${demo.key}.description`)}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}
