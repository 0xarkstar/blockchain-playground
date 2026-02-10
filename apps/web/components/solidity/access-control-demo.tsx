"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
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
  createInitialState,
  grantRole,
  revokeRole,
  renounceRole,
  transferOwnership,
  checkFunctionAccess,
  hasRole,
  DEFAULT_ADMIN_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  type AccessControlState,
} from "../../lib/solidity/access-control";
import { EducationPanel } from "../../components/shared";

const ROLES = [DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE];
const ROLE_LABELS: Record<string, string> = {
  [DEFAULT_ADMIN_ROLE]: "DEFAULT_ADMIN_ROLE",
  [MINTER_ROLE]: "MINTER_ROLE",
  [PAUSER_ROLE]: "PAUSER_ROLE",
};

interface LogEntry {
  readonly action: string;
  readonly success: boolean;
  readonly message: string;
}

export function AccessControlDemo() {
  const [state, setState] = useState<AccessControlState>(
    createInitialState("0xOwner"),
  );
  const [caller, setCaller] = useState("0xOwner");
  const [targetAccount, setTargetAccount] = useState("0xAlice");
  const [selectedRole, setSelectedRole] = useState(MINTER_ROLE);
  const [checkCaller, setCheckCaller] = useState("0xAlice");
  const [checkRole, setCheckRole] = useState("onlyOwner");
  const [logs, setLogs] = useState<readonly LogEntry[]>([]);

  const addLog = (entry: LogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 20));
  };

  const handleGrant = () => {
    const result = grantRole(state, selectedRole, targetAccount, caller);
    setState(result.state);
    addLog({
      action: "grantRole",
      success: result.success,
      message: result.message,
    });
  };

  const handleRevoke = () => {
    const result = revokeRole(state, selectedRole, targetAccount, caller);
    setState(result.state);
    addLog({
      action: "revokeRole",
      success: result.success,
      message: result.message,
    });
  };

  const handleRenounce = () => {
    const result = renounceRole(state, selectedRole, caller);
    setState(result.state);
    addLog({
      action: "renounceRole",
      success: result.success,
      message: result.message,
    });
  };

  const handleTransfer = () => {
    const result = transferOwnership(state, targetAccount, caller);
    setState(result.state);
    addLog({
      action: "transferOwnership",
      success: result.success,
      message: result.message,
    });
  };

  const accessCheck = useMemo(
    () => checkFunctionAccess(state, checkCaller, checkRole),
    [state, checkCaller, checkRole],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Role Hierarchy</p>
          <div className="rounded-lg border border-border bg-muted p-4 text-center">
            <div className="flex flex-col gap-1 items-center">
              <Badge className="bg-red-600 dark:bg-red-500 text-white text-sm px-3 py-1">
                DEFAULT_ADMIN
              </Badge>
              <p className="text-xs text-muted-foreground">
                can grant/revoke all roles
              </p>
              <div className="flex items-start gap-8 justify-center mt-2">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-muted-foreground">|</p>
                  <Badge className="bg-violet-600 dark:bg-violet-500 text-white">MINTER</Badge>
                  <p className="text-xs text-muted-foreground">
                    can mint tokens
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-muted-foreground">|</p>
                  <Badge className="bg-orange-600 dark:bg-orange-500 text-white">PAUSER</Badge>
                  <p className="text-xs text-muted-foreground">
                    can pause contract
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Contract State</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Owner</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{state.owner}</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-xs font-semibold">Role Memberships</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROLES.map((roleId) => (
                <TableRow key={roleId}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {ROLE_LABELS[roleId]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {hasRole(state, roleId, state.owner) ||
                    (state.roles[roleId]?.members.length ?? 0) > 0
                      ? (state.roles[roleId]?.members.join(", ") ?? "none")
                      : "none"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Role Management</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sol-access-caller">Caller (msg.sender)</Label>
              <Input
                id="sol-access-caller"
                value={caller}
                onChange={(e) => setCaller(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sol-access-target">Target Account</Label>
              <Input
                id="sol-access-target"
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="sol-access-role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v)}
            >
              <SelectTrigger id="sol-access-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
              onClick={handleGrant}
            >
              Grant
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
              onClick={handleRevoke}
            >
              Revoke
            </Button>
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white"
              onClick={handleRenounce}
            >
              Renounce
            </Button>
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white"
              onClick={handleTransfer}
            >
              Transfer Ownership
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Function Access Check</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sol-access-checkcaller">Caller</Label>
              <Input
                id="sol-access-checkcaller"
                value={checkCaller}
                onChange={(e) => setCheckCaller(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sol-access-checkrole">Required Role</Label>
              <Select
                value={checkRole}
                onValueChange={(v) => setCheckRole(v)}
              >
                <SelectTrigger id="sol-access-checkrole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onlyOwner">onlyOwner</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r] ?? r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Alert
            className={
              accessCheck.allowed
                ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
                : "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
            }
          >
            <Info className="h-4 w-4" />
            <AlertDescription>
              {accessCheck.allowed ? "ALLOWED" : "DENIED"}: {accessCheck.reason}
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Transaction Log</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${log.success ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                      >
                        {log.success ? "PASS" : "REVERT"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{log.message}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "Ownable",
            description:
              "Simple owner-based access control. One address has full admin rights. Good for simple contracts.",
          },
          {
            title: "Role-Based (RBAC)",
            description:
              "Multiple roles with different permissions. OpenZeppelin AccessControl provides hasRole(), grantRole(), revokeRole().",
          },
          {
            title: "Admin Role",
            description:
              "Each role has an admin role that can grant/revoke it. DEFAULT_ADMIN_ROLE is the admin for all roles by default.",
          },
        ]}
        whyItMatters="Access control vulnerabilities are among the most costly in DeFi. Proper role management prevents unauthorized minting, pausing, or upgrading of contracts."
        tips={[
          "Use renounceRole (not revokeRole) to remove your own role — prevents accidental lockout",
          "Consider using a multisig (like Safe) as the admin for production contracts",
          "Always test that unauthorized callers are properly rejected",
        ]}
      />
    </div>
  );
}
