import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["snarkjs", "circomlibjs"],
  transpilePackages: [
    "@blockchain-playground/ui",
    "@blockchain-playground/utils",
    "@blockchain-playground/web3-config",
  ],
};

export default withNextIntl(nextConfig);
