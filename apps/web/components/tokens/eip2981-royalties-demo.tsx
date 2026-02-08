"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  NumberInput,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Progress,
} from "@mantine/core";
import { calculatePriceBreakdown } from "../../lib/tokens/marketplace";
import { SimplePieChart } from "../shared";

export function EIP2981RoyaltiesDemo() {
  const [salePrice, setSalePrice] = useState(10);
  const [royaltyPercent, setRoyaltyPercent] = useState(5);
  const [platformFeePercent, setPlatformFeePercent] = useState(2.5);

  const breakdown = useMemo(
    () =>
      calculatePriceBreakdown(salePrice, royaltyPercent, platformFeePercent),
    [salePrice, royaltyPercent, platformFeePercent],
  );

  const scenarios = useMemo(() => {
    const prices = [1, 5, 10, 50, 100];
    return prices.map((price) =>
      calculatePriceBreakdown(price, royaltyPercent, platformFeePercent),
    );
  }, [royaltyPercent, platformFeePercent]);

  const sellerPct =
    salePrice > 0 ? (breakdown.sellerProceeds / salePrice) * 100 : 0;
  const royaltyPct =
    salePrice > 0 ? (breakdown.royaltyAmount / salePrice) * 100 : 0;
  const feePct = salePrice > 0 ? (breakdown.platformFee / salePrice) * 100 : 0;

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Configuration
          </Text>
          <Group grow>
            <NumberInput
              label="Sale Price (ETH)"
              value={salePrice}
              onChange={(v) => setSalePrice(Number(v) || 0)}
              min={0.01}
              decimalScale={4}
            />
            <NumberInput
              label="Royalty %"
              value={royaltyPercent}
              onChange={(v) => setRoyaltyPercent(Number(v) || 0)}
              min={0}
              max={50}
              decimalScale={2}
            />
            <NumberInput
              label="Platform Fee %"
              value={platformFeePercent}
              onChange={(v) => setPlatformFeePercent(Number(v) || 0)}
              min={0}
              max={50}
              decimalScale={2}
            />
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Payment Distribution
          </Text>
          <Progress.Root size="xl">
            <Progress.Section value={sellerPct} color="green">
              <Progress.Label>Seller {sellerPct.toFixed(1)}%</Progress.Label>
            </Progress.Section>
            <Progress.Section value={royaltyPct} color="violet">
              <Progress.Label>Royalty {royaltyPct.toFixed(1)}%</Progress.Label>
            </Progress.Section>
            <Progress.Section value={feePct} color="orange">
              <Progress.Label>Fee {feePct.toFixed(1)}%</Progress.Label>
            </Progress.Section>
          </Progress.Root>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Sale Price</Table.Td>
                <Table.Td ta="right">
                  <Code>{breakdown.price.toFixed(4)} ETH</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Group gap="xs">
                    <Badge variant="light" color="violet" size="xs">
                      Creator
                    </Badge>
                    Royalty ({royaltyPercent}%)
                  </Group>
                </Table.Td>
                <Table.Td ta="right">
                  <Code>{breakdown.royaltyAmount.toFixed(4)} ETH</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Group gap="xs">
                    <Badge variant="light" color="orange" size="xs">
                      Platform
                    </Badge>
                    Fee ({platformFeePercent}%)
                  </Group>
                </Table.Td>
                <Table.Td ta="right">
                  <Code>{breakdown.platformFee.toFixed(4)} ETH</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Group gap="xs">
                    <Badge variant="light" color="green" size="xs">
                      Seller
                    </Badge>
                    Proceeds
                  </Group>
                </Table.Td>
                <Table.Td ta="right">
                  <Code fw={600}>
                    {breakdown.sellerProceeds.toFixed(4)} ETH
                  </Code>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>

          <SimplePieChart
            data={[
              {
                recipient: "Seller",
                amount: Number(breakdown.sellerProceeds.toFixed(4)),
              },
              {
                recipient: "Royalty",
                amount: Number(breakdown.royaltyAmount.toFixed(4)),
              },
              {
                recipient: "Platform",
                amount: Number(breakdown.platformFee.toFixed(4)),
              },
            ]}
            nameKey="recipient"
            valueKey="amount"
            colors={["#40c057", "#7950f2", "#fd7e14"]}
            height={250}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Royalty at Different Price Points
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Price (ETH)</Table.Th>
                <Table.Th ta="right">Royalty</Table.Th>
                <Table.Th ta="right">Platform Fee</Table.Th>
                <Table.Th ta="right">Seller Gets</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {scenarios.map((s) => (
                <Table.Tr key={s.price}>
                  <Table.Td>
                    <Code>{s.price.toFixed(2)}</Code>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Code>{s.royaltyAmount.toFixed(4)}</Code>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Code>{s.platformFee.toFixed(4)}</Code>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Code>{s.sellerProceeds.toFixed(4)}</Code>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            EIP-2981 Standard
          </Text>
          <Text size="sm" c="dimmed">
            EIP-2981 defines a standard interface for querying royalty payment
            information. Marketplaces call{" "}
            <Code>royaltyInfo(tokenId, salePrice)</Code> which returns the
            royalty receiver address and payment amount. This is an on-chain
            standard that works across any NFT marketplace that implements it.
          </Text>
          <Code block>
            {`// EIP-2981 Interface
function royaltyInfo(
  uint256 tokenId,
  uint256 salePrice
) external view returns (
  address receiver,   // royalty recipient
  uint256 royaltyAmount // payment in sale currency
);`}
          </Code>
        </Stack>
      </Paper>
    </Stack>
  );
}
