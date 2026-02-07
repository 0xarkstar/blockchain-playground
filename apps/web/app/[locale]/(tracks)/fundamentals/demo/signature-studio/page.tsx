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
import { SignatureStudioDemo } from "../../../../../../components/fundamentals/signature-studio-demo";

export default function SignatureStudioPage() {
  const t = useTranslations("fundamentals.demos.signatureStudio");
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
          <SignatureStudioDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
