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
  IconEye,
  IconFingerprint,
  IconShieldLock,
  IconAdjustments,
  IconBinaryTree,
  IconMathFunction,
  IconChartDots,
  IconPuzzle,
  IconDatabase,
  IconEyeOff,
} from "@tabler/icons-react";

const demos = [
  {
    key: "hashCommitment" as const,
    slug: "hash-commitment",
    icon: IconHash,
    difficulty: "beginner",
  },
  {
    key: "zkConcepts" as const,
    slug: "zk-concepts",
    icon: IconEye,
    difficulty: "beginner",
  },
  {
    key: "schnorrProtocol" as const,
    slug: "schnorr-protocol",
    icon: IconFingerprint,
    difficulty: "beginner",
  },
  {
    key: "pedersenCommitment" as const,
    slug: "pedersen-commitment",
    icon: IconShieldLock,
    difficulty: "intermediate",
  },
  {
    key: "rangeProof" as const,
    slug: "range-proof",
    icon: IconAdjustments,
    difficulty: "intermediate",
  },
  {
    key: "zkSetMembership" as const,
    slug: "zk-set-membership",
    icon: IconBinaryTree,
    difficulty: "intermediate",
  },
  {
    key: "arithmeticCircuits" as const,
    slug: "arithmetic-circuits",
    icon: IconMathFunction,
    difficulty: "intermediate",
  },
  {
    key: "r1csQap" as const,
    slug: "r1cs-qap",
    icon: IconChartDots,
    difficulty: "advanced",
  },
  {
    key: "snarkPipeline" as const,
    slug: "snark-pipeline",
    icon: IconPuzzle,
    difficulty: "advanced",
  },
  {
    key: "zkRollup" as const,
    slug: "zk-rollup",
    icon: IconDatabase,
    difficulty: "advanced",
  },
  {
    key: "privateTransfer" as const,
    slug: "private-transfer",
    icon: IconEyeOff,
    difficulty: "advanced",
  },
] as const;

const difficultyColors = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

export default function ZKPage() {
  const t = useTranslations("zk");

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
                  href={`zk/demo/${demo.slug}`}
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
