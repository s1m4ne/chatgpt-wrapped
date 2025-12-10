# Requirements Document

## Introduction

本仕様は、ChatGPT Wrappedアプリケーションにおいて、OpenAI gpt-5-nano モデルを正式にサポートするための要件を定義する。現在の実装では gpt-5-nano が既にハードコードされているが、本仕様ではモデル選択の柔軟性、設定の永続化、ドキュメント整備を通じて正式なサポートを確立する。

## Requirements

### Requirement 1: モデル設定の可視化と管理

**Objective:** ユーザーとして、使用中のOpenAIモデル（gpt-5-nano）を確認・理解したい。これにより、分析に使用されるモデルを把握し、コスト予測ができる。

#### Acceptance Criteria

1. When ユーザーがOpenAIプロバイダーを選択した場合, the ApiKeyManager shall 使用モデル名（gpt-5-nano）を表示する
2. The OpenAIClient shall gpt-5-nano モデルを使用してテキスト生成を実行する
3. The OpenAIClient shall text-embedding-3-small モデルを使用してEmbedding生成を実行する

### Requirement 2: APIキー検証とエラーハンドリング

**Objective:** ユーザーとして、OpenAI APIキーが正しく機能するか事前に確認したい。これにより、分析実行前に設定問題を解決できる。

#### Acceptance Criteria

1. When ユーザーがOpenAI APIキーを入力して送信した場合, the ApiKeyManager shall OpenAI APIにリクエストを送信してキーの有効性を検証する
2. If APIキーが無効（401エラー）の場合, then the ApiKeyManager shall 「無効なAPIキーです」というエラーメッセージを表示する
3. If APIキーに権限がない（403エラー）の場合, then the ApiKeyManager shall 「APIキーに必要な権限がありません」というエラーメッセージを表示する
4. While APIキー検証中, the ApiKeyManager shall ローディングインジケータを表示する

### Requirement 3: リトライとエラーリカバリ

**Objective:** システムとして、一時的なAPI障害から自動回復したい。これにより、ユーザー体験を損なわずに分析を完了できる。

#### Acceptance Criteria

1. If レート制限（429エラー）が発生した場合, then the OpenAIClient shall 指数バックオフで最大3回リトライする
2. If タイムアウトが発生した場合, then the OpenAIClient shall 指数バックオフで最大3回リトライする
3. If サーバーエラー（500/503）が発生した場合, then the OpenAIClient shall 指数バックオフで最大3回リトライする
4. If ネットワークエラーが発生した場合, then the OpenAIClient shall 指数バックオフで最大3回リトライする
5. The OpenAIClient shall 60秒のタイムアウトを設定する

### Requirement 4: Structured Output対応

**Objective:** システムとして、gpt-5-nano のStructured Output機能を活用したい。これにより、LLM分析結果を確実にパースできる。

#### Acceptance Criteria

1. When スキーマ付きでテキスト生成を要求した場合, the OpenAIClient shall JSON Schema形式でレスポンスフォーマットを指定する
2. The OpenAIClient shall OpenAI Structured Outputs形式に準拠してスキーマを変換する（additionalProperties: false を追加）
3. When レスポンスを受信した場合, the OpenAIClient shall JSONとしてパースしてデータを返却する

### Requirement 5: 環境変数によるAPIキー設定

**Objective:** 開発者として、環境変数でAPIキーを設定したい。これにより、開発・テスト時にUIを操作せずに設定できる。

#### Acceptance Criteria

1. When VITE_OPENAI_API_KEY環境変数が設定されている場合, the ApiKeyManager shall 初期値としてその値を使用する
2. When localStorageにキーが保存されている場合, the ApiKeyManager shall 環境変数より優先してlocalStorageの値を使用する
3. The Application shall .envファイルでVITE_OPENAI_API_KEYを設定する方法をドキュメント化する

### Requirement 6: プロバイダー切り替え

**Objective:** ユーザーとして、GeminiとOpenAIを簡単に切り替えたい。これにより、好みや用途に応じてLLMを選択できる。

#### Acceptance Criteria

1. The ApiKeyManager shall GeminiとOpenAIの2つのプロバイダー選択ボタンを表示する
2. When プロバイダーを切り替えた場合, the ApiKeyManager shall 対応するAPIキー入力状態を復元する
3. When プロバイダーを切り替えた場合, the ApiKeyManager shall 選択したプロバイダーをlocalStorageに保存する
4. The clientFactory shall プロバイダーに応じて適切なLLMクライアントインスタンスを生成する

## Non-Functional Requirements

### NFR-1: パフォーマンス
- The OpenAIClient shall 各APIリクエストを60秒以内に完了する、または適切にタイムアウトする

### NFR-2: セキュリティ
- The Application shall APIキーをサーバーに送信しない（クライアントサイド完結）
- The ApiKeyManager shall APIキーをパスワードフィールドでマスク表示する

### NFR-3: 互換性
- The OpenAIClient shall LLMClientインターフェースに準拠する
- The OpenAIClient shall 既存のGeminiClient実装と同等の機能を提供する
