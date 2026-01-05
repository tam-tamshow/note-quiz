# note-quiz

Next.js（App Router）で作った音名クイズです。GitHub Pages 向けに静的出力しています。

## 主な機能

- ト音記号の譜面表示（白鍵のみのランダム出題）
- クリック可能な鍵盤で回答
- localStorage による成績保存
- 統計表示（正答率・苦手音）
- 出題範囲・苦手優先の調整

## 技術スタック

- Next.js 16（App Router / static export）
- React 19
- TypeScript

## ローカル開発

```bash
npm install
npm run dev
```

## ビルド（静的出力）

```bash
npm run build
```

`out/` に静的サイトが生成されます。

## GitHub Pages へのデプロイ

このプロジェクトは `next.config.ts` で base path を指定して静的出力します。

1. `next.config.ts` のリポジトリ名を設定:

```ts
const repo = "note-quiz";
```

2. 静的出力をビルド:

```bash
npm run build
```

3. `out/` を GitHub Pages へデプロイ（Pages の workflow か `gh-pages` ブランチに配置）

注意:

- 内部リンクは `NEXT_PUBLIC_BASE_PATH` を利用しています（本番ビルド時に `next.config.ts` から設定）
- GitHub Pages は画像最適化を使えないため `images.unoptimized` を有効化しています

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - 静的出力ビルド
- `npm run start` - Next.js サーバー起動（静的ホスティングでは未使用）
- `npm run lint` - ESLint 実行

## ライセンス

MIT
