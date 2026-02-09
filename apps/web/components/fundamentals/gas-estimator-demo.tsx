"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { SimpleBarChart } from "../shared/charts";
import { OnChainSection } from "../shared/on-chain-section";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface GasOperation {
  name: string;
  gasUsed: number;
  description: string;
  category: "storage" | "computation" | "transfer" | "contract";
}

const GAS_OPERATIONS: GasOperation[] = [
  {
    name: "ETH Transfer",
    gasUsed: 21000,
    description: "Simple ETH send",
    category: "transfer",
  },
  {
    name: "SSTORE (new)",
    gasUsed: 20000,
    description: "Write new storage slot",
    category: "storage",
  },
  {
    name: "SSTORE (update)",
    gasUsed: 5000,
    description: "Update existing storage slot",
    category: "storage",
  },
  {
    name: "SLOAD",
    gasUsed: 2100,
    description: "Read storage slot",
    category: "storage",
  },
  {
    name: "ERC-20 Transfer",
    gasUsed: 65000,
    description: "Token transfer",
    category: "contract",
  },
  {
    name: "ERC-20 Approve",
    gasUsed: 46000,
    description: "Token approval",
    category: "contract",
  },
  {
    name: "NFT Mint",
    gasUsed: 150000,
    description: "Mint a new NFT",
    category: "contract",
  },
  {
    name: "Uniswap Swap",
    gasUsed: 184000,
    description: "DEX token swap",
    category: "contract",
  },
  {
    name: "Contract Deploy (small)",
    gasUsed: 500000,
    description: "Deploy simple contract",
    category: "contract",
  },
  {
    name: "Keccak256",
    gasUsed: 36,
    description: "Hash 32 bytes",
    category: "computation",
  },
  {
    name: "ECRECOVER",
    gasUsed: 3000,
    description: "Signature verification",
    category: "computation",
  },
  {
    name: "LOG1",
    gasUsed: 750,
    description: "Emit event with 1 topic",
    category: "computation",
  },
];

const categoryColors = {
  storage: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  computation: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  transfer: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  contract: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
} as const;

export function GasEstimatorDemo() {
  const [gasPrice, setGasPrice] = useState<number>(0.5);
  const [ethPrice, setEthPrice] = useState<number>(3000);

  const computeCost = (gasUsed: number) => {
    const ethCost = gasUsed * gasPrice * 1e-9;
    const usdCost = ethCost * ethPrice;
    return { ethCost, usdCost };
  };

  const chartData = useMemo(
    () =>
      GAS_OPERATIONS.filter((op) => op.gasUsed >= 1000).map((op) => ({
        name: op.name,
        gas: op.gasUsed,
      })),
    [],
  );

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Gas Price (Gwei)</Label>
          <Input
            type="number"
            value={gasPrice}
            onChange={(e) => setGasPrice(Number(e.target.value))}
            min={0.01}
            step={0.1}
          />
        </div>
        <div>
          <Label>ETH Price (USD)</Label>
          <Input
            type="number"
            value={ethPrice}
            onChange={(e) => setEthPrice(Number(e.target.value))}
            min={1}
            step={100}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Operation</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Gas Used</TableHead>
            <TableHead>Cost (ETH)</TableHead>
            <TableHead>Cost (USD)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {GAS_OPERATIONS.map((op) => {
            const { ethCost, usdCost } = computeCost(op.gasUsed);
            return (
              <TableRow key={op.name}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">
                      {op.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {op.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${categoryColors[op.category]}`}
                  >
                    {op.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-mono">
                    {op.gasUsed.toLocaleString()}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-mono">
                    {ethCost < 0.000001
                      ? ethCost.toExponential(2)
                      : ethCost.toFixed(6)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-mono">
                    ${usdCost < 0.01 ? usdCost.toFixed(6) : usdCost.toFixed(4)}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Gas costs are approximate estimates. Actual costs depend on network
          conditions, contract complexity, and EVM state.
        </AlertDescription>
      </Alert>
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4" data-testid="gas-comparison-chart">
        <p className="text-sm font-semibold mb-2">
          Gas Cost Comparison
        </p>
        <SimpleBarChart
          data={chartData}
          xKey="name"
          yKeys={["gas"]}
          height={300}
          grouped
        />
        <p className="text-xs text-muted-foreground mt-1">
          Comparing gas costs across operations (1,000+ gas only). Contract
          deployment is the most expensive.
        </p>
      </div>
    </div>
  );

  return (
    <DemoLayout
      inputPanel={inputPanel}
      resultPanel={resultPanel}
      learnContent={
        <EducationPanel
          howItWorks={[
            {
              title: "Gas Units",
              description:
                "Every EVM operation has a fixed gas cost. Simple operations cost few gas units; storage writes are expensive.",
            },
            {
              title: "Gas Price",
              description:
                "Users bid a gas price (in Gwei) they are willing to pay per unit. Higher prices = faster inclusion.",
            },
            {
              title: "Total Cost",
              description:
                "Total cost = gas used x gas price. This is paid in ETH from the sender's account.",
              details: [
                "1 Gwei = 0.000000001 ETH",
                "Gas limit caps the maximum gas a tx can consume",
              ],
            },
          ]}
          whyItMatters="Gas is the EVM's resource metering system. It prevents infinite loops, compensates validators, and creates a fee market. Understanding gas costs is essential for writing efficient smart contracts and estimating transaction fees."
          tips={[
            "Storage operations (SSTORE) are among the most expensive — minimize on-chain storage",
            "A simple ETH transfer always costs exactly 21,000 gas",
            "L2 chains like Base offer significantly lower gas costs than Ethereum mainnet",
          ]}
        />
      }
      onChainContent={
        <OnChainSection
          contractName="GasTestContract"
          contractDescription="A companion contract with various operations (storage read/write, hashing, loops, events) designed for measuring real gas costs on-chain. Deploy it and call each function to compare actual gas usage against the estimates shown in the demo."
          network="Base Sepolia"
          functions={[
            {
              name: "storageWrite",
              signature:
                "function storageWrite(uint256 key, uint256 value) external",
              description:
                "Write a value to a storage mapping slot (SSTORE operation).",
            },
            {
              name: "storageRead",
              signature:
                "function storageRead(uint256 key) external view returns (uint256)",
              description:
                "Read a value from a storage mapping slot (SLOAD operation).",
            },
            {
              name: "arrayPush",
              signature: "function arrayPush(uint256 value) external",
              description: "Push a value to a dynamic storage array.",
            },
            {
              name: "hashData",
              signature:
                "function hashData(bytes calldata data) external pure returns (bytes32)",
              description: "Compute keccak256 hash of input data.",
            },
            {
              name: "computeLoop",
              signature:
                "function computeLoop(uint256 iterations) external pure returns (uint256)",
              description:
                "Execute a computation loop to measure gas scaling with iteration count.",
            },
            {
              name: "storeWithEvent",
              signature:
                "function storeWithEvent(uint256 key, uint256 value) external",
              description:
                "Write to storage and emit a DataStored event, measuring combined gas cost.",
            },
          ]}
        />
      }
    />
  );
}
