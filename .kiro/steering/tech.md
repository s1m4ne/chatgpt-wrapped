# Technology Stack

## Architecture

シングルページアプリケーション（SPA）。クライアントサイドのみで動作し、バックエンドサーバーを持たない。LLM分析はユーザー提供のAPIキーを使って直接Gemini APIを呼び出す。

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Runtime**: ブラウザ (ES2022)

## Key Libraries

- **@google/generative-ai**: Gemini API クライアント
- **openai**: OpenAI API クライアント
- **Tailwind CSS 4**: ユーティリティファーストスタイリング
- **Recharts**: データ可視化（チャート）
- **html2canvas**: DOM→画像エクスポート
- **@saehrimnir/druidjs**: 次元削減（Intelligence Map用）

## Development Standards

### Type Safety
- TypeScript strict mode有効
- `noUnusedLocals`, `noUnusedParameters` 有効
- 明示的な型定義を推奨、`any`は避ける

### Code Quality
- ESLint + Prettier
- react-hooks, react-refresh ルール適用
- `npm run lint` でチェック

### Testing
- (現時点ではテスト未設定)

## Development Environment

### Required Tools
- Node.js (ES2022対応バージョン)
- npm

### Common Commands
```bash
# Dev: npm run dev
# Build: npm run build
# Lint: npm run lint
# Preview: npm run preview
```

## Key Technical Decisions

- **クライアントサイド完結**: プライバシー保護のためサーバーレス設計
- **マルチLLMサポート**: Gemini/OpenAI両対応、Factory Patternでクライアント抽象化
- **React Context**: 分析状態管理に`useReducer` + Context API
- **Vite**: 高速HMRと最新ESモジュール対応
- **Tailwind CSS 4**: Viteプラグインとして統合（PostCSS不要）

---
_Document standards and patterns, not every dependency_
