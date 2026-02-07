"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  TextInput,
  Select,
  Button,
  Table,
  Badge,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createInitialState,
  grantRole,
  revokeRole,
  renounceRole,
  transferOwnership,
  checkFunctionAccess,
  hasRole,
  DEFAULT_ADMIN_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  type AccessControlState,
} from "../../lib/solidity/access-control";

const ROLES = [DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE];
const ROLE_LABELS: Record<string, string> = {
  [DEFAULT_ADMIN_ROLE]: "DEFAULT_ADMIN_ROLE",
  [MINTER_ROLE]: "MINTER_ROLE",
  [PAUSER_ROLE]: "PAUSER_ROLE",
};

interface LogEntry {
  readonly action: string;
  readonly success: boolean;
  readonly message: string;
}

export function AccessControlDemo() {
  const [state, setState] = useState<AccessControlState>(
    createInitialState("0xOwner"),
  );
  const [caller, setCaller] = useState("0xOwner");
  const [targetAccount, setTargetAccount] = useState("0xAlice");
  const [selectedRole, setSelectedRole] = useState(MINTER_ROLE);
  const [checkCaller, setCheckCaller] = useState("0xAlice");
  const [checkRole, setCheckRole] = useState("onlyOwner");
  const [logs, setLogs] = useState<readonly LogEntry[]>([]);

  const addLog = (entry: LogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 20));
  };

  const handleGrant = () => {
    const result = grantRole(state, selectedRole, targetAccount, caller);
    setState(result.state);
    addLog({
      action: "grantRole",
      success: result.success,
      message: result.message,
    });
  };

  const handleRevoke = () => {
    const result = revokeRole(state, selectedRole, targetAccount, caller);
    setState(result.state);
    addLog({
      action: "revokeRole",
      success: result.success,
      message: result.message,
    });
  };

  const handleRenounce = () => {
    const result = renounceRole(state, selectedRole, caller);
    setState(result.state);
    addLog({
      action: "renounceRole",
      success: result.success,
      message: result.message,
    });
  };

  const handleTransfer = () => {
    const result = transferOwnership(state, targetAccount, caller);
    setState(result.state);
    addLog({
      action: "transferOwnership",
      success: result.success,
      message: result.message,
    });
  };

  const accessCheck = useMemo(
    () => checkFunctionAccess(state, checkCaller, checkRole),
    [state, checkCaller, checkRole],
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Contract State
          </Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Owner</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light">{state.owner}</Badge>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <Text size="xs" fw={600}>
            Role Memberships
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Role</Table.Th>
                <Table.Th>Members</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ROLES.map((roleId) => (
                <Table.Tr key={roleId}>
                  <Table.Td>
                    <Badge size="sm" variant="outline">
                      {ROLE_LABELS[roleId]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {hasRole(state, roleId, state.owner) ||
                    (state.roles[roleId]?.members.length ?? 0) > 0
                      ? (state.roles[roleId]?.members.join(", ") ?? "none")
                      : "none"}
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
            Role Management
          </Text>
          <Group grow>
            <TextInput
              label="Caller (msg.sender)"
              value={caller}
              onChange={(e) => setCaller(e.currentTarget.value)}
            />
            <TextInput
              label="Target Account"
              value={targetAccount}
              onChange={(e) => setTargetAccount(e.currentTarget.value)}
            />
          </Group>
          <Select
            label="Role"
            data={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r }))}
            value={selectedRole}
            onChange={(v) => v && setSelectedRole(v)}
          />
          <Group>
            <Button size="xs" color="green" onClick={handleGrant}>
              Grant
            </Button>
            <Button size="xs" color="red" onClick={handleRevoke}>
              Revoke
            </Button>
            <Button size="xs" color="yellow" onClick={handleRenounce}>
              Renounce
            </Button>
            <Button size="xs" color="violet" onClick={handleTransfer}>
              Transfer Ownership
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Function Access Check
          </Text>
          <Group grow>
            <TextInput
              label="Caller"
              value={checkCaller}
              onChange={(e) => setCheckCaller(e.currentTarget.value)}
            />
            <Select
              label="Required Role"
              data={[
                { value: "onlyOwner", label: "onlyOwner" },
                ...ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r })),
              ]}
              value={checkRole}
              onChange={(v) => v && setCheckRole(v)}
            />
          </Group>
          <Alert
            icon={<IconInfoCircle size={16} />}
            color={accessCheck.allowed ? "green" : "red"}
          >
            {accessCheck.allowed ? "ALLOWED" : "DENIED"}: {accessCheck.reason}
          </Alert>
        </Stack>
      </Paper>

      {logs.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Transaction Log
            </Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Message</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.map((log, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Badge size="xs" variant="outline">
                        {log.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" color={log.success ? "green" : "red"}>
                        {log.success ? "PASS" : "REVERT"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{log.message}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
