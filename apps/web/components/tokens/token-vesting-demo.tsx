"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  TextInput,
  NumberInput,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Select,
  Progress,
} from "@mantine/core";
import {
  createVestingSchedule,
  getVestingInfo,
  releaseTokens,
  generateVestingCurve,
  type VestingSchedule,
  type VestingType,
} from "../../lib/tokens/vesting";
import { SimpleAreaChart } from "../shared";

export function TokenVestingDemo() {
  const [beneficiary, setBeneficiary] = useState("alice");
  const [totalAmount, setTotalAmount] = useState(10000);
  const [vestingType, setVestingType] = useState<VestingType>("linear");
  const [startTime, setStartTime] = useState(0);
  const [cliffDuration, setCliffDuration] = useState(30);
  const [totalDuration, setTotalDuration] = useState(365);
  const [currentTime, setCurrentTime] = useState(100);

  const [schedule, setSchedule] = useState<VestingSchedule>(() =>
    createVestingSchedule("alice", 10000, "linear", 0, 30, 365),
  );

  const info = useMemo(
    () => getVestingInfo(schedule, currentTime),
    [schedule, currentTime],
  );

  const curve = useMemo(() => generateVestingCurve(schedule, 20), [schedule]);

  const handleCreate = () => {
    const s = createVestingSchedule(
      beneficiary,
      totalAmount,
      vestingType,
      startTime,
      cliffDuration,
      totalDuration,
    );
    setSchedule(s);
  };

  const handleRelease = () => {
    const { newSchedule } = releaseTokens(schedule, currentTime);
    setSchedule(newSchedule);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Vesting Configuration
          </Text>
          <Group grow>
            <TextInput
              label="Beneficiary"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.currentTarget.value)}
            />
            <NumberInput
              label="Total Amount"
              value={totalAmount}
              onChange={(v) => setTotalAmount(Number(v) || 0)}
              min={1}
            />
            <Select
              label="Type"
              value={vestingType}
              onChange={(v) => setVestingType((v as VestingType) ?? "linear")}
              data={[
                { value: "linear", label: "Linear" },
                { value: "cliff", label: "Cliff" },
                { value: "graded", label: "Graded" },
              ]}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Start Time"
              value={startTime}
              onChange={(v) => setStartTime(Number(v) || 0)}
              min={0}
            />
            <NumberInput
              label="Cliff Duration"
              value={cliffDuration}
              onChange={(v) => setCliffDuration(Number(v) || 0)}
              min={0}
            />
            <NumberInput
              label="Total Duration"
              value={totalDuration}
              onChange={(v) => setTotalDuration(Number(v) || 0)}
              min={1}
            />
          </Group>
          <Button onClick={handleCreate} variant="light">
            Create Schedule
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Time Control
          </Text>
          <Group grow>
            <NumberInput
              label="Current Time"
              value={currentTime}
              onChange={(v) => setCurrentTime(Number(v) || 0)}
              min={0}
            />
          </Group>
          <Button onClick={handleRelease} variant="light" color="green">
            Release Tokens
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Vesting Status
            </Text>
            <Badge
              variant="light"
              color={info.isFullyVested ? "green" : "blue"}
            >
              {info.isFullyVested
                ? "Fully Vested"
                : `${info.vestedPercent.toFixed(1)}% Vested`}
            </Badge>
          </Group>
          <Progress value={info.vestedPercent} color="blue" size="lg" />
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Beneficiary</Table.Td>
                <Table.Td ta="right">
                  <Code>{schedule.beneficiary}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Type</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light">{schedule.vestingType}</Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Cliff Reached</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={info.isCliffReached ? "green" : "red"}
                    variant="light"
                  >
                    {info.isCliffReached ? "Yes" : "No"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Vested Amount</Table.Td>
                <Table.Td ta="right">
                  <Code>{info.vestedAmount}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Released</Table.Td>
                <Table.Td ta="right">
                  <Code>{schedule.released}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Releasable</Table.Td>
                <Table.Td ta="right">
                  <Code>{info.releasableAmount}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Remaining</Table.Td>
                <Table.Td ta="right">
                  <Code>{info.remainingAmount}</Code>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Vesting Curve
          </Text>
          <SimpleAreaChart
            data={curve.map((point) => ({
              time: `Day ${point.time}`,
              "Vested Amount": point.vestedAmount,
              "Vested %": Number(point.vestedPercent.toFixed(1)),
            }))}
            xKey="time"
            yKeys={["Vested Amount"]}
            height={280}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
