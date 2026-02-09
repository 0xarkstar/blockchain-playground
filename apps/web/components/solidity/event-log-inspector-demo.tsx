"use client";

import { useState, useMemo, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
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
import { encodeLogEntry, type EventParam } from "../../lib/solidity/abi";
import { EducationPanel } from "../../components/shared";

const PARAM_TYPES = ["uint256", "address", "bool", "bytes32", "uint8"];

interface ParamInput {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly value: string;
  readonly indexed: boolean;
}

export function EventLogInspectorDemo() {
  const [eventName, setEventName] = useState("Transfer");
  const nextId = useRef(3);
  const [params, setParams] = useState<ParamInput[]>([
    {
      id: 0,
      name: "from",
      type: "address",
      value: "0x0000000000000000000000000000000000000001",
      indexed: true,
    },
    {
      id: 1,
      name: "to",
      type: "address",
      value: "0x0000000000000000000000000000000000000002",
      indexed: true,
    },
    { id: 2, name: "value", type: "uint256", value: "1000", indexed: false },
  ]);

  const log = useMemo(() => {
    try {
      const eventParams: EventParam[] = params.map((p) => ({
        name: p.name,
        type: p.type,
        value: p.value,
        indexed: p.indexed,
      }));
      return encodeLogEntry(eventName, eventParams);
    } catch {
      return null;
    }
  }, [eventName, params]);

  const addParam = () => {
    setParams([
      ...params,
      {
        id: nextId.current++,
        name: "",
        type: "uint256",
        value: "0",
        indexed: false,
      },
    ]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (
    index: number,
    field: keyof ParamInput,
    value: string | boolean,
  ) => {
    setParams(
      params.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const indexedCount = useMemo(
    () => params.filter((p) => p.indexed).length,
    [params],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Event Definition</p>
          <div>
            <Label>Event Name</Label>
            <Input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <p className="text-xs font-semibold">
            Parameters ({params.length}) — Indexed: {indexedCount}/3 max
          </p>
          {params.map((param, i) => (
            <div key={param.id} className="flex items-end gap-2">
              <div className="w-[130px]">
                <Label>Type</Label>
                <Select
                  value={param.type}
                  onValueChange={(v) => updateParam(i, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[100px]">
                <Label>Name</Label>
                <Input
                  value={param.name}
                  onChange={(e) => updateParam(i, "name", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label>Value</Label>
                <Input
                  value={param.value}
                  onChange={(e) => updateParam(i, "value", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch
                  checked={param.indexed}
                  onCheckedChange={(checked) =>
                    updateParam(i, "indexed", checked)
                  }
                  disabled={!param.indexed && indexedCount >= 3}
                />
                <Label className="text-xs">Indexed</Label>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeParam(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addParam}>
            <Plus className="h-4 w-4 mr-1" />
            Add Parameter
          </Button>
        </div>
      </div>

      {log && (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Topics</p>
              {log.topics.map((topic, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <p className="text-xs text-muted-foreground">
                    {log.topicDescriptions[i]}
                  </p>
                  <code
                    className="rounded bg-muted px-1.5 py-0.5 font-mono"
                    style={{ fontSize: 11, wordBreak: "break-all" }}
                  >
                    {topic}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">
                Data (non-indexed ABI-encoded)
              </p>
              <pre
                className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono"
                style={{ fontSize: 11, wordBreak: "break-all" }}
              >
                <code>
                  {log.data || "0x (empty — all params are indexed)"}
                </code>
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Log Structure Summary</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Searchable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {params.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {p.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${p.indexed ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
                        >
                          {p.indexed ? "topic" : "data"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${p.indexed ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                        >
                          {p.indexed ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {log && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Event Timeline</p>
            <div
              className="flex flex-col gap-1"
              style={{
                borderLeft: "3px solid hsl(var(--primary) / 0.3)",
                paddingLeft: 16,
              }}
            >
              <div className="rounded-lg border border-border bg-blue-50 dark:bg-blue-950 p-2">
                <div className="flex items-center gap-1">
                  <Badge className="text-xs bg-blue-600 text-white">
                    topic[0]
                  </Badge>
                  <p className="text-xs font-semibold">Event Signature Hash</p>
                </div>
                <code className="font-mono" style={{ fontSize: 10 }}>
                  {log.topics[0]?.slice(0, 20)}...
                </code>
              </div>
              {params
                .filter((p) => p.indexed)
                .map((p, i) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-border bg-green-50 dark:bg-green-950 p-2"
                  >
                    <div className="flex items-center gap-1">
                      <Badge className="text-xs bg-green-600 text-white">
                        topic[{i + 1}]
                      </Badge>
                      <p className="text-xs font-semibold">
                        {p.name} (indexed {p.type})
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.value}</p>
                  </div>
                ))}
              {params
                .filter((p) => !p.indexed)
                .map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-border bg-muted p-2"
                  >
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        data
                      </Badge>
                      <p className="text-xs font-semibold">
                        {p.name} (non-indexed {p.type})
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.value}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "Event Topics",
            description:
              "topic[0] is the keccak256 hash of the event signature. Indexed parameters go in topic[1-3]. Max 3 indexed params.",
          },
          {
            title: "Event Data",
            description:
              "Non-indexed parameters are ABI-encoded in the data field. Cheaper to store but not directly searchable.",
          },
          {
            title: "Log Filtering",
            description:
              "Indexed parameters enable eth_getLogs filtering. You can search for specific Transfer events by sender or receiver.",
          },
        ]}
        whyItMatters="Events are the primary way smart contracts communicate with off-chain applications. They're much cheaper than storage and enable efficient real-time monitoring of contract activity."
        tips={[
          "Index parameters you need to search/filter by (e.g., sender, receiver)",
          "Events cost ~375 gas base + 375 per indexed topic + 8 per data byte",
          "Anonymous events omit topic[0] — saves gas but harder to filter",
        ]}
      />
    </div>
  );
}
