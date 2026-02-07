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
import { NFTMarketplaceDemo } from "../../../../../../components/tokens/nft-marketplace-demo";

export default function NFTMarketplacePage() {
  const t = useTranslations("tokens.demos.nftMarketplace");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Tokens</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="yellow">
              Intermediate
            </Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {t("description")}
          </Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <NFTMarketplaceDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
