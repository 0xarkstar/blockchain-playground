"use client";

import { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
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
  TableRow,
} from "../ui/table";
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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Vesting Configuration</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Beneficiary</Label>
              <Input
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
              />
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={vestingType}
                onValueChange={(v) => setVestingType(v as VestingType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="cliff">Cliff</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label>Cliff Duration</Label>
              <Input
                type="number"
                value={cliffDuration}
                onChange={(e) => setCliffDuration(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label>Total Duration</Label>
              <Input
                type="number"
                value={totalDuration}
                onChange={(e) => setTotalDuration(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" onClick={handleCreate}>
            Create Schedule
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Time Control</p>
          <div>
            <Label>Current Time</Label>
            <Input
              type="number"
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800" onClick={handleRelease}>
            Release Tokens
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Vesting Status</p>
            <Badge
              variant="secondary"
              className={
                info.isFullyVested
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              }
            >
              {info.isFullyVested
                ? "Fully Vested"
                : `${info.vestedPercent.toFixed(1)}% Vested`}
            </Badge>
          </div>
          <Progress value={info.vestedPercent} className="h-3" />
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Beneficiary</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{schedule.beneficiary}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{schedule.vestingType}</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cliff Reached</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      info.isCliffReached
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }
                  >
                    {info.isCliffReached ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vested Amount</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{info.vestedAmount}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Released</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{schedule.released}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Releasable</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{info.releasableAmount}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Remaining</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{info.remainingAmount}</code>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Vesting Curve</p>
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
        </div>
      </div>
    </div>
  );
}
