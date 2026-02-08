"use client";

import { useState } from "react";
import {
  Stack,
  TextInput,
  NumberInput,
  Button,
  Text,
  Paper,
  Group,
  Badge,
  Code,
  Alert,
  Stepper,
  Box,
} from "@mantine/core";
import { IconArrowsExchange, IconInfoCircle } from "@tabler/icons-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";

function TransactionFlowDiagram({
  txData,
}: {
  txData: Record<string, string> | null;
}) {
  return (
    <Paper p="md" withBorder data-testid="tx-flow-diagram">
      <Text size="sm" fw={600} mb="sm">
        Transaction Flow
      </Text>
      <Box style={{ display: "flex", justifyContent: "center" }}>
        <svg width="300" height="200" viewBox="0 0 300 200">
          {/* Sender */}
          <rect
            x="10"
            y="70"
            width="70"
            height="60"
            rx="8"
            fill="var(--mantine-color-blue-1)"
            stroke="var(--mantine-color-blue-5)"
            strokeWidth="2"
          />
          <text
            x="45"
            y="95"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            Sender
          </text>
          <text
            x="45"
            y="115"
            textAnchor="middle"
            fontSize="8"
            fill="var(--mantine-color-dimmed)"
          >
            Signs TX
          </text>

          {/* Arrow 1 */}
          <line
            x1="80"
            y1="100"
            x2="105"
            y2="100"
            stroke="var(--mantine-color-gray-5)"
            strokeWidth="2"
          />
          <polygon
            points="105,95 115,100 105,105"
            fill="var(--mantine-color-gray-5)"
          />

          {/* Transaction box */}
          <rect
            x="115"
            y="50"
            width="70"
            height="100"
            rx="8"
            fill={
              txData
                ? "var(--mantine-color-green-1)"
                : "var(--mantine-color-gray-1)"
            }
            stroke={
              txData
                ? "var(--mantine-color-green-5)"
                : "var(--mantine-color-gray-4)"
            }
            strokeWidth="2"
          />
          <text
            x="150"
            y="75"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
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
                fill="var(--mantine-color-dimmed)"
              >
                {txData.value}
              </text>
              <text
                x="150"
                y="110"
                textAnchor="middle"
                fontSize="7"
                fill="var(--mantine-color-dimmed)"
              >
                Gas: {txData.gasLimit}
              </text>
              <text
                x="150"
                y="125"
                textAnchor="middle"
                fontSize="7"
                fill="var(--mantine-color-dimmed)"
              >
                {txData.type}
              </text>
              <text
                x="150"
                y="140"
                textAnchor="middle"
                fontSize="7"
                fill="var(--mantine-color-dimmed)"
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
              fill="var(--mantine-color-dimmed)"
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
            stroke="var(--mantine-color-gray-5)"
            strokeWidth="2"
          />
          <polygon
            points="210,95 220,100 210,105"
            fill="var(--mantine-color-gray-5)"
          />

          {/* Recipient */}
          <rect
            x="220"
            y="70"
            width="70"
            height="60"
            rx="8"
            fill="var(--mantine-color-orange-1)"
            stroke="var(--mantine-color-orange-5)"
            strokeWidth="2"
          />
          <text
            x="255"
            y="95"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            Recipient
          </text>
          <text
            x="255"
            y="115"
            textAnchor="middle"
            fontSize="8"
            fill="var(--mantine-color-dimmed)"
          >
            {txData ? txData.to.slice(0, 8) + "..." : "0x..."}
          </text>
        </svg>
      </Box>
    </Paper>
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

  const inputPanel = (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        This demo shows the anatomy of a transaction. Connect a wallet and use
        Base Sepolia testnet to actually send transactions.
      </Alert>

      <Stepper active={activeStep} onStepClick={setActiveStep}>
        <Stepper.Step label="Build" description="Configure transaction">
          <Paper p="md" withBorder mt="md">
            <Stack gap="md">
              <TextInput
                label="Recipient Address"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.currentTarget.value)}
              />
              <NumberInput
                label="Value (ETH)"
                value={value}
                onChange={(v) => setValue(Number(v))}
                min={0}
                step={0.001}
                decimalScale={6}
              />
              <Button
                leftSection={<IconArrowsExchange size={16} />}
                onClick={handleBuildTransaction}
                disabled={!to}
              >
                Build Transaction
              </Button>
            </Stack>
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Review" description="Transaction details">
          {txData && (
            <Paper p="md" withBorder mt="md">
              <Stack gap="sm">
                <Text size="sm" fw={600}>
                  Transaction Object
                </Text>
                <Code block>{JSON.stringify(txData, null, 2)}</Code>
                <Group gap="xs">
                  <Badge variant="light">EIP-1559</Badge>
                  <Badge variant="light" color="green">
                    Base Sepolia
                  </Badge>
                </Group>
                <Button onClick={() => setActiveStep(2)} variant="outline">
                  Proceed to Sign
                </Button>
              </Stack>
            </Paper>
          )}
        </Stepper.Step>

        <Stepper.Step label="Sign & Send" description="Submit on-chain">
          <Paper p="md" withBorder mt="md">
            <Stack gap="md">
              <Alert icon={<IconInfoCircle size={16} />} color="yellow">
                Connect your wallet with the header button to sign and send this
                transaction on Base Sepolia.
              </Alert>
              <Text size="sm" c="dimmed">
                Transaction signing requires a connected wallet. The transaction
                will be sent to Base Sepolia testnet. Get test ETH from a
                faucet.
              </Text>
            </Stack>
          </Paper>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      <TransactionFlowDiagram txData={txData} />
    </Stack>
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
