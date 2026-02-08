"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Text,
  Paper,
  Table,
  Alert,
  Stepper,
} from "@mantine/core";
import { IconBolt, IconCheck, IconX } from "@tabler/icons-react";
import { simulateFlashLoan } from "../../lib/defi/flash-loan";
import { StepCard, EducationPanel } from "../../components/shared";

export function FlashLoanDemo() {
  const [borrowAmount, setBorrowAmount] = useState<number>(100000);
  const [feeRate, setFeeRate] = useState<number>(0.09);
  const [arbitrageProfit, setArbitrageProfit] = useState<number>(500);

  const result = useMemo(() => {
    return simulateFlashLoan(borrowAmount, feeRate / 100, arbitrageProfit);
  }, [borrowAmount, feeRate, arbitrageProfit]);

  const activeStep = result.success ? 3 : 2;

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Flash Loan Parameters
          </Text>
          <NumberInput
            label="Borrow Amount"
            value={borrowAmount}
            onChange={(v) => setBorrowAmount(Number(v) || 0)}
            min={0}
            thousandSeparator=","
            prefix="$"
          />
          <NumberInput
            label="Protocol Fee (%)"
            value={feeRate}
            onChange={(v) => setFeeRate(Number(v) || 0)}
            min={0}
            max={100}
            decimalScale={3}
            suffix="%"
            step={0.01}
          />
          <NumberInput
            label="Arbitrage Profit (before fee)"
            value={arbitrageProfit}
            onChange={(v) => setArbitrageProfit(Number(v) || 0)}
            min={0}
            thousandSeparator=","
            prefix="$"
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Transaction Simulation
          </Text>
          <Stepper active={activeStep} color={result.success ? "green" : "red"}>
            <Stepper.Step
              label="Borrow"
              description={`$${borrowAmount.toLocaleString()}`}
              icon={<IconBolt size={16} />}
            />
            <Stepper.Step
              label="Arbitrage"
              description={`Profit: $${arbitrageProfit.toLocaleString()}`}
            />
            <Stepper.Step
              label="Repay"
              description={`$${result.repayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              icon={
                result.success ? <IconCheck size={16} /> : <IconX size={16} />
              }
            />
          </Stepper>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Result
          </Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Borrow Amount</Table.Td>
                <Table.Td ta="right">${borrowAmount.toLocaleString()}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Protocol Fee</Table.Td>
                <Table.Td ta="right">
                  $
                  {(result.repayAmount - borrowAmount).toLocaleString(
                    undefined,
                    { maximumFractionDigits: 2 },
                  )}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Repay Amount</Table.Td>
                <Table.Td ta="right">
                  $
                  {result.repayAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Net Profit</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c={result.profit > 0 ? "green" : "red"}>
                    $
                    {result.profit.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Flash Loan Steps
          </Text>
          <StepCard
            stepNumber={1}
            title="Borrow"
            description={`Borrow $${borrowAmount.toLocaleString()} from the lending pool in a single transaction.`}
          />
          <StepCard
            stepNumber={2}
            title="Execute Strategy"
            description={`Execute arbitrage or liquidation. Expected profit: $${arbitrageProfit.toLocaleString()}.`}
          />
          <StepCard
            stepNumber={3}
            title="Repay"
            description={`Repay $${result.repayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} (principal + fee). ${result.success ? "Transaction succeeds." : "REVERTS — insufficient funds."}`}
            isLast
          />
        </Stack>
      </Paper>

      <Alert
        icon={result.success ? <IconCheck size={16} /> : <IconX size={16} />}
        color={result.success ? "green" : "red"}
        title={result.success ? "Transaction Success" : "Transaction Reverted"}
      >
        {result.success
          ? `Flash loan executed successfully. Net profit: $${result.profit.toFixed(2)} after repaying principal + fee.`
          : `Transaction reverted — arbitrage profit ($${arbitrageProfit}) is insufficient to cover the protocol fee ($${(result.repayAmount - borrowAmount).toFixed(2)}). In a real flash loan, the entire transaction would revert atomically.`}
      </Alert>

      <EducationPanel
        howItWorks={[
          {
            title: "Atomic Transaction",
            description:
              "Flash loans borrow and repay within a single transaction. If repayment fails, the entire transaction reverts as if it never happened.",
          },
          {
            title: "No Collateral Needed",
            description:
              "Because repayment is guaranteed by the atomic nature, no collateral is required — unique to blockchain.",
          },
          {
            title: "Use Cases",
            description:
              "Arbitrage between DEXs, liquidation of undercollateralized positions, collateral swaps, and self-liquidation.",
          },
        ]}
        whyItMatters="Flash loans democratize access to large capital for atomic operations. They enable capital-efficient strategies that were previously only available to well-funded traders."
        tips={[
          "Flash loan fees are typically 0.05-0.09% of the borrowed amount",
          "All operations must complete in a single transaction (one block)",
          "Failed flash loans cost only the gas fee — no capital is at risk",
        ]}
      />
    </Stack>
  );
}
