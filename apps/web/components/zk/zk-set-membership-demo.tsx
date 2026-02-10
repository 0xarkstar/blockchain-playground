"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  createMemberGroup,
  proveZKMembership,
  verifyZKMembership,
  compareProofs,
  type MemberGroup,
  type ZKMembershipProof,
} from "../../lib/zk/set-membership";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
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

const DEFAULT_MEMBERS = ["alice", "bob", "charlie", "dave"];

export function ZKSetMembershipDemo() {
  const [members] = useState(DEFAULT_MEMBERS);
  const [group, setGroup] = useState<MemberGroup | null>(null);
  const [selectedMember, setSelectedMember] = useState("0");
  const [proof, setProof] = useState<ZKMembershipProof | null>(null);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const comparison = compareProofs();

  const handleCreateGroup = () => {
    setGroup(createMemberGroup(members));
    setProof(null);
    setVerifyResult(null);
  };

  const handleProve = () => {
    if (!group) return;
    const idx = parseInt(selectedMember);
    const p = proveZKMembership(group, idx, `secret_${idx}`);
    setProof(p);
    setVerifyResult(null);
  };

  const handleVerify = () => {
    if (!group || !proof) return;
    setVerifyResult(verifyZKMembership(group.root, proof));
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Prove you belong to a group without revealing which member you are.
          Members commit to their identity via hash, forming a Merkle tree. A
          Merkle path proves inclusion without exposing the member index.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Group Members</p>
          <div className="flex items-center gap-4">
            {members.map((m, i) => (
              <Badge key={i} variant="secondary">
                {m}
              </Badge>
            ))}
          </div>
          <Button variant="secondary" onClick={handleCreateGroup}>
            Create Group (build Merkle tree)
          </Button>
        </div>
      </div>

      {group && (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Merkle Tree</p>
              <p className="text-sm">
                Root: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{group.root.slice(0, 18)}...</code>
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Commitment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.members.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{members[i]}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{m.commitment.slice(0, 18)}...</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Merkle Tree Diagram</p>
              <svg width="100%" height={180} viewBox="0 0 500 180">
                <rect
                  x={200}
                  y={10}
                  width={100}
                  height={32}
                  rx={6}
                  className="fill-green-100 stroke-green-500 dark:fill-green-900 dark:stroke-green-400"
                  strokeWidth={2}
                />
                <text
                  x={250}
                  y={30}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-green-900 dark:fill-green-200"
                >
                  Root
                </text>

                <line x1={250} y1={42} x2={130} y2={65} className="stroke-gray-400" strokeWidth={1.5} />
                <line x1={250} y1={42} x2={370} y2={65} className="stroke-gray-400" strokeWidth={1.5} />

                <rect
                  x={80}
                  y={65}
                  width={100}
                  height={32}
                  rx={6}
                  className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400"
                  strokeWidth={1.5}
                />
                <text x={130} y={85} textAnchor="middle" fontSize={10} className="fill-blue-800 dark:fill-blue-200">
                  H(L0+L1)
                </text>
                <rect
                  x={320}
                  y={65}
                  width={100}
                  height={32}
                  rx={6}
                  className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400"
                  strokeWidth={1.5}
                />
                <text x={370} y={85} textAnchor="middle" fontSize={10} className="fill-blue-800 dark:fill-blue-200">
                  H(L2+L3)
                </text>

                <line x1={130} y1={97} x2={65} y2={120} className="stroke-gray-300" strokeWidth={1} />
                <line x1={130} y1={97} x2={195} y2={120} className="stroke-gray-300" strokeWidth={1} />
                <line x1={370} y1={97} x2={305} y2={120} className="stroke-gray-300" strokeWidth={1} />
                <line x1={370} y1={97} x2={435} y2={120} className="stroke-gray-300" strokeWidth={1} />

                {members.map((m, i) => {
                  const x = 15 + i * 130;
                  const isSelected = proof && String(i) === selectedMember;
                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={120}
                        width={100}
                        height={32}
                        rx={6}
                        className={
                          isSelected
                            ? "fill-violet-100 stroke-violet-500 dark:fill-violet-900 dark:stroke-violet-400"
                            : "fill-gray-100 stroke-gray-300 dark:fill-gray-800 dark:stroke-gray-600"
                        }
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x={x + 50}
                        y={140}
                        textAnchor="middle"
                        fontSize={11}
                        className={
                          isSelected
                            ? "fill-violet-900 dark:fill-violet-200"
                            : "fill-gray-700 dark:fill-gray-300"
                        }
                      >
                        {m}
                      </text>
                      {isSelected && (
                        <text
                          x={x + 50}
                          y={165}
                          textAnchor="middle"
                          fontSize={9}
                          className="fill-violet-600 dark:fill-violet-400"
                        >
                          (proving)
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Prove Membership</p>
              <div>
                <Label htmlFor="zk-setmember-select">I am...</Label>
                <Select value={selectedMember} onValueChange={(v) => setSelectedMember(v)}>
                  <SelectTrigger id="zk-setmember-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m, i) => (
                      <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300" onClick={handleProve}>
                  Generate ZK Proof
                </Button>
                {proof && (
                  <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" onClick={handleVerify}>
                    Verify Proof
                  </Button>
                )}
              </div>
            </div>
          </div>

          {proof && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Proof</p>
                  {verifyResult !== null && (
                    <Badge
                      variant="secondary"
                      className={
                        verifyResult
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }
                    >
                      {verifyResult ? "Verified" : "Invalid"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm">
                  Path length: {proof.merklePath.length} nodes
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Sibling Hash</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proof.merklePath.map((node, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{node.hash.slice(0, 18)}...</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {node.position}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Privacy Comparison</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Approach</TableHead>
                <TableHead>Revealed</TableHead>
                <TableHead>Implication</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    Transparent
                  </Badge>
                </TableCell>
                <TableCell>{comparison.transparent.revealed}</TableCell>
                <TableCell>
                  <p className="text-xs text-muted-foreground">
                    {comparison.transparent.info}
                  </p>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Zero-Knowledge
                  </Badge>
                </TableCell>
                <TableCell>{comparison.zk.revealed}</TableCell>
                <TableCell>
                  <p className="text-xs text-muted-foreground">
                    {comparison.zk.info}
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
