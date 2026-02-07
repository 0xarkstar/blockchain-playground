"use client";

import { useState } from "react";
import {
  Stack,
  Paper,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
  NumberInput,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createPedersenParams,
  pedersenCommit,
  verifyPedersen,
  demonstrateHomomorphic,
  type PedersenCommitmentResult,
  type HomomorphicDemo,
} from "../../lib/zk/pedersen";

export function PedersenCommitmentDemo() {
  const params = createPedersenParams();
  const [value, setValue] = useState(5);
  const [randomness, setRandomness] = useState(3);
  const [commitment, setCommitment] = useState<PedersenCommitmentResult | null>(
    null,
  );
  const [verifyVal, setVerifyVal] = useState(5);
  const [verifyRand, setVerifyRand] = useState(3);
  const [verified, setVerified] = useState<boolean | null>(null);

  const [v1, setV1] = useState(3);
  const [r1, setR1] = useState(2);
  const [v2, setV2] = useState(4);
  const [r2, setR2] = useState(5);
  const [homoResult, setHomoResult] = useState<HomomorphicDemo | null>(null);

  const handleCommit = () => {
    setCommitment(pedersenCommit(params, BigInt(value), BigInt(randomness)));
    setVerified(null);
  };

  const handleVerify = () => {
    if (!commitment) return;
    setVerified(
      verifyPedersen(
        params,
        BigInt(verifyVal),
        BigInt(verifyRand),
        commitment.commitment,
      ),
    );
  };

  const handleHomomorphic = () => {
    setHomoResult(
      demonstrateHomomorphic(
        params,
        BigInt(v1),
        BigInt(r1),
        BigInt(v2),
        BigInt(r2),
      ),
    );
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        Pedersen commitment: C = g^v * h^r mod p. It is perfectly hiding
        (information-theoretically secure) and computationally binding. Unlike
        hash commitments, it supports homomorphic addition.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Parameters (p=23, subgroup order q=11)
          </Text>
          <Group>
            <Text size="sm">
              g = <Code>{params.g.toString()}</Code>
            </Text>
            <Text size="sm">
              h = <Code>{params.h.toString()}</Code>
            </Text>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Create Commitment
          </Text>
          <Group grow>
            <NumberInput
              label="Value (v)"
              value={value}
              onChange={(v) => setValue(Number(v) || 0)}
              min={0}
              max={22}
            />
            <NumberInput
              label="Randomness (r)"
              value={randomness}
              onChange={(v) => setRandomness(Number(v) || 0)}
              min={0}
              max={10}
            />
          </Group>
          <Button onClick={handleCommit} variant="light">
            Commit
          </Button>
        </Stack>
      </Paper>

      {commitment && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Commitment Result
            </Text>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>g^v mod p</Table.Td>
                  <Table.Td>
                    <Code>{commitment.gPart.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>h^r mod p</Table.Td>
                  <Table.Td>
                    <Code>{commitment.hPart.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>C = g^v * h^r mod p</Table.Td>
                  <Table.Td>
                    <Code fw={700}>{commitment.commitment.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            <Text size="sm" fw={600} mt="md">
              Verify
            </Text>
            <Group grow>
              <NumberInput
                label="Value"
                value={verifyVal}
                onChange={(v) => setVerifyVal(Number(v) || 0)}
                min={0}
                max={22}
              />
              <NumberInput
                label="Randomness"
                value={verifyRand}
                onChange={(v) => setVerifyRand(Number(v) || 0)}
                min={0}
                max={10}
              />
            </Group>
            <Button onClick={handleVerify} variant="light" color="green">
              Verify
            </Button>
            {verified !== null && (
              <Badge variant="light" color={verified ? "green" : "red"}>
                {verified ? "Valid" : "Invalid"}
              </Badge>
            )}
          </Stack>
        </Paper>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Homomorphic Property
          </Text>
          <Text size="sm" c="dimmed">
            commit(v1, r1) * commit(v2, r2) = commit(v1+v2, r1+r2)
          </Text>
          <Group grow>
            <NumberInput
              label="v1"
              value={v1}
              onChange={(v) => setV1(Number(v) || 0)}
              min={0}
              max={10}
            />
            <NumberInput
              label="r1"
              value={r1}
              onChange={(v) => setR1(Number(v) || 0)}
              min={0}
              max={10}
            />
            <NumberInput
              label="v2"
              value={v2}
              onChange={(v) => setV2(Number(v) || 0)}
              min={0}
              max={10}
            />
            <NumberInput
              label="r2"
              value={r2}
              onChange={(v) => setR2(Number(v) || 0)}
              min={0}
              max={10}
            />
          </Group>
          <Button onClick={handleHomomorphic} variant="light" color="violet">
            Demonstrate
          </Button>
        </Stack>
      </Paper>

      {homoResult && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Homomorphic Result
            </Text>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>C1 = commit(v1, r1)</Table.Td>
                  <Table.Td>
                    <Code>{homoResult.c1.commitment.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>C2 = commit(v2, r2)</Table.Td>
                  <Table.Td>
                    <Code>{homoResult.c2.commitment.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>C1 * C2 mod p</Table.Td>
                  <Table.Td>
                    <Code>{homoResult.product.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>commit(v1+v2, r1+r2)</Table.Td>
                  <Table.Td>
                    <Code>{homoResult.combined.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <Badge variant="light" color={homoResult.matches ? "green" : "red"}>
              {homoResult.matches
                ? "Match — homomorphism verified!"
                : "Mismatch"}
            </Badge>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
