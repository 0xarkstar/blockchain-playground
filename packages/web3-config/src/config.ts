import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia, hardhat } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Blockchain Playground",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: [baseSepolia, hardhat],
  ssr: true,
});
