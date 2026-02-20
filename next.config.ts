import type { NextConfig } from "next";
import withBundleAnalyzerFn from "@next/bundle-analyzer";

const withBundleAnalyzer = withBundleAnalyzerFn({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withBundleAnalyzer(nextConfig);
