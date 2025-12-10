# Implementation Plan

## Tasks

- [x] 1. (P) ApiKeyManagerにOpenAIモデル情報を表示する
  - OpenAIプロバイダー選択時に、使用モデル名（gpt-5-nano、text-embedding-3-small）を画面に表示する
  - APIキー設定済み状態の表示エリアにモデル情報テキストを追加する
  - Gemini選択時にはOpenAIモデル情報が表示されないことを確認する
  - _Requirements: 1.1_

- [x] 2. (P) 環境変数設定のドキュメントをREADMEに追加する
  - VITE_OPENAI_API_KEY および VITE_GEMINI_API_KEY の設定方法を説明するセクションを追加する
  - .envファイルの作成手順と変数の書式を記載する
  - localStorageと環境変数の優先順位（localStorage > 環境変数）を明記する
  - _Requirements: 5.3_

- [x] 3. 動作確認と検証
  - OpenAI選択時にモデル名が正しく表示されることを確認する
  - Gemini選択時にOpenAIモデル情報が表示されないことを確認する
  - 環境変数設定のドキュメントが正確であることを確認する
  - _Requirements: 1.1, 5.3_

## Requirements Coverage

| Requirement | Task | Status |
|-------------|------|--------|
| 1.1 | 1, 3 | 追加実装 |
| 1.2 | - | 実装済み（OpenAIClient） |
| 1.3 | - | 実装済み（OpenAIClient） |
| 2.1 | - | 実装済み（ApiKeyManager） |
| 2.2 | - | 実装済み（ApiKeyManager） |
| 2.3 | - | 実装済み（ApiKeyManager） |
| 2.4 | - | 実装済み（ApiKeyManager） |
| 3.1 | - | 実装済み（OpenAIClient） |
| 3.2 | - | 実装済み（OpenAIClient） |
| 3.3 | - | 実装済み（OpenAIClient） |
| 3.4 | - | 実装済み（OpenAIClient） |
| 3.5 | - | 実装済み（OpenAIClient） |
| 4.1 | - | 実装済み（OpenAIClient） |
| 4.2 | - | 実装済み（OpenAIClient） |
| 4.3 | - | 実装済み（OpenAIClient） |
| 5.1 | - | 実装済み（ApiKeyManager） |
| 5.2 | - | 実装済み（ApiKeyManager） |
| 5.3 | 2, 3 | 追加実装 |
| 6.1 | - | 実装済み（ApiKeyManager） |
| 6.2 | - | 実装済み（ApiKeyManager） |
| 6.3 | - | 実装済み（ApiKeyManager） |
| 6.4 | - | 実装済み（clientFactory） |
