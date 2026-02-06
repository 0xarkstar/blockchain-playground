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
} from "@mantine/core";
import { IconArrowsExchange, IconInfoCircle } from "@tabler/icons-react";

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

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        This demo shows the anatomy of a transaction. Connect a wallet and use
        Base Sepolia testnet to actually send transactions.
      </Alert>

      <Stepper
        active={activeStep}
        onStepClick={setActiveStep}
      >
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
                <Code block>
                  {JSON.stringify(txData, null, 2)}
                </Code>
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
                will be sent to Base Sepolia testnet. Get test ETH from a faucet.
              </Text>
            </Stack>
          </Paper>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}
