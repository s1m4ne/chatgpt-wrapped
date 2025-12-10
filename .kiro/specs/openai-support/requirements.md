# Requirements Document

## Introduction

ChatGPT Wrappedアプリケーションにおいて、現在Gemini APIのみで提供しているLLM分析機能を、OpenAI APIでも利用可能にする。ユーザーはGeminiまたはOpenAIのいずれかを選択して分析を実行できるようになる。これにより、ユーザーの既存のAPIキー資産を活用でき、サービスの柔軟性が向上する。

## Requirements

### Requirement 1: LLMプロバイダー選択

**Objective:** As a ユーザー, I want 分析に使用するLLMプロバイダー（Gemini/OpenAI）を選択したい, so that 手持ちのAPIキーを活用できる

#### Acceptance Criteria
1. When ユーザーがAPIキー設定画面を開いた時, the ApiKeyManager shall プロバイダー選択UI（Gemini/OpenAI）を表示する
2. When ユーザーがプロバイダーを選択した時, the ApiKeyManager shall 選択されたプロバイダーに対応したAPIキー入力フィールドを表示する
3. The ApiKeyManager shall 選択されたプロバイダーとAPIキーをlocalStorageに永続化する

### Requirement 2: OpenAI APIクライアント

**Objective:** As a システム, I want OpenAI APIと通信するクライアントを実装したい, so that OpenAIモデルで分析を実行できる

#### Acceptance Criteria
1. The OpenAIClient shall GeminiClientと同一のインターフェース（generateWithSchema, generate, getEmbedding）を提供する
2. When APIリクエストがレート制限に達した時, the OpenAIClient shall 指数バックオフでリトライする（最大3回）
3. When APIキーが無効な時, the OpenAIClient shall 認証エラーを適切なエラーコードで返却する
4. When ネットワークエラーが発生した時, the OpenAIClient shall リトライ可能なエラーとして処理する
5. The OpenAIClient shall タイムアウト（60秒）を設定し、超過時にタイムアウトエラーを返却する

### Requirement 3: APIキー検証

**Objective:** As a ユーザー, I want 入力したAPIキーが有効か即座に確認したい, so that 無効なキーで分析を開始しない

#### Acceptance Criteria
1. When ユーザーがOpenAI APIキーを送信した時, the ApiKeyManager shall OpenAI APIへテストリクエストを送信して検証する
2. If APIキーが無効な時, then the ApiKeyManager shall エラーメッセージ「無効なAPIキーです」を表示する
3. If APIキーに必要な権限がない時, then the ApiKeyManager shall エラーメッセージ「APIキーに必要な権限がありません」を表示する
4. While 検証中, the ApiKeyManager shall ローディングインジケーターを表示する

### Requirement 4: 分析オーケストレーター統合

**Objective:** As a システム, I want 選択されたプロバイダーに応じて適切なクライアントを使用したい, so that 統一されたインターフェースで分析を実行できる

#### Acceptance Criteria
1. When 分析開始時にプロバイダーがOpenAIの場合, the AnalysisOrchestrator shall OpenAIClientを使用して分析を実行する
2. When 分析開始時にプロバイダーがGeminiの場合, the AnalysisOrchestrator shall GeminiClientを使用して分析を実行する
3. The AnalysisOrchestrator shall プロバイダーに依存しない統一されたエラーハンドリングを提供する

### Requirement 5: 環境変数対応

**Objective:** As a 開発者, I want 環境変数からAPIキーを読み込みたい, so that 開発時に毎回入力する手間を省ける

#### Acceptance Criteria
1. When アプリケーション起動時にVITE_OPENAI_API_KEYが設定されている時, the ApiKeyManager shall 環境変数からOpenAI APIキーを自動読み込みする
2. When 環境変数とlocalStorageの両方にキーがある時, the ApiKeyManager shall localStorageの値を優先する
3. The ApiKeyManager shall 環境変数から読み込んだキーも検証を実行する
