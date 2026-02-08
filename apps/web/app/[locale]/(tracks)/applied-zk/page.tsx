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
  IconShieldCheck,
  IconThumbUp,
  IconParachute,
} from "@tabler/icons-react";

const demos = [
  {
    key: "hashPreimage" as const,
    slug: "hash-preimage",
    icon: IconHash,
    difficulty: "beginner",
  },
  {
    key: "ageVerification" as const,
    slug: "age-verification",
    icon: IconShieldCheck,
    difficulty: "intermediate",
  },
  {
    key: "secretVoting" as const,
    slug: "secret-voting",
    icon: IconThumbUp,
    difficulty: "advanced",
  },
  {
    key: "privateAirdrop" as const,
    slug: "private-airdrop",
    icon: IconParachute,
    difficulty: "advanced",
  },
] as const;

const difficultyColors = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

export default function AppliedZKPage() {
  const t = useTranslations("appliedZk");

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

        {(["beginner", "intermediate", "advanced"] as const).map((level) =>
          groups[level].length > 0 ? (
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
                    href={`applied-zk/demo/${demo.slug}`}
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
          ) : null,
        )}
      </Stack>
    </Container>
  );
}
