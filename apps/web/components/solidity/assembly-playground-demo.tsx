"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Stack,
  Paper,
  Select,
  TextInput,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrash, IconPlayerPlay, IconPlayerSkipForward, IconRefresh } from "@tabler/icons-react";
import {
  createInitialEvmState,
  executeInstruction,
  executeProgram,
  getAllOpcodes,
  type Instruction,
  type EvmState,
} from "../../lib/solidity/evm";

interface InstructionWithId extends Instruction {
  readonly id: number;
}

const EXAMPLE_PROGRAMS: { label: string; instructions: Instruction[] }[] = [
  {
    label: "Add 10 + 20",
    instructions: [
      { opcode: "PUSH1", operand: "10" },
      { opcode: "PUSH1", operand: "20" },
      { opcode: "ADD" },
    ],
  },
  {
    label: "Store & Load",
    instructions: [
      { opcode: "PUSH1", operand: "42" },
      { opcode: "PUSH1", operand: "0" },
      { opcode: "SSTORE" },
      { opcode: "PUSH1", operand: "0" },
      { opcode: "SLOAD" },
    ],
  },
  {
    label: "Compare (5 == 5)",
    instructions: [
      { opcode: "PUSH1", operand: "5" },
      { opcode: "PUSH1", operand: "5" },
      { opcode: "EQ" },
    ],
  },
  {
    label: "Multiply 7 * 6",
    instructions: [
      { opcode: "PUSH1", operand: "7" },
      { opcode: "PUSH1", operand: "6" },
      { opcode: "MUL" },
    ],
  },
];

const opcodeList = getAllOpcodes().map((o) => ({
  value: o.opcode,
  label: `${o.opcode} — ${o.description}`,
}));

const needsOperand = (opcode: string) =>
  opcode === "PUSH1" || opcode === "PUSH32";

export function AssemblyPlaygroundDemo() {
  const nextInstrId = useRef(EXAMPLE_PROGRAMS[0]!.instructions.length);
  const [instructions, setInstructions] = useState<InstructionWithId[]>(
    EXAMPLE_PROGRAMS[0]!.instructions.map((instr, i) => ({ ...instr, id: i }))
  );
  const [newOpcode, setNewOpcode] = useState("PUSH1");
  const [newOperand, setNewOperand] = useState("0");
  const [currentStep, setCurrentStep] = useState(-1);
  const [state, setState] = useState<EvmState>(createInitialEvmState());

  const fullResult = useMemo(
    () => executeProgram(instructions),
    [instructions]
  );

  const addInstruction = () => {
    const instr: InstructionWithId = needsOperand(newOpcode)
      ? { id: nextInstrId.current++, opcode: newOpcode, operand: newOperand }
      : { id: nextInstrId.current++, opcode: newOpcode };
    setInstructions([...instructions, instr]);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
    reset();
  };

  const reset = useCallback(() => {
    setCurrentStep(-1);
    setState(createInitialEvmState());
  }, []);

  const stepOne = () => {
    const nextStep = currentStep + 1;
    if (nextStep >= instructions.length) return;
    if (state.halted) return;

    const newState = executeInstruction(state, instructions[nextStep]!);
    setState(newState);
    setCurrentStep(nextStep);
  };

  const runAll = () => {
    reset();
    setCurrentStep(instructions.length - 1);
    setState(fullResult.finalState);
  };

  const loadExample = (index: number) => {
    const prog = EXAMPLE_PROGRAMS[index]!.instructions;
    nextInstrId.current = prog.length;
    setInstructions(prog.map((instr, i) => ({ ...instr, id: i })));
    reset();
  };

  const stackEntries = [...state.stack].reverse();
  const memoryEntries = Object.entries(state.memory);
  const storageEntries = Object.entries(state.storage);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>Templates</Text>
          </Group>
          <Group>
            {EXAMPLE_PROGRAMS.map((prog, i) => (
              <Button key={i} size="xs" variant="outline" onClick={() => loadExample(i)}>
                {prog.label}
              </Button>
            ))}
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Instructions</Text>
          <Group>
            <Select
              data={opcodeList}
              value={newOpcode}
              onChange={(v) => v && setNewOpcode(v)}
              searchable
              style={{ flex: 1 }}
            />
            {needsOperand(newOpcode) && (
              <TextInput
                placeholder="Operand"
                value={newOperand}
                onChange={(e) => setNewOperand(e.currentTarget.value)}
                style={{ width: 120 }}
              />
            )}
            <Button leftSection={<IconPlus size={16} />} onClick={addInstruction}>
              Add
            </Button>
          </Group>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 30 }}>#</Table.Th>
                <Table.Th>Opcode</Table.Th>
                <Table.Th>Operand</Table.Th>
                <Table.Th style={{ width: 40 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {instructions.map((instr, i) => (
                <Table.Tr
                  key={instr.id}
                  style={{
                    backgroundColor: i === currentStep
                      ? "var(--mantine-color-blue-light)"
                      : i < currentStep ? "var(--mantine-color-green-light)" : undefined,
                  }}
                >
                  <Table.Td>{i}</Table.Td>
                  <Table.Td><Badge size="sm" variant="light">{instr.opcode}</Badge></Table.Td>
                  <Table.Td>
                    {instr.operand ? <Code>{instr.operand}</Code> : <Text size="xs" c="dimmed">—</Text>}
                  </Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="subtle" color="red" onClick={() => removeInstruction(i)}>
                      <IconTrash size={14} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group>
            <Button
              leftSection={<IconPlayerSkipForward size={16} />}
              size="xs"
              onClick={stepOne}
              disabled={currentStep >= instructions.length - 1 || state.halted}
            >
              Step
            </Button>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              size="xs"
              color="green"
              onClick={runAll}
            >
              Run All
            </Button>
            <Button
              leftSection={<IconRefresh size={16} />}
              size="xs"
              variant="outline"
              onClick={reset}
            >
              Reset
            </Button>
            <Badge variant="light" color="gray">
              Gas: {state.gasUsed}
            </Badge>
            {state.error && (
              <Badge color="red">{state.error}</Badge>
            )}
          </Group>
        </Stack>
      </Paper>

      <Group grow align="flex-start">
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="xs" fw={600}>Stack (top → bottom)</Text>
            {stackEntries.length === 0 ? (
              <Text size="xs" c="dimmed">Empty</Text>
            ) : (
              stackEntries.map((val, i) => (
                <Group key={i} gap="xs">
                  <Badge size="xs" variant="outline">{stackEntries.length - 1 - i}</Badge>
                  <Code style={{ fontSize: 11 }}>{val.toString()}</Code>
                </Group>
              ))
            )}
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="xs" fw={600}>Memory</Text>
            {memoryEntries.length === 0 ? (
              <Text size="xs" c="dimmed">Empty</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Offset</Table.Th>
                    <Table.Th>Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {memoryEntries.map(([offset, val]) => (
                    <Table.Tr key={offset}>
                      <Table.Td><Code>{offset}</Code></Table.Td>
                      <Table.Td><Code style={{ fontSize: 10 }}>{val}</Code></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="xs" fw={600}>Storage</Text>
            {storageEntries.length === 0 ? (
              <Text size="xs" c="dimmed">Empty</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Key</Table.Th>
                    <Table.Th>Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {storageEntries.map(([key, val]) => (
                    <Table.Tr key={key}>
                      <Table.Td><Code>{key}</Code></Table.Td>
                      <Table.Td><Code style={{ fontSize: 10 }}>{val}</Code></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Paper>
      </Group>
    </Stack>
  );
}
