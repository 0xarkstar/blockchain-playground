"use client";

import { Web3Provider } from "@blockchain-playground/web3-config";

export default function AppliedZKLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Web3Provider>{children}</Web3Provider>;
}
