# Research & Design Decisions

## Summary
- **Feature**: `openai-gpt5-nano-support`
- **Discovery Scope**: Extension（既存実装の軽微な拡張）
- **Key Findings**:
  - gpt-5-nano およびtext-embedding-3-small は既に OpenAIClient に実装済み
  - ApiKeyManager にモデル名表示機能が不足
  - ドキュメント整備（README等）が未完了

## Research Log

### 既存実装の完成度調査
- **Context**: 要件とコードベースのギャップを特定
- **Sources Consulted**: `src/services/openaiClient.ts`, `src/components/ApiKeyManager.tsx`, `src/types/llm.ts`
- **Findings**:
  - OpenAIClient: gpt-5-nano (L61, L112), text-embedding-3-small (L151) ハードコード済み
  - リトライロジック: MAX_RETRIES=3, 指数バックオフ実装済み
  - Structured Outputs: `prepareOpenAISchema` 関数で additionalProperties: false 追加済み
  - エラーハンドリング: 401/403/429/500/503 対応済み
  - タイムアウト: REQUEST_TIMEOUT_MS=60000 設定済み
- **Implications**: 主要機能は全て実装済み。UI表示とドキュメントのみ追加

### モデル情報の可視化
- **Context**: Requirement 1.1 - ユーザーへのモデル名表示
- **Sources Consulted**: `ApiKeyManager.tsx`
- **Findings**:
  - 現状: プロバイダー名（Gemini/OpenAI）のみ表示
  - 不足: 使用モデル名（gpt-5-nano, text-embedding-3-small）の表示なし
- **Implications**: APIキー設定済み画面にモデル情報を追加する必要あり

### 環境変数とlocalStorage優先順位
- **Context**: Requirement 5.1, 5.2 - 設定の優先順位確認
- **Sources Consulted**: `ApiKeyManager.tsx:35-37`
- **Findings**:
  - 実装済み: `storedOpenAIKey || ENV_OPENAI_KEY || null`
  - localStorage > 環境変数 > null の優先順位で動作
- **Implications**: 要件通りに実装済み

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存拡張 | ApiKeyManagerに情報表示を追加 | 最小変更、既存パターン維持 | なし | **採用** |

## Design Decisions

### Decision: モデル情報の表示方法
- **Context**: ユーザーが使用モデルを把握できるようにする
- **Alternatives Considered**:
  1. 定数として直接表示
  2. 設定ファイルから読み込み
- **Selected Approach**: 定数として直接表示（`gpt-5-nano`, `text-embedding-3-small`）
- **Rationale**: モデルはOpenAIClientでハードコードされており、動的変更の予定なし
- **Trade-offs**: 将来モデル変更時に2箇所修正が必要だが、現時点では最もシンプル
- **Follow-up**: モデル選択機能追加時には設定の一元化を検討

### Decision: ドキュメント追加対象
- **Context**: Requirement 5.3 - 環境変数設定のドキュメント化
- **Selected Approach**: READMEに環境変数セクションを追加
- **Rationale**: プロジェクトの標準的なドキュメント配置

## Risks & Mitigations
- **リスク1**: モデル名変更時の更新漏れ → 定数を1箇所に集約する将来リファクタリングで対応可能
- **リスク2**: なし（実装規模が極めて小さい）

## References
- [OpenAI API Documentation](https://platform.openai.com/docs) — gpt-5-nano モデル仕様
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) — JSON Schema形式
