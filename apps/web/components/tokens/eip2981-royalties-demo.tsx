"use client";

import { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { calculatePriceBreakdown } from "../../lib/tokens/marketplace";
import { SimplePieChart } from "../shared";

export function EIP2981RoyaltiesDemo() {
  const [salePrice, setSalePrice] = useState(10);
  const [royaltyPercent, setRoyaltyPercent] = useState(5);
  const [platformFeePercent, setPlatformFeePercent] = useState(2.5);

  const breakdown = useMemo(
    () =>
      calculatePriceBreakdown(salePrice, royaltyPercent, platformFeePercent),
    [salePrice, royaltyPercent, platformFeePercent],
  );

  const scenarios = useMemo(() => {
    const prices = [1, 5, 10, 50, 100];
    return prices.map((price) =>
      calculatePriceBreakdown(price, royaltyPercent, platformFeePercent),
    );
  }, [royaltyPercent, platformFeePercent]);

  const sellerPct =
    salePrice > 0 ? (breakdown.sellerProceeds / salePrice) * 100 : 0;
  const royaltyPct =
    salePrice > 0 ? (breakdown.royaltyAmount / salePrice) * 100 : 0;
  const feePct = salePrice > 0 ? (breakdown.platformFee / salePrice) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Configuration</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Sale Price (ETH)</Label>
              <Input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value) || 0)}
                min={0.01}
                step={0.0001}
              />
            </div>
            <div>
              <Label>Royalty %</Label>
              <Input
                type="number"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(Number(e.target.value) || 0)}
                min={0}
                max={50}
                step={0.01}
              />
            </div>
            <div>
              <Label>Platform Fee %</Label>
              <Input
                type="number"
                value={platformFeePercent}
                onChange={(e) => setPlatformFeePercent(Number(e.target.value) || 0)}
                min={0}
                max={50}
                step={0.01}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Payment Distribution</p>
          <div className="flex h-6 w-full overflow-hidden rounded-full">
            <div
              className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${sellerPct}%` }}
            >
              {sellerPct > 10 ? `Seller ${sellerPct.toFixed(1)}%` : ""}
            </div>
            <div
              className="bg-violet-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${royaltyPct}%` }}
            >
              {royaltyPct > 10 ? `Royalty ${royaltyPct.toFixed(1)}%` : ""}
            </div>
            <div
              className="bg-orange-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${feePct}%` }}
            >
              {feePct > 10 ? `Fee ${feePct.toFixed(1)}%` : ""}
            </div>
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Sale Price</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{breakdown.price.toFixed(4)} ETH</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 text-xs">
                      Creator
                    </Badge>
                    Royalty ({royaltyPercent}%)
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{breakdown.royaltyAmount.toFixed(4)} ETH</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs">
                      Platform
                    </Badge>
                    Fee ({platformFeePercent}%)
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{breakdown.platformFee.toFixed(4)} ETH</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                      Seller
                    </Badge>
                    Proceeds
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono font-semibold">
                    {breakdown.sellerProceeds.toFixed(4)} ETH
                  </code>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <SimplePieChart
            data={[
              {
                recipient: "Seller",
                amount: Number(breakdown.sellerProceeds.toFixed(4)),
              },
              {
                recipient: "Royalty",
                amount: Number(breakdown.royaltyAmount.toFixed(4)),
              },
              {
                recipient: "Platform",
                amount: Number(breakdown.platformFee.toFixed(4)),
              },
            ]}
            nameKey="recipient"
            valueKey="amount"
            colors={["#40c057", "#7950f2", "#fd7e14"]}
            height={250}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Royalty at Different Price Points</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Price (ETH)</TableHead>
                <TableHead className="text-right">Royalty</TableHead>
                <TableHead className="text-right">Platform Fee</TableHead>
                <TableHead className="text-right">Seller Gets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((s) => (
                <TableRow key={s.price}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.price.toFixed(2)}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.royaltyAmount.toFixed(4)}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.platformFee.toFixed(4)}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.sellerProceeds.toFixed(4)}</code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">EIP-2981 Standard</p>
          <p className="text-sm text-muted-foreground">
            EIP-2981 defines a standard interface for querying royalty payment
            information. Marketplaces call{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">royaltyInfo(tokenId, salePrice)</code> which returns the
            royalty receiver address and payment amount. This is an on-chain
            standard that works across any NFT marketplace that implements it.
          </p>
          <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
            <code>{`// EIP-2981 Interface
function royaltyInfo(
  uint256 tokenId,
  uint256 salePrice
) external view returns (
  address receiver,   // royalty recipient
  uint256 royaltyAmount // payment in sale currency
);`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
