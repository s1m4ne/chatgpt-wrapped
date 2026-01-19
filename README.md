# ChatGPT Wrapped

ChatGPTの利用履歴を可視化・分析するWebアプリケーション。Spotify Wrappedにインスパイアされ、1年間のAI対話パターンを美しく振り返ることができます。

## 仕様書

仕様書は `.kiro/specs/` ディレクトリに配置されています。

| 仕様名 | 説明 |
|--------|------|
| [github-chat-analyzer](.kiro/specs/github-chat-analyzer/) | GitHub Chat Analyzer機能の仕様 |
| [openai-support](.kiro/specs/openai-support/) | OpenAI API対応の仕様 |
| [openai-gpt5-nano-support](.kiro/specs/openai-gpt5-nano-support/) | GPT-5 Nanoモデル対応の仕様 |

各仕様には以下のドキュメントが含まれます:
- `requirements.md` - 要件定義
- `design.md` - 設計書
- `tasks.md` - 実装タスク
- `research.md` - 調査資料

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite 7 |
| スタイリング | Tailwind CSS 4 |
| テスト | Vitest + React Testing Library |
| Lint/Format | ESLint + Prettier |

## テスト結果

### サマリー

| 項目 | 結果 |
|------|------|
| テストファイル数 | 7 |
| テストケース数 | 89 |
| 成功 | 89 (100%) |
| 失敗 | 0 |
| 実行時間 | 882ms |

### カバレッジ

| ファイル | Stmts | Branch | Funcs | Lines |
|----------|-------|--------|-------|-------|
| **全体** | 66.96% | 54.21% | 74.19% | 67.45% |
| **components/** | 100% | 94.59% | 100% | 100% |
| FileUploader.tsx | 100% | 91.66% | 100% | 100% |
| ProgressBar.tsx | 100% | 100% | 100% | 100% |
| **components/cards/** | 94.73% | 90.9% | 90% | 94.44% |
| CardHeader.tsx | 66.66% | 66.66% | 50% | 66.66% |
| StatsCard.tsx | 100% | 100% | 100% | 100% |
| **contexts/** | 62.5% | 61.29% | 71.42% | 62.5% |
| AnalysisContext.tsx | 62.5% | 61.29% | 71.42% | 62.5% |
| **services/** | 64.49% | 48.86% | 70.4% | 64.86% |
| clientFactory.ts | 100% | 100% | 100% | 100% |
| dataParser.ts | 78.26% | 69.86% | 91.66% | 85.18% |
| statisticsEngine.ts | 94.08% | 70.91% | 93.22% | 95.44% |
| geminiClient.ts | 5.88% | 0% | 7.69% | 6.25% |
| openaiClient.ts | 4.06% | 0% | 7.69% | 4.23% |

> **注記**: geminiClient.ts と openaiClient.ts のカバレッジが低いのは、外部APIとの通信を行うクライアントであり、モック化が必要なためです。

### テストファイル一覧

| ファイル | テスト数 | 内容 |
|----------|----------|------|
| dataParser.test.ts | 12 | JSONパース、バリデーション |
| statisticsEngine.test.ts | 26 | 統計計算ロジック |
| clientFactory.test.ts | 3 | APIクライアント生成 |
| AnalysisContext.test.tsx | 12 | 状態管理、リセット機能 |
| ProgressBar.test.tsx | 10 | プログレスバー表示 |
| FileUploader.test.tsx | 12 | ファイルアップロード |
| StatsCard.test.tsx | 14 | 統計カード表示 |

### テスト実行コマンド

```bash
# ウォッチモードでテスト実行
npm test

# 一回だけテスト実行
npm run test:run

# カバレッジ付きでテスト実行
npm run test:coverage
```

## 機能

- ChatGPTエクスポートデータ（conversations.json）の解析
- 利用統計の可視化（頻度、アクティビティパターン、セッション傾向）
- LLM駆動の深層分析（トピック分類、文体診断）
- カード形式での分析結果表示
- 画像エクスポート機能

## APIキー設定

アプリ内のUIからAPIキーを入力します。キーはブラウザのlocalStorageに保存されます。

### 対応モデル

| プロバイダー | Chat | Embedding |
|-------------|------|-----------|
| OpenAI | gpt-5-nano | text-embedding-3-small |
| Gemini | gemini-2.0-flash | text-embedding-004 |

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint
npm run lint
```

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
