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
  IconArrowsExchange,
  IconDroplet,
  IconTrendingDown,
  IconBuildingBank,
  IconChartLine,
  IconCoins,
  IconBolt,
  IconScale,
  IconAntenna,
  IconAlertTriangle,
  IconCalculator,
} from "@tabler/icons-react";

const demos = [
  {
    key: "simpleSwap" as const,
    slug: "simple-swap",
    icon: IconArrowsExchange,
    difficulty: "beginner",
  },
  {
    key: "liquidityPool" as const,
    slug: "liquidity-pool",
    icon: IconDroplet,
    difficulty: "beginner",
  },
  {
    key: "impermanentLoss" as const,
    slug: "impermanent-loss",
    icon: IconTrendingDown,
    difficulty: "beginner",
  },
  {
    key: "lendingProtocol" as const,
    slug: "lending-protocol",
    icon: IconBuildingBank,
    difficulty: "beginner",
  },
  {
    key: "interestRateExplorer" as const,
    slug: "interest-rate-explorer",
    icon: IconChartLine,
    difficulty: "beginner",
  },
  {
    key: "stakingRewards" as const,
    slug: "staking-rewards",
    icon: IconCoins,
    difficulty: "intermediate",
  },
  {
    key: "flashLoan" as const,
    slug: "flash-loan",
    icon: IconBolt,
    difficulty: "intermediate",
  },
  {
    key: "arbitrageSimulator" as const,
    slug: "arbitrage-simulator",
    icon: IconScale,
    difficulty: "intermediate",
  },
  {
    key: "oraclePriceFeed" as const,
    slug: "oracle-price-feed",
    icon: IconAntenna,
    difficulty: "intermediate",
  },
  {
    key: "liquidationSimulator" as const,
    slug: "liquidation-simulator",
    icon: IconAlertTriangle,
    difficulty: "advanced",
  },
  {
    key: "yieldCalculator" as const,
    slug: "yield-calculator",
    icon: IconCalculator,
    difficulty: "advanced",
  },
] as const;

const difficultyColors = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

export default function DefiPage() {
  const t = useTranslations("defi");

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
                  href={`defi/demo/${demo.slug}`}
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
