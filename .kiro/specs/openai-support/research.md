# Research & Design Decisions

## Summary
- **Feature**: openai-support
- **Discovery Scope**: Extension（既存システムへの機能追加）
- **Key Findings**:
  - OpenAI API は `gpt-5-nano` モデルを提供（$0.05/1M input, $0.40/1M output）
  - Structured Outputs は `response_format: { type: "json_schema" }` で利用可能
  - Embeddings は `text-embedding-3-small` モデルが最もコスト効率が良い

## Research Log

### OpenAI gpt-5-nano モデル仕様
- **Context**: ユーザーが `gpt-5-nano` モデルの使用を指定
- **Sources Consulted**:
  - [OpenAI GPT-5 Nano Documentation](https://platform.openai.com/docs/models/gpt-5-nano)
  - [OpenAI GPT-5 Announcement](https://openai.com/index/introducing-gpt-5-for-developers/)
- **Findings**:
  - GPT-5シリーズは2025年8月リリース（gpt-5, gpt-5-mini, gpt-5-nano）
  - gpt-5-nano は超低レイテンシ・高効率モデル
  - 価格: $0.05/1M input tokens, $0.40/1M output tokens
  - Chat Completions API および Responses API で利用可能
  - `reasoning_effort` および `verbosity` パラメータをサポート
- **Implications**: GeminiのFlashモデルと同様のユースケース（高速・低コスト）に適合

### OpenAI Structured Outputs
- **Context**: 現行GeminiClientの `generateWithSchema` メソッドと同等機能の実現
- **Sources Consulted**:
  - [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
  - [OpenAI API Introducing Structured Outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/)
- **Findings**:
  - `response_format: { type: "json_schema", json_schema: { name, schema, strict: true } }` で利用
  - gpt-5-nano を含む最新モデルでサポート
  - スキーマ要件: 全プロパティ required、additionalProperties: false
  - JavaScript SDK は `zodResponseFormat` ヘルパーを提供（Zod統合）
- **Implications**: Gemini APIのスキーマ形式（SchemaType）からOpenAI JSON Schema形式への変換が必要

### OpenAI Embeddings API
- **Context**: Intelligence Map生成で使用するembeddings機能
- **Sources Consulted**:
  - [OpenAI Embeddings API Reference](https://platform.openai.com/docs/api-reference/embeddings)
  - [text-embedding-3-small Model](https://platform.openai.com/docs/models/text-embedding-3-small)
- **Findings**:
  - `text-embedding-3-small`: コスト効率最良、$0.00002/1k tokens
  - 最大入力: 8,192 tokens
  - 出力次元数: デフォルト1536、configurable（dimensions パラメータ）
  - Geminiの `text-embedding-004` と同等の用途
- **Implications**: getEmbedding メソッドは直接対応可能

### OpenAI JavaScript SDK
- **Context**: クライアント実装のライブラリ選定
- **Sources Consulted**:
  - [openai npm package](https://www.npmjs.com/package/openai)
- **Findings**:
  - 公式SDK: `openai` パッケージ
  - TypeScript完全サポート
  - `openai.chat.completions.create()` でChat Completions API呼び出し
  - エラーハンドリング: `OpenAI.APIError` クラスで status code ベースの判定
- **Implications**: @google/generative-ai と同様のパターンで実装可能

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Strategy Pattern | 共通インターフェース + プロバイダー別実装 | 拡張性高、テスト容易 | インターフェース設計が重要 | 選択 |
| Adapter Pattern | 各APIを共通形式にラップ | 既存コード変更最小 | アダプター層のオーバーヘッド | Strategy内で部分採用 |
| Factory Pattern | プロバイダー名からクライアント生成 | 生成ロジック集約 | 単独では不十分 | Strategy と併用 |

## Design Decisions

### Decision: LLMクライアントインターフェース抽象化
- **Context**: GeminiClientとOpenAIClientで同一インターフェースを提供する必要
- **Alternatives Considered**:
  1. 既存GeminiClientを直接拡張 — シンプルだが責務混在
  2. 抽象インターフェース定義 + 具象クラス — 明確な分離
- **Selected Approach**: `LLMClient` インターフェースを定義し、`GeminiClient` と `OpenAIClient` が実装
- **Rationale**: Open/Closed原則に従い、将来の他プロバイダー追加も容易
- **Trade-offs**: 若干のコード増加、ただし保守性向上
- **Follow-up**: 既存GeminiClientのリファクタリング必要

### Decision: スキーマ変換アプローチ
- **Context**: GeminiのSchemaType形式とOpenAIのJSON Schema形式の差異
- **Alternatives Considered**:
  1. 各クライアントで独自スキーマ形式を受け取る — 呼び出し側の複雑化
  2. 共通スキーマ形式を定義し内部で変換 — クライアント内で吸収
  3. JSON Schemaを共通形式とし、Gemini側で変換 — 標準形式採用
- **Selected Approach**: オプション3 — JSON Schemaを共通形式とし、GeminiClient内でSchemaType形式に変換
- **Rationale**: JSON Schemaは業界標準、OpenAIはそのまま利用可能
- **Trade-offs**: GeminiClient側に変換ロジック追加
- **Follow-up**: 変換ユーティリティの実装

### Decision: 使用モデル
- **Context**: ユーザー指定の `gpt-5-nano` 採用
- **Selected Approach**:
  - テキスト生成: `gpt-5-nano`
  - Embeddings: `text-embedding-3-small`
- **Rationale**: 低コスト・高速、Gemini Flashとの対称性

## Risks & Mitigations
- **スキーマ互換性**: 複雑なスキーマでGemini/OpenAI間の挙動差異 → 共通テストケースで検証
- **レート制限差異**: プロバイダーごとに制限が異なる → エラーコードで適切にハンドリング
- **APIバージョン更新**: 将来的なAPI変更 → SDK依存を最小化、バージョン固定

## References
- [OpenAI GPT-5 Nano](https://platform.openai.com/docs/models/gpt-5-nano)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI text-embedding-3-small](https://platform.openai.com/docs/models/text-embedding-3-small)
- [OpenAI Node.js SDK](https://www.npmjs.com/package/openai)
