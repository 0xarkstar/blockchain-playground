import { useTranslations } from "next-intl";
import { Container, Title, Text, Stack, Badge, Group, Breadcrumbs, Anchor, Paper } from "@mantine/core";
import { ERC1155MultiTokenDemo } from "../../../../../../components/tokens/erc1155-multi-token-demo";

export default function ERC1155MultiTokenPage() {
  const t = useTranslations("tokens.demos.erc1155MultiToken");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Tokens</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="green">Beginner</Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">{t("description")}</Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <ERC1155MultiTokenDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
