# ChatGPT Wrapped

ChatGPTの利用履歴を可視化・分析するWebアプリケーション。Spotify Wrappedにインスパイアされ、1年間のAI対話パターンを美しく振り返ることができます。

## 機能

- ChatGPTエクスポートデータ（conversations.json）の解析
- 利用統計の可視化（頻度、アクティビティパターン、セッション傾向）
- LLM駆動の深層分析（トピック分類、文体診断）
- カード形式での分析結果表示
- 画像エクスポート機能

## 環境変数設定

開発時にUIを操作せずAPIキーを設定できます。

### 設定方法

1. プロジェクトルートに `.env` ファイルを作成
2. 以下の変数を設定:

```env
# Gemini API Key
VITE_GEMINI_API_KEY=your-gemini-api-key

# OpenAI API Key
VITE_OPENAI_API_KEY=your-openai-api-key
```

### 優先順位

localStorage > 環境変数

UIで設定したキーが優先されます。環境変数は初期値として使用されますが、UIでキーを設定・保存するとそちらが使用されます。

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
