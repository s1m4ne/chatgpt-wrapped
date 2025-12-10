# Project Structure

## Organization Philosophy

レイヤードアーキテクチャ。`src/`配下を機能レイヤー（types, services, contexts, components）で分割。各レイヤーは`index.ts`で公開APIを集約し、外部からは`index.ts`経由でインポートする。

## Directory Patterns

### Types (`src/types/`)
**Purpose**: アプリケーション全体で使用する型定義
**Pattern**: ドメイン別にファイル分割（conversation, statistics, analysis, errors, llm）
**Example**: `Conversation`, `Message`, `BasicStats`, `LLMClient` など

### Services (`src/services/`)
**Purpose**: ビジネスロジック、外部API連携、データ処理
**Pattern**: 単一責務のモジュール、クラスまたは関数でエクスポート
**LLM Client Pattern**: `clientFactory.ts`でLLMクライアントを抽象化、`geminiClient.ts`/`openaiClient.ts`で具体実装
**Example**: `dataParser.ts`（ファイル解析）, `analysisOrchestrator.ts`（分析フロー制御）, `exportService.ts`（画像エクスポート）

### Contexts (`src/contexts/`)
**Purpose**: React Context による状態管理
**Pattern**: `useReducer`パターン、Provider + カスタムフック
**Example**: `AnalysisContext.tsx` → `useAnalysis()`

### Hooks (`src/hooks/`)
**Purpose**: 再利用可能なカスタムReact Hooks
**Pattern**: `use`プレフィックス、単一責務

### Components (`src/components/`)
**Purpose**: UIコンポーネント
**Pattern**:
- ルート直下: 共通コンポーネント（FileUploader, ProgressBar, CardSwiper, ApiKeyManager）
- `cards/`: 分析結果表示カード（StatsCard, TopicCard など）

## Naming Conventions

- **Files**: PascalCase（コンポーネント）, camelCase（サービス・ユーティリティ）
- **Components**: PascalCase、ファイル名と一致
- **Functions/Variables**: camelCase
- **Types/Interfaces**: PascalCase

## Import Organization

```typescript
// 1. React/外部ライブラリ
import { useState, useCallback } from 'react'

// 2. 内部モジュール（index.tsから）
import { useAnalysis } from './contexts'
import { parseConversationsFile } from './services'

// 3. ローカルインポート
import { StatsCard } from './cards/StatsCard'
```

**Path Aliases**: 現時点では相対パス使用（`./`, `../`）

## Code Organization Principles

- **Barrel Exports**: 各レイヤーは`index.ts`で公開APIを定義
- **単方向依存**: components → contexts → services → types
- **カード追加パターン**: 新しい分析カードは`src/components/cards/`に追加し、`components/index.ts`でエクスポート
- **LLMクライアント拡張**: 新しいLLMプロバイダーは`src/services/`に`xxxClient.ts`として追加し、`clientFactory.ts`で統合

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
