"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Plus, Trash2, Play, SkipForward, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  createInitialEvmState,
  executeInstruction,
  executeProgram,
  getAllOpcodes,
  type Instruction,
  type EvmState,
} from "../../lib/solidity/evm";
import { SimpleBarChart, EducationPanel } from "../../components/shared";

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
    EXAMPLE_PROGRAMS[0]!.instructions.map((instr, i) => ({ ...instr, id: i })),
  );
  const [newOpcode, setNewOpcode] = useState("PUSH1");
  const [newOperand, setNewOperand] = useState("0");
  const [currentStep, setCurrentStep] = useState(-1);
  const [state, setState] = useState<EvmState>(createInitialEvmState());

  const fullResult = useMemo(
    () => executeProgram(instructions),
    [instructions],
  );

  const stackHeightData = useMemo(() => {
    const data: Record<string, unknown>[] = [{ step: "Init", height: 0 }];
    let tempState = createInitialEvmState();
    for (let i = 0; i < instructions.length; i++) {
      if (tempState.halted) break;
      tempState = executeInstruction(tempState, instructions[i]!);
      data.push({
        step: `${i}: ${instructions[i]!.opcode}`,
        height: tempState.stack.length,
      });
    }
    return data;
  }, [instructions]);

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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Templates</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {EXAMPLE_PROGRAMS.map((prog, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                onClick={() => loadExample(i)}
              >
                {prog.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Instructions</p>
          <div className="flex items-center gap-2">
            <Select value={newOpcode} onValueChange={(v) => setNewOpcode(v)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opcodeList.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {needsOperand(newOpcode) && (
              <Input
                placeholder="Operand"
                value={newOperand}
                onChange={(e) => setNewOperand(e.target.value)}
                className="w-[120px]"
              />
            )}
            <Button onClick={addInstruction}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">#</TableHead>
                <TableHead>Opcode</TableHead>
                <TableHead>Operand</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructions.map((instr, i) => (
                <TableRow
                  key={instr.id}
                  className={
                    i === currentStep
                      ? "bg-blue-50 dark:bg-blue-950/50"
                      : i < currentStep
                        ? "bg-green-50 dark:bg-green-950/50"
                        : ""
                  }
                >
                  <TableCell>{i}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {instr.opcode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {instr.operand ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                        {instr.operand}
                      </code>
                    ) : (
                      <p className="text-xs text-muted-foreground">—</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeInstruction(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={stepOne}
              disabled={currentStep >= instructions.length - 1 || state.halted}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Step
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={runAll}
            >
              <Play className="h-4 w-4 mr-1" />
              Run All
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Badge variant="secondary">Gas: {state.gasUsed}</Badge>
            {state.error && (
              <Badge className="bg-red-600 text-white">{state.error}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold">Stack (top → bottom)</p>
            {stackEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">Empty</p>
            ) : (
              stackEntries.map((val, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {stackEntries.length - 1 - i}
                  </Badge>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono" style={{ fontSize: 11 }}>
                    {val.toString()}
                  </code>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold">Memory</p>
            {memoryEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">Empty</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offset</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoryEntries.map(([offset, val]) => (
                    <TableRow key={offset}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                          {offset}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono" style={{ fontSize: 10 }}>
                          {val}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold">Storage</p>
            {storageEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">Empty</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storageEntries.map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                          {key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono" style={{ fontSize: 10 }}>
                          {val}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {stackHeightData.length > 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Stack Height After Each Operation
            </p>
            <SimpleBarChart
              data={stackHeightData}
              xKey="step"
              yKeys={["height"]}
              colors={["#7950f2"]}
              height={200}
            />
            <p className="text-xs text-muted-foreground text-center">
              PUSH increases stack height, operations like ADD/MUL consume and
              produce values
            </p>
          </div>
        </div>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "EVM Stack Machine",
            description:
              "The EVM is a stack-based machine. Operations pop inputs from the stack and push results. Max depth: 1024.",
          },
          {
            title: "PUSH/POP",
            description:
              "PUSH1-PUSH32 place constants on the stack. POP removes the top element. DUP and SWAP manipulate stack positions.",
          },
          {
            title: "Storage vs Memory",
            description:
              "SLOAD/SSTORE access persistent storage (expensive). MLOAD/MSTORE access temporary memory (cheap). Stack is cheapest.",
          },
        ]}
        whyItMatters="Understanding EVM assembly helps optimize gas costs and debug low-level contract behavior. Solidity compiles to these opcodes — knowing them reveals what's actually happening on-chain."
        tips={[
          "Each opcode has a fixed gas cost — see the reference table below",
          "Stack depth errors (>16 local vars) are a common Solidity compilation issue",
          "Use Yul (inline assembly) for gas-critical optimizations in Solidity",
        ]}
      />
    </div>
  );
}
