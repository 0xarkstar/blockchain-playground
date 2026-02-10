"use client";

import { useState } from "react";
import { ArrowLeftRight, Info } from "lucide-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

function TransactionFlowDiagram({
  txData,
}: {
  txData: Record<string, string> | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4" data-testid="tx-flow-diagram">
      <p className="text-sm font-semibold mb-2">
        Transaction Flow
      </p>
      <div className="flex justify-center">
        <svg width="300" height="200" viewBox="0 0 300 200">
          {/* Sender */}
          <rect
            x="10"
            y="70"
            width="70"
            height="60"
            rx="8"
            style={{ fill: "var(--viz-blue)", fillOpacity: 0.15, stroke: "var(--viz-blue)" }}
            strokeWidth="2"
          />
          <text
            x="45"
            y="95"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            Sender
          </text>
          <text
            x="45"
            y="115"
            textAnchor="middle"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
          >
            Signs TX
          </text>

          {/* Arrow 1 */}
          <line
            x1="80"
            y1="100"
            x2="105"
            y2="100"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
          />
          <polygon
            points="105,95 115,100 105,105"
            fill="hsl(var(--muted-foreground))"
          />

          {/* Transaction box */}
          <rect
            x="115"
            y="50"
            width="70"
            height="100"
            rx="8"
            style={{
              fill: txData
                ? "var(--viz-green)"
                : "hsl(var(--muted))",
              fillOpacity: txData ? 0.15 : undefined,
              stroke: txData
                ? "var(--viz-green)"
                : "hsl(var(--muted-foreground) / 0.3)",
            }}
            strokeWidth="2"
          />
          <text
            x="150"
            y="75"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            Transaction
          </text>
          {txData ? (
            <>
              <text
                x="150"
                y="95"
                textAnchor="middle"
                fontSize="7"
                fill="hsl(var(--muted-foreground))"
              >
                {txData.value}
              </text>
              <text
                x="150"
                y="110"
                textAnchor="middle"
                fontSize="7"
                fill="hsl(var(--muted-foreground))"
              >
                Gas: {txData.gasLimit}
              </text>
              <text
                x="150"
                y="125"
                textAnchor="middle"
                fontSize="7"
                fill="hsl(var(--muted-foreground))"
              >
                {txData.type}
              </text>
              <text
                x="150"
                y="140"
                textAnchor="middle"
                fontSize="7"
                fill="hsl(var(--muted-foreground))"
              >
                Chain: Base Sepolia
              </text>
            </>
          ) : (
            <text
              x="150"
              y="105"
              textAnchor="middle"
              fontSize="8"
              fill="hsl(var(--muted-foreground))"
            >
              Build to see
            </text>
          )}

          {/* Arrow 2 */}
          <line
            x1="185"
            y1="100"
            x2="210"
            y2="100"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
          />
          <polygon
            points="210,95 220,100 210,105"
            fill="hsl(var(--muted-foreground))"
          />

          {/* Recipient */}
          <rect
            x="220"
            y="70"
            width="70"
            height="60"
            rx="8"
            style={{ fill: "var(--viz-orange)", fillOpacity: 0.15, stroke: "var(--viz-orange)" }}
            strokeWidth="2"
          />
          <text
            x="255"
            y="95"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            Recipient
          </text>
          <text
            x="255"
            y="115"
            textAnchor="middle"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
          >
            {txData ? txData.to.slice(0, 8) + "..." : "0x..."}
          </text>
        </svg>
      </div>
    </div>
  );
}

export function TransactionBuilderDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [to, setTo] = useState("");
  const [value, setValue] = useState<number>(0.001);
  const [txData, setTxData] = useState<Record<string, string> | null>(null);

  const handleBuildTransaction = () => {
    setTxData({
      to,
      value: `${value} ETH`,
      valueWei: `${BigInt(Math.floor(value * 1e18))}`,
      gasLimit: "21000",
      type: "EIP-1559",
      chainId: "84532 (Base Sepolia)",
    });
    setActiveStep(1);
  };

  const steps = [
    { label: "Build", description: "Configure transaction" },
    { label: "Review", description: "Transaction details" },
    { label: "Sign & Send", description: "Submit on-chain" },
  ];

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <Alert className="border-blue-500">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This demo shows the anatomy of a transaction. Connect a wallet and use
          Base Sepolia testnet to actually send transactions.
        </AlertDescription>
      </Alert>

      {/* Stepper header */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeStep === i
                  ? "bg-primary text-primary-foreground"
                  : activeStep > i
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </Button>
            {i < steps.length - 1 && (
              <div className="h-px w-4 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {activeStep === 0 && (
        <div className="rounded-lg border border-border bg-card p-4 mt-4">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="tx-recipient">Recipient Address</Label>
              <Input
                id="tx-recipient"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tx-value">Value (ETH)</Label>
              <Input
                id="tx-value"
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                min={0}
                step={0.001}
              />
            </div>
            <Button
              onClick={handleBuildTransaction}
              disabled={!to}
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Build Transaction
            </Button>
          </div>
        </div>
      )}

      {activeStep === 1 && txData && (
        <div className="rounded-lg border border-border bg-card p-4 mt-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Transaction Object
            </p>
            <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto">
              <code>{JSON.stringify(txData, null, 2)}</code>
            </pre>
            <div className="flex items-center gap-1">
              <Badge variant="secondary">EIP-1559</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Base Sepolia
              </Badge>
            </div>
            <Button onClick={() => setActiveStep(2)} variant="outline">
              Proceed to Sign
            </Button>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="rounded-lg border border-border bg-card p-4 mt-4">
          <div className="flex flex-col gap-4">
            <Alert className="border-yellow-500">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Connect your wallet with the header button to sign and send this
                transaction on Base Sepolia.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Transaction signing requires a connected wallet. The transaction
              will be sent to Base Sepolia testnet. Get test ETH from a
              faucet.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      <TransactionFlowDiagram txData={txData} />
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
              title: "Build Transaction",
              description:
                "Specify the recipient, value, gas limit, and chain. The transaction object is constructed with all necessary fields.",
            },
            {
              title: "Sign with Private Key",
              description:
                "The sender's wallet signs the transaction using their private key, proving ownership without revealing the key.",
            },
            {
              title: "Broadcast to Network",
              description:
                "The signed transaction is sent to the network. Validators include it in a block.",
            },
            {
              title: "Confirmation",
              description:
                "Once included in a mined/finalized block, the transaction is confirmed and the state is updated.",
            },
          ]}
          whyItMatters="Transactions are the only way to change state on a blockchain. Understanding their structure (nonce, gas, value, data) is essential for building dApps and interacting with smart contracts."
          tips={[
            "EIP-1559 introduced a base fee + priority fee model for more predictable gas pricing",
            "The gas limit of 21000 is the minimum for a simple ETH transfer",
            "Value is specified in Wei (1 ETH = 10^18 Wei) at the protocol level",
          ]}
        />
      }
    />
  );
}
