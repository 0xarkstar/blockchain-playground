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
import { EIP2981RoyaltiesDemo } from "../../../../../../components/tokens/eip2981-royalties-demo";

export default function EIP2981RoyaltiesPage() {
  const t = useTranslations("tokens.demos.eip2981Royalties");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Tokens</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="red">
              Advanced
            </Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {t("description")}
          </Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <EIP2981RoyaltiesDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
