import { useTranslations } from "next-intl";
import {
  Container,
  Title,
  Text,
  Stack,
  Badge,
  Group,
  Breadcrumbs,
  Anchor,
  Paper,
} from "@mantine/core";
import { MerkleProofDemo } from "../../../../../../components/fundamentals/merkle-proof-demo";

export default function MerkleProofPage() {
  const t = useTranslations("fundamentals.demos.merkleProof");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Fundamentals</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="green">
              Beginner
            </Badge>
            <Badge variant="light" color="violet">
              On-Chain
            </Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {t("description")}
          </Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <MerkleProofDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
