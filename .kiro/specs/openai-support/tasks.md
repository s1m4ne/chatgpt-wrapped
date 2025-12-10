# Implementation Plan

## Tasks

- [ ] 1. LLMクライアント抽象化基盤の構築
- [ ] 1.1 (P) 共通インターフェースと型定義の作成
  - LLMClientインターフェースを定義し、テキスト生成・スキーマ付き生成・Embedding取得・中断の4メソッドを規定する
  - JSON Schema型を定義し、OpenAI互換形式を共通スキーマ形式として採用する
  - LLMProviderの型（gemini/openai）を定義する
  - 既存のAnalysisResult型を活用してプロバイダー非依存の戻り値型を統一する
  - _Requirements: 2.1, 4.1, 4.2, 4.3_

- [ ] 1.2 既存GeminiClientをLLMClientインターフェースに準拠させる
  - GeminiClientクラスにLLMClientインターフェースを実装する
  - 現行のSchemaType形式からJSON Schema形式への変換ユーティリティを作成する
  - 既存の機能（generateWithSchema, generate, getEmbedding, abort）が正常に動作することを確認する
  - 変換処理で必須プロパティとadditionalPropertiesの設定を適切に行う
  - _Requirements: 4.2_

- [ ] 2. OpenAIクライアントの実装
- [ ] 2.1 openai SDKのインストールと基本設定
  - npm経由でopenaiパッケージをインストールする
  - TypeScript型定義が正しく認識されることを確認する
  - _Requirements: 2.1_

- [ ] 2.2 OpenAIClientクラスの実装（テキスト生成）
  - LLMClientインターフェースを実装するOpenAIClientクラスを作成する
  - gpt-5-nanoモデルを使用したテキスト生成機能を実装する
  - Structured Outputs対応（response_format: json_schema）でスキーマ付き生成を実装する
  - 60秒のタイムアウト設定を実装する
  - abort()メソッドでリクエストキャンセル機能を実装する
  - _Requirements: 2.1, 2.5_

- [ ] 2.3 OpenAIClientのエラーハンドリングとリトライ機構
  - APIエラーを既存のApiErrorコードにマッピングする（429→RATE_LIMIT、401→AUTH_ERROR等）
  - 指数バックオフによるリトライ機構を実装する（最大3回、初期1秒）
  - ネットワークエラーをリトライ可能エラーとして処理する
  - タイムアウトエラーの適切なハンドリングを実装する
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 2.4 (P) OpenAIClientのEmbedding機能実装
  - text-embedding-3-smallモデルを使用したEmbedding生成を実装する
  - リトライ機構とエラーハンドリングを適用する
  - IntelligenceMapサービスとの互換性を確保する
  - _Requirements: 2.1_

- [ ] 3. クライアントファクトリーとオーケストレーター統合
- [ ] 3.1 ClientFactoryの実装
  - プロバイダー種別とAPIキーを受け取り、適切なLLMClientインスタンスを生成するファクトリー関数を作成する
  - 不明なプロバイダーに対するエラーハンドリングを実装する
  - 型安全なプロバイダー判定を行う
  - _Requirements: 4.1, 4.2_

- [ ] 3.2 AnalysisOrchestratorの修正
  - コンストラクタでプロバイダーとAPIキーを受け取り、ClientFactoryを使用してクライアントを生成するよう変更する
  - IntelligenceMapServiceにも同様のプロバイダー対応を適用する
  - 既存のGemini専用コードをプロバイダー非依存に変更する
  - エラーハンドリングを統一し、プロバイダーに依存しない形式で処理する
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4. プロバイダー選択UI
- [ ] 4.1 ApiKeyManagerのプロバイダー選択機能追加
  - Gemini/OpenAIを切り替えるタブUIまたはセレクトボックスを追加する
  - 選択されたプロバイダーに応じたAPIキー入力フィールドを表示する
  - プロバイダー切り替え時に前回保存したキーを復元する
  - プレースホルダーテキストをプロバイダーに応じて変更する（AIza... / sk-...）
  - _Requirements: 1.1, 1.2_

- [ ] 4.2 OpenAI APIキー検証機能
  - OpenAI APIへのテストリクエストでキーを検証する機能を実装する
  - 検証中のローディングインジケーターを表示する
  - 無効なキーに対して「無効なAPIキーです」エラーを表示する
  - 権限不足に対して「APIキーに必要な権限がありません」エラーを表示する
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4.3 永続化と環境変数対応
  - localStorageにプロバイダー種別とプロバイダー別のAPIキーを保存する
  - アプリケーション起動時にVITE_OPENAI_API_KEY環境変数からの自動読み込みを実装する
  - 環境変数とlocalStorageの両方にキーがある場合はlocalStorageを優先する
  - 環境変数から読み込んだキーも検証を実行する
  - _Requirements: 1.3, 5.1, 5.2, 5.3_

- [ ] 5. Appコンポーネントとの統合
- [ ] 5.1 分析実行フローの修正
  - Appコンポーネントでプロバイダー情報を状態管理に追加する
  - ApiKeyManagerからのコールバックでプロバイダーとキーの両方を受け取る
  - AnalysisOrchestratorの生成時にプロバイダー情報を渡す
  - 分析開始時に選択されたプロバイダーでクライアントが生成されることを確認する
  - _Requirements: 4.1, 4.2_

- [ ] 5.2 エクスポート設定の更新
  - servicesのindex.tsにOpenAIClient、ClientFactory、LLMClient型をエクスポートに追加する
  - typesのindex.tsにLLMProvider、JSONSchema型をエクスポートに追加する
  - 既存のBarrel Exportsパターンを維持する
  - _Requirements: 2.1, 4.1_

- [ ] 6. 動作確認とテスト
- [ ] 6.1 手動統合テスト
  - OpenAI APIキーでの分析実行が正常に動作することを確認する
  - Gemini APIキーでの既存機能が引き続き動作することを確認する
  - プロバイダー切り替え時のキー保持が正しく動作することを確認する
  - エラーケース（無効なキー、ネットワークエラー、レート制限）の動作を確認する
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
