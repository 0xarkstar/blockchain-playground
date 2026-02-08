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
  TextInput,
  Select,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createMemberGroup,
  proveZKMembership,
  verifyZKMembership,
  compareProofs,
  type MemberGroup,
  type ZKMembershipProof,
} from "../../lib/zk/set-membership";

const DEFAULT_MEMBERS = ["alice", "bob", "charlie", "dave"];

export function ZKSetMembershipDemo() {
  const [members] = useState(DEFAULT_MEMBERS);
  const [group, setGroup] = useState<MemberGroup | null>(null);
  const [selectedMember, setSelectedMember] = useState("0");
  const [proof, setProof] = useState<ZKMembershipProof | null>(null);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const comparison = compareProofs();

  const handleCreateGroup = () => {
    setGroup(createMemberGroup(members));
    setProof(null);
    setVerifyResult(null);
  };

  const handleProve = () => {
    if (!group) return;
    const idx = parseInt(selectedMember);
    const p = proveZKMembership(group, idx, `secret_${idx}`);
    setProof(p);
    setVerifyResult(null);
  };

  const handleVerify = () => {
    if (!group || !proof) return;
    setVerifyResult(verifyZKMembership(group.root, proof));
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        Prove you belong to a group without revealing which member you are.
        Members commit to their identity via hash, forming a Merkle tree. A
        Merkle path proves inclusion without exposing the member index.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Group Members
          </Text>
          <Group>
            {members.map((m, i) => (
              <Badge key={i} variant="light">
                {m}
              </Badge>
            ))}
          </Group>
          <Button onClick={handleCreateGroup} variant="light">
            Create Group (build Merkle tree)
          </Button>
        </Stack>
      </Paper>

      {group && (
        <>
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Merkle Tree
              </Text>
              <Text size="sm">
                Root: <Code>{group.root.slice(0, 18)}...</Code>
              </Text>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Member</Table.Th>
                    <Table.Th>Commitment</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {group.members.map((m, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>{members[i]}</Table.Td>
                      <Table.Td>
                        <Code>{m.commitment.slice(0, 18)}...</Code>
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
                Merkle Tree Diagram
              </Text>
              <svg width="100%" height={180} viewBox="0 0 500 180">
                <rect
                  x={200}
                  y={10}
                  width={100}
                  height={32}
                  rx={6}
                  fill="var(--mantine-color-green-light)"
                  stroke="var(--mantine-color-green-6)"
                  strokeWidth={2}
                />
                <text
                  x={250}
                  y={30}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--mantine-color-green-9)"
                >
                  Root
                </text>

                <line
                  x1={250}
                  y1={42}
                  x2={130}
                  y2={65}
                  stroke="var(--mantine-color-gray-5)"
                  strokeWidth={1.5}
                />
                <line
                  x1={250}
                  y1={42}
                  x2={370}
                  y2={65}
                  stroke="var(--mantine-color-gray-5)"
                  strokeWidth={1.5}
                />

                <rect
                  x={80}
                  y={65}
                  width={100}
                  height={32}
                  rx={6}
                  fill="var(--mantine-color-blue-light)"
                  stroke="var(--mantine-color-blue-5)"
                  strokeWidth={1.5}
                />
                <text
                  x={130}
                  y={85}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--mantine-color-blue-8)"
                >
                  H(L0+L1)
                </text>
                <rect
                  x={320}
                  y={65}
                  width={100}
                  height={32}
                  rx={6}
                  fill="var(--mantine-color-blue-light)"
                  stroke="var(--mantine-color-blue-5)"
                  strokeWidth={1.5}
                />
                <text
                  x={370}
                  y={85}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--mantine-color-blue-8)"
                >
                  H(L2+L3)
                </text>

                <line
                  x1={130}
                  y1={97}
                  x2={65}
                  y2={120}
                  stroke="var(--mantine-color-gray-4)"
                  strokeWidth={1}
                />
                <line
                  x1={130}
                  y1={97}
                  x2={195}
                  y2={120}
                  stroke="var(--mantine-color-gray-4)"
                  strokeWidth={1}
                />
                <line
                  x1={370}
                  y1={97}
                  x2={305}
                  y2={120}
                  stroke="var(--mantine-color-gray-4)"
                  strokeWidth={1}
                />
                <line
                  x1={370}
                  y1={97}
                  x2={435}
                  y2={120}
                  stroke="var(--mantine-color-gray-4)"
                  strokeWidth={1}
                />

                {members.map((m, i) => {
                  const x = 15 + i * 130;
                  const isSelected = proof && String(i) === selectedMember;
                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={120}
                        width={100}
                        height={32}
                        rx={6}
                        fill={
                          isSelected
                            ? "var(--mantine-color-violet-light)"
                            : "var(--mantine-color-gray-light)"
                        }
                        stroke={
                          isSelected
                            ? "var(--mantine-color-violet-6)"
                            : "var(--mantine-color-gray-4)"
                        }
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x={x + 50}
                        y={140}
                        textAnchor="middle"
                        fontSize={11}
                        fill={
                          isSelected
                            ? "var(--mantine-color-violet-9)"
                            : "var(--mantine-color-gray-8)"
                        }
                      >
                        {m}
                      </text>
                      {isSelected && (
                        <text
                          x={x + 50}
                          y={165}
                          textAnchor="middle"
                          fontSize={9}
                          fill="var(--mantine-color-violet-6)"
                        >
                          (proving)
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text size="sm" fw={600}>
                Prove Membership
              </Text>
              <Select
                label="I am..."
                value={selectedMember}
                onChange={(v) => setSelectedMember(v ?? "0")}
                data={members.map((m, i) => ({ value: String(i), label: m }))}
              />
              <Group>
                <Button onClick={handleProve} variant="light" color="blue">
                  Generate ZK Proof
                </Button>
                {proof && (
                  <Button onClick={handleVerify} variant="light" color="green">
                    Verify Proof
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>

          {proof && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    Proof
                  </Text>
                  {verifyResult !== null && (
                    <Badge
                      variant="light"
                      color={verifyResult ? "green" : "red"}
                    >
                      {verifyResult ? "Verified" : "Invalid"}
                    </Badge>
                  )}
                </Group>
                <Text size="sm">
                  Path length: {proof.merklePath.length} nodes
                </Text>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Level</Table.Th>
                      <Table.Th>Sibling Hash</Table.Th>
                      <Table.Th>Position</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {proof.merklePath.map((node, i) => (
                      <Table.Tr key={i}>
                        <Table.Td>{i + 1}</Table.Td>
                        <Table.Td>
                          <Code>{node.hash.slice(0, 18)}...</Code>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {node.position}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          )}
        </>
      )}

      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Privacy Comparison
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Approach</Table.Th>
                <Table.Th>Revealed</Table.Th>
                <Table.Th>Implication</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Badge variant="light" color="red">
                    Transparent
                  </Badge>
                </Table.Td>
                <Table.Td>{comparison.transparent.revealed}</Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {comparison.transparent.info}
                  </Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Badge variant="light" color="green">
                    Zero-Knowledge
                  </Badge>
                </Table.Td>
                <Table.Td>{comparison.zk.revealed}</Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {comparison.zk.info}
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
