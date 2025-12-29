import type { NextConfig } from "next";

const repo = "note-quiz"; // ← GitHubのリポジトリ名
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",

  // GitHub Pages 用設定（本番のみ有効）
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",

  // Pagesでは画像最適化サーバーが使えない
  images: {
    unoptimized: true,
  },

  // 静的ホスティングでは付けておくと安全
  trailingSlash: true,
};

export default nextConfig;

