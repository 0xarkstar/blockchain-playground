"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  getProxyInfo,
  createProxyState,
  simulateUpgrade,
  visualizeDelegatecall,
  getEIP1967Slots,
  type ProxyType,
  type ProxyState,
} from "../../lib/solidity/proxy";
import { EducationPanel } from "../../components/shared";

const PROXY_TYPES: { value: ProxyType; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "uups", label: "UUPS" },
  { value: "diamond", label: "Diamond" },
];

export function ProxyPatternsDemo() {
  const [proxyType, setProxyType] = useState<ProxyType>("transparent");
  const [newImpl, setNewImpl] = useState("0xImplV2");
  const [caller, setCaller] = useState("0xAdmin");
  const [state, setState] = useState<ProxyState>(
    createProxyState("transparent", "0xadmin"),
  );

  const info = useMemo(() => getProxyInfo(proxyType), [proxyType]);
  const slots = useMemo(() => getEIP1967Slots(), []);

  const viz = useMemo(
    () =>
      visualizeDelegatecall(
        "0xUser",
        "0xProxy",
        state.implementation || "0xImpl",
      ),
    [state.implementation],
  );

  const handleTypeChange = (type: ProxyType) => {
    setProxyType(type);
    setState(createProxyState(type, state.admin));
  };

  const handleUpgrade = () => {
    const result = simulateUpgrade(state, newImpl, caller);
    setState(result.state);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Proxy Architecture</p>
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="flex items-start gap-4 justify-center">
              <div className="rounded-lg border border-border bg-blue-100 dark:bg-blue-900 p-3 min-w-[120px] text-center">
                <p className="text-xs font-bold">Proxy Contract</p>
                <p className="text-xs text-muted-foreground">Stores state</p>
                <p className="text-xs text-muted-foreground">Fixed address</p>
                <Badge
                  variant="secondary"
                  className="text-xs mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {proxyType}
                </Badge>
              </div>
              <div className="flex flex-col items-center justify-center pt-5 gap-0.5">
                <p className="text-xs font-semibold">DELEGATECALL</p>
                <p className="text-xs text-muted-foreground">----&gt;</p>
              </div>
              <div className="rounded-lg border border-border bg-green-100 dark:bg-green-900 p-3 min-w-[120px] text-center">
                <p className="text-xs font-bold">Implementation</p>
                <p className="text-xs text-muted-foreground">Contains logic</p>
                <p className="text-xs text-muted-foreground">Replaceable</p>
                <Badge
                  variant="secondary"
                  className="text-xs mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  {state.implementation}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-yellow-50 dark:bg-yellow-950 p-2 mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                Storage lives in Proxy, not Implementation. Upgrades only change
                the logic pointer.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Proxy Type</p>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {PROXY_TYPES.map((pt) => (
              <Button
                key={pt.value}
                variant={proxyType === pt.value ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleTypeChange(pt.value)}
              >
                {pt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">{info.name}</p>
          <p className="text-sm text-muted-foreground">{info.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">Pros</p>
              {info.pros.map((pro, i) => (
                <p key={i} className="text-xs">
                  + {pro}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">Cons</p>
              {info.cons.map((con, i) => (
                <p key={i} className="text-xs">
                  - {con}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Upgrade Simulation</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sol-proxy-admin">Admin</Label>
              <Input id="sol-proxy-admin" value={state.admin} readOnly className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="sol-proxy-caller">Caller</Label>
              <Input
                id="sol-proxy-caller"
                value={caller}
                onChange={(e) => setCaller(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sol-proxy-newimpl">New Implementation</Label>
              <Input
                id="sol-proxy-newimpl"
                value={newImpl}
                onChange={(e) => setNewImpl(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleUpgrade}>Upgrade</Button>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Current Implementation</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                    {state.implementation}
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Admin</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                    {state.admin}
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Previous Implementations</TableCell>
                <TableCell className="text-right">
                  {state.previousImplementations.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {state.previousImplementations.map((impl, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {impl}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">None</p>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Delegatecall Flow</p>
          {viz.steps.map((step) => (
            <Alert key={step.step}>
              <Badge className="text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                {step.step}
              </Badge>
              <AlertTitle>
                {step.from} → {step.to}
              </AlertTitle>
              <AlertDescription>
                <p className="text-xs">{step.description}</p>
                <p className="text-xs text-muted-foreground">{step.context}</p>
              </AlertDescription>
            </Alert>
          ))}
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Storage Owner</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {viz.storageOwner}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Code Source</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300"
                  >
                    {viz.codeSource}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>msg.sender</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{viz.msgSender}</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">EIP-1967 Storage Slots</p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Standardized storage slots prevent collisions between proxy and
              implementation state.
            </AlertDescription>
          </Alert>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Implementation</TableCell>
                <TableCell>
                  <code
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                    style={{ wordBreak: "break-all" }}
                  >
                    {slots.implementation}
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Admin</TableCell>
                <TableCell>
                  <code
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                    style={{ wordBreak: "break-all" }}
                  >
                    {slots.admin}
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Beacon</TableCell>
                <TableCell>
                  <code
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                    style={{ wordBreak: "break-all" }}
                  >
                    {slots.beacon}
                  </code>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Transparent Proxy",
            description:
              "Admin calls go to proxy (upgrade logic). User calls are delegated to implementation. Admin cannot call implementation functions.",
          },
          {
            title: "UUPS Proxy",
            description:
              "Upgrade logic lives in the implementation contract itself. Cheaper to deploy but requires implementation to include upgrade function.",
          },
          {
            title: "Diamond (EIP-2535)",
            description:
              "Multiple implementation contracts (facets). Enables modular upgrades — change one facet without affecting others.",
          },
        ]}
        whyItMatters="Smart contracts are immutable by default. Proxy patterns enable upgradeable contracts, allowing teams to fix bugs and add features while preserving state and contract address."
        tips={[
          "EIP-1967 standardizes storage slots to prevent proxy-implementation collisions",
          "Always use initializers (not constructors) in implementation contracts",
          "Test upgrades thoroughly — storage layout changes can corrupt state",
          "Consider using OpenZeppelin Upgrades plugins for safe deployments",
        ]}
      />
    </div>
  );
}
