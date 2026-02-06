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
  IconHash,
  IconKey,
  IconCube,
  IconLink,
  IconBinaryTree,
  IconPick,
  IconArrowsExchange,
  IconWallet,
  IconNetwork,
  IconDatabase,
  IconFlame,
} from "@tabler/icons-react";

const demos = [
  {
    key: "hashExplorer" as const,
    slug: "hash-explorer",
    icon: IconHash,
    difficulty: "beginner",
    onChain: false,
  },
  {
    key: "signatureStudio" as const,
    slug: "signature-studio",
    icon: IconKey,
    difficulty: "beginner",
    onChain: true,
  },
  {
    key: "blockBuilder" as const,
    slug: "block-builder",
    icon: IconCube,
    difficulty: "beginner",
    onChain: false,
  },
  {
    key: "chainIntegrity" as const,
    slug: "chain-integrity",
    icon: IconLink,
    difficulty: "beginner",
    onChain: false,
  },
  {
    key: "merkleProof" as const,
    slug: "merkle-proof",
    icon: IconBinaryTree,
    difficulty: "beginner",
    onChain: true,
  },
  {
    key: "miningSimulator" as const,
    slug: "mining-simulator",
    icon: IconPick,
    difficulty: "intermediate",
    onChain: false,
  },
  {
    key: "transactionBuilder" as const,
    slug: "transaction-builder",
    icon: IconArrowsExchange,
    difficulty: "intermediate",
    onChain: true,
  },
  {
    key: "walletWorkshop" as const,
    slug: "wallet-workshop",
    icon: IconWallet,
    difficulty: "intermediate",
    onChain: false,
  },
  {
    key: "consensusPlayground" as const,
    slug: "consensus-playground",
    icon: IconNetwork,
    difficulty: "intermediate",
    onChain: false,
  },
  {
    key: "stateExplorer" as const,
    slug: "state-explorer",
    icon: IconDatabase,
    difficulty: "advanced",
    onChain: false,
  },
  {
    key: "gasEstimator" as const,
    slug: "gas-estimator",
    icon: IconFlame,
    difficulty: "advanced",
    onChain: true,
  },
] as const;

const difficultyColors = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

export default function FundamentalsPage() {
  const t = useTranslations("fundamentals");

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
                  href={`fundamentals/demo/${demo.slug}`}
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
                      {demo.onChain && (
                        <Badge variant="light" color="violet" size="sm">
                          On-Chain
                        </Badge>
                      )}
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
