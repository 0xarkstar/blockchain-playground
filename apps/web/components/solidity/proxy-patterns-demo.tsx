"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  SegmentedControl,
  TextInput,
  Button,
  Table,
  Badge,
  Group,
  Text,
  Alert,
  Code,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  getProxyInfo,
  createProxyState,
  simulateUpgrade,
  visualizeDelegatecall,
  getEIP1967Slots,
  type ProxyType,
  type ProxyState,
} from "../../lib/solidity/proxy";
import { EducationPanel } from "../../components/shared";

const PROXY_TYPES: { value: ProxyType; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "uups", label: "UUPS" },
  { value: "diamond", label: "Diamond" },
];

export function ProxyPatternsDemo() {
  const [proxyType, setProxyType] = useState<ProxyType>("transparent");
  const [newImpl, setNewImpl] = useState("0xImplV2");
  const [caller, setCaller] = useState("0xAdmin");
  const [state, setState] = useState<ProxyState>(
    createProxyState("transparent", "0xadmin"),
  );

  const info = useMemo(() => getProxyInfo(proxyType), [proxyType]);
  const slots = useMemo(() => getEIP1967Slots(), []);

  const viz = useMemo(
    () =>
      visualizeDelegatecall(
        "0xUser",
        "0xProxy",
        state.implementation || "0xImpl",
      ),
    [state.implementation],
  );

  const handleTypeChange = (type: ProxyType) => {
    setProxyType(type);
    setState(createProxyState(type, state.admin));
  };

  const handleUpgrade = () => {
    const result = simulateUpgrade(state, newImpl, caller);
    setState(result.state);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Proxy Architecture
          </Text>
          <Paper p="md" withBorder bg="gray.0">
            <Group gap="md" justify="center" align="flex-start">
              <Paper
                p="sm"
                withBorder
                bg="blue.1"
                style={{ minWidth: 120, textAlign: "center" }}
              >
                <Text size="xs" fw={700}>
                  Proxy Contract
                </Text>
                <Text size="xs" c="dimmed">
                  Stores state
                </Text>
                <Text size="xs" c="dimmed">
                  Fixed address
                </Text>
                <Badge size="xs" variant="light" color="blue" mt={4}>
                  {proxyType}
                </Badge>
              </Paper>
              <Stack
                gap={2}
                align="center"
                justify="center"
                style={{ paddingTop: 20 }}
              >
                <Text size="xs" fw={600}>
                  DELEGATECALL
                </Text>
                <Text size="xs" c="dimmed">
                  ----&gt;
                </Text>
              </Stack>
              <Paper
                p="sm"
                withBorder
                bg="green.1"
                style={{ minWidth: 120, textAlign: "center" }}
              >
                <Text size="xs" fw={700}>
                  Implementation
                </Text>
                <Text size="xs" c="dimmed">
                  Contains logic
                </Text>
                <Text size="xs" c="dimmed">
                  Replaceable
                </Text>
                <Badge size="xs" variant="light" color="green" mt={4}>
                  {state.implementation}
                </Badge>
              </Paper>
            </Group>
            <Paper
              p="xs"
              mt="sm"
              withBorder
              bg="yellow.0"
              style={{ textAlign: "center" }}
            >
              <Text size="xs" c="dimmed">
                Storage lives in Proxy, not Implementation. Upgrades only change
                the logic pointer.
              </Text>
            </Paper>
          </Paper>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Proxy Type
          </Text>
          <SegmentedControl
            data={PROXY_TYPES}
            value={proxyType}
            onChange={(v) => handleTypeChange(v as ProxyType)}
            fullWidth
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            {info.name}
          </Text>
          <Text size="sm" c="dimmed">
            {info.description}
          </Text>
          <Group grow>
            <Stack gap="xs">
              <Text size="xs" fw={600} c="green">
                Pros
              </Text>
              {info.pros.map((pro, i) => (
                <Text key={i} size="xs">
                  + {pro}
                </Text>
              ))}
            </Stack>
            <Stack gap="xs">
              <Text size="xs" fw={600} c="red">
                Cons
              </Text>
              {info.cons.map((con, i) => (
                <Text key={i} size="xs">
                  - {con}
                </Text>
              ))}
            </Stack>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Upgrade Simulation
          </Text>
          <Group grow>
            <TextInput
              label="Admin"
              value={state.admin}
              readOnly
              variant="filled"
            />
            <TextInput
              label="Caller"
              value={caller}
              onChange={(e) => setCaller(e.currentTarget.value)}
            />
            <TextInput
              label="New Implementation"
              value={newImpl}
              onChange={(e) => setNewImpl(e.currentTarget.value)}
            />
          </Group>
          <Button onClick={handleUpgrade}>Upgrade</Button>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Current Implementation</Table.Td>
                <Table.Td ta="right">
                  <Code>{state.implementation}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Admin</Table.Td>
                <Table.Td ta="right">
                  <Code>{state.admin}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Previous Implementations</Table.Td>
                <Table.Td ta="right">
                  {state.previousImplementations.length > 0 ? (
                    state.previousImplementations.map((impl, i) => (
                      <Badge key={i} size="xs" variant="outline" mr={4}>
                        {impl}
                      </Badge>
                    ))
                  ) : (
                    <Text size="xs" c="dimmed">
                      None
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Delegatecall Flow
          </Text>
          {viz.steps.map((step) => (
            <Alert
              key={step.step}
              icon={
                <Badge size="xs" circle>
                  {step.step}
                </Badge>
              }
              variant="light"
              color="blue"
            >
              <Text size="sm" fw={600}>
                {step.from} → {step.to}
              </Text>
              <Text size="xs">{step.description}</Text>
              <Text size="xs" c="dimmed">
                {step.context}
              </Text>
            </Alert>
          ))}
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Storage Owner</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light" color="blue">
                    {viz.storageOwner}
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Code Source</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light" color="violet">
                    {viz.codeSource}
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>msg.sender</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light">{viz.msgSender}</Badge>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            EIP-1967 Storage Slots
          </Text>
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="gray"
            variant="light"
          >
            Standardized storage slots prevent collisions between proxy and
            implementation state.
          </Alert>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Slot</Table.Th>
                <Table.Th>Address</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Implementation</Table.Td>
                <Table.Td>
                  <Code style={{ fontSize: 10, wordBreak: "break-all" }}>
                    {slots.implementation}
                  </Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Admin</Table.Td>
                <Table.Td>
                  <Code style={{ fontSize: 10, wordBreak: "break-all" }}>
                    {slots.admin}
                  </Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Beacon</Table.Td>
                <Table.Td>
                  <Code style={{ fontSize: 10, wordBreak: "break-all" }}>
                    {slots.beacon}
                  </Code>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <EducationPanel
        howItWorks={[
          {
            title: "Transparent Proxy",
            description:
              "Admin calls go to proxy (upgrade logic). User calls are delegated to implementation. Admin cannot call implementation functions.",
          },
          {
            title: "UUPS Proxy",
            description:
              "Upgrade logic lives in the implementation contract itself. Cheaper to deploy but requires implementation to include upgrade function.",
          },
          {
            title: "Diamond (EIP-2535)",
            description:
              "Multiple implementation contracts (facets). Enables modular upgrades — change one facet without affecting others.",
          },
        ]}
        whyItMatters="Smart contracts are immutable by default. Proxy patterns enable upgradeable contracts, allowing teams to fix bugs and add features while preserving state and contract address."
        tips={[
          "EIP-1967 standardizes storage slots to prevent proxy-implementation collisions",
          "Always use initializers (not constructors) in implementation contracts",
          "Test upgrades thoroughly — storage layout changes can corrupt state",
          "Consider using OpenZeppelin Upgrades plugins for safe deployments",
        ]}
      />
    </Stack>
  );
}
