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
  IconCoin,
  IconArrowsLeftRight,
  IconPhoto,
  IconStack2,
  IconClock,
  IconFileDescription,
  IconBuildingStore,
  IconTrendingDown,
  IconCrown,
  IconScale,
  IconLink,
} from "@tabler/icons-react";

const demos = [
  {
    key: "erc20Creator" as const,
    slug: "erc20-creator",
    icon: IconCoin,
    difficulty: "beginner",
  },
  {
    key: "tokenAllowance" as const,
    slug: "token-allowance",
    icon: IconArrowsLeftRight,
    difficulty: "beginner",
  },
  {
    key: "erc721Minter" as const,
    slug: "erc721-minter",
    icon: IconPhoto,
    difficulty: "beginner",
  },
  {
    key: "erc1155MultiToken" as const,
    slug: "erc1155-multi-token",
    icon: IconStack2,
    difficulty: "beginner",
  },
  {
    key: "tokenVesting" as const,
    slug: "token-vesting",
    icon: IconClock,
    difficulty: "intermediate",
  },
  {
    key: "nftMetadata" as const,
    slug: "nft-metadata",
    icon: IconFileDescription,
    difficulty: "intermediate",
  },
  {
    key: "nftMarketplace" as const,
    slug: "nft-marketplace",
    icon: IconBuildingStore,
    difficulty: "intermediate",
  },
  {
    key: "dutchAuction" as const,
    slug: "dutch-auction",
    icon: IconTrendingDown,
    difficulty: "intermediate",
  },
  {
    key: "eip2981Royalties" as const,
    slug: "eip2981-royalties",
    icon: IconCrown,
    difficulty: "advanced",
  },
  {
    key: "tokenGovernance" as const,
    slug: "token-governance",
    icon: IconScale,
    difficulty: "advanced",
  },
  {
    key: "soulboundTokens" as const,
    slug: "soulbound-tokens",
    icon: IconLink,
    difficulty: "advanced",
  },
] as const;

const difficultyColors = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

export default function TokensPage() {
  const t = useTranslations("tokens");

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
                <Badge
                  size="lg"
                  variant="light"
                  color={difficultyColors[level]}
                >
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
                  href={`tokens/demo/${demo.slug}`}
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
                    <Title order={4}>{t(`demos.${demo.key}.title`)}</Title>
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
