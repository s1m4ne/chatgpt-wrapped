# Research & Design Decisions

## Summary
- **Feature**: `github-chat-analyzer` (ChatGPT Wrapped)
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - Google Gemini Embeddings API (gemini-embedding-001) は $0.15/1M tokens、Free tierあり
  - Gemini 2.0 Flash は高性能かつ無料枠が充実
  - ブラウザ内PCA実行にはDRUIDJS（2024年更新）が最適
  - conversations.json は tree構造の mapping オブジェクトを持つ複雑なフォーマット

## Research Log

### Google Gemini Embeddings API
- **Context**: 知性マップ（2Dプロット）とトピック分類に必要
- **Sources Consulted**:
  - [Gemini Embedding Documentation](https://ai.google.dev/gemini-api/docs/embeddings)
  - [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
  - [Gemini Embedding Blog](https://developers.googleblog.com/en/gemini-embedding-available-gemini-api/)
- **Findings**:
  - **gemini-embedding-001** (最新GA): $0.15/1M tokens (Paid)、Free tierあり
  - デフォルト3072次元、outputDimensionalityで768/1536/3072を選択可能
  - Matryoshka Representation Learning (MRL) 技術で次元削減しても品質維持
  - Batch APIで50%割引
  - MTEB Multilingual leaderboardで1位
  - text-embedding-004は2025年11月18日に廃止予定
- **Implications**:
  - Free tierで開発・テスト可能
  - 768次元で十分な品質を維持しつつストレージ節約
  - @google/generative-ai SDKで簡単に呼び出し

### Google Gemini 2.0 Flash API
- **Context**: トピック分類、感情分析、診断生成に必要
- **Sources Consulted**:
  - [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
  - [Gemini 2.0 Flash Documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-0-flash)
  - [Gemini 2.0 Blog](https://developers.googleblog.com/en/start-building-with-the-gemini-2-0-flash-family/)
- **Findings**:
  - **gemini-2.0-flash**: 高性能、1Mトークンコンテキスト
  - Free tierあり（15 RPM制限）
  - Paid tierは2000 RPM
  - responseSchema（JSON Schema）で構造化出力対応
  - Gemini 1.5 Flash/Proより高性能
  - 4文字 ≈ 1トークン
- **Implications**:
  - Free tierで開発・テスト可能
  - responseSchemaでJSON形式のレスポンスを強制可能
  - 1Mコンテキストで長い会話も一括処理可能

### ChatGPT Export Format (conversations.json)
- **Context**: データ入力の解析に必要
- **Sources Consulted**:
  - [OpenAI Community Discussion](https://community.openai.com/t/decoding-exported-data-by-parsing-conversations-json-and-or-chat-html/403144)
  - [OpenAI Forum - JSON Structure](https://community.openai.com/t/questions-about-the-json-structures-in-the-exported-conversations-json/954762)
  - **実データ解析** (conversations.json - 2MB, 70会話)
- **Findings (実データより確認)**:
  - **ルート構造**: 会話オブジェクトの配列 `RawConversation[]`
  - **会話キー**: `id`, `title`, `create_time`, `update_time`, `mapping`, `current_node`, `conversation_id`, `default_model_slug`, `gizmo_id`, `gizmo_type`, `is_archived`, `is_starred`, `is_read_only`, `is_do_not_remember`, `moderation_results`, `plugin_ids`, `safe_urls`, `blocked_urls`, `conversation_origin`, `voice`, `async_status`, `disabled_tool_ids`, `memory_scope`, `context_scopes`, `sugar_item_id`, `sugar_item_visible`, `is_study_mode`, `owner`
  - **mapping構造**: `{ [nodeId]: { id, parent, children, message } }`
  - **ルートノード**: `client-created-root` という名前で、`message: null`
  - **content_type**: `text`, `multimodal_text`, `code` の3種類を確認
  - **author.role**: `user`, `assistant`, `system`, `tool` の4種類を確認
  - **message内キー**: `id`, `author`, `create_time`, `update_time`, `content`, `status`, `end_turn`, `weight`, `metadata`, `recipient`, `channel`
  - **metadata内キー**: `finish_details`, `is_complete`, `citations`, `content_references`, `request_id`, `message_type`, `model_slug`, `default_model_slug`, `parent_id`, `timestamp_` など
- **Implications**:
  - mappingのtree構造を `parent`/`children` でトラバースしてフラット化
  - `client-created-root` から開始して深さ優先探索
  - `create_time` はUNIXタイムスタンプ（秒単位、小数点以下あり）
  - `multimodal_text` はテキスト部分のみ抽出（画像は無視）
  - `tool` roleはツール呼び出し結果（分析対象外にする可能性）
  - `gizmo_id` でカスタムGPT使用を検出可能

### ブラウザ内PCA/次元削減ライブラリ
- **Context**: 知性マップの2D可視化に必要
- **Sources Consulted**:
  - [DRUIDJS Paper](https://renecutura.eu/pdfs/Druid.pdf)
  - [ml-pca npm](https://www.npmjs.com/package/ml-pca)
  - [pca-js npm](https://www.npmjs.com/package/pca-js)
- **Findings**:
  - DRUIDJS: PCA, t-SNE, UMAP, MDS対応、2024年9月更新
  - ml-pca: シンプルなPCA実装、3年前更新
  - pca-js: 軽量、1ヶ月前更新
  - N < 500でDRUIDJS全メソッド1秒以内
- **Implications**:
  - DRUIDJSが最も機能豊富で最新
  - Embeddingsの次元（1536）を2Dに削減
  - t-SNEやUMAPも検討可能

### グラフ描画ライブラリ
- **Context**: ヒートマップ、時系列グラフ、2Dプロットに必要
- **Sources Consulted**:
  - [React Chart Libraries 2025](https://embeddable.com/blog/react-chart-libraries)
  - [LogRocket Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- **Findings**:
  - Nivo: D3ベース、heatmap対応、SVG/Canvas/HTML
  - ApexCharts: heatmap含む多様なチャート、1.3K+ GitHub stars
  - Chart.js (react-chartjs-2): Canvas、モバイル最適化
  - Recharts: React向け、シンプルAPI
- **Implications**:
  - ヒートマップ: Nivo または ApexCharts
  - 2Dプロット: D3.js直接 または Nivo scatter
  - 時系列: Recharts または Chart.js

### PDF/PNG エクスポート
- **Context**: 結果の保存・共有に必要
- **Sources Consulted**:
  - [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)
  - [jspdf-html2canvas npm](https://www.npmjs.com/package/jspdf-html2canvas)
- **Findings**:
  - html2pdf.js: html2canvas + jsPDFの統合ライブラリ
  - クライアントサイドで完結
  - 複数ページ対応、自動ページ分割
  - テキストは画像化されるため検索不可
- **Implications**:
  - html2pdf.jsが最もシンプル
  - カード単位でPNG、全体でPDF
  - canvas.toDataURL()でPNG生成

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| SPA (Single Page Application) | React単体、状態管理で完結 | シンプル、デプロイ容易 | 大規模になると複雑化 | ローカル完結に最適 |
| Component-Based | 機能ごとにコンポーネント分離 | 再利用性、テスト容易 | コンポーネント間通信 | React標準パターン |
| Flux/Redux | 単方向データフロー | 状態予測可能、デバッグ容易 | ボイラープレート多い | Context APIで代替可 |

**選択**: SPA + Component-Based + React Context API
- 理由: シンプルさ優先、ローカル完結、中規模アプリに適切

## Design Decisions

### Decision: フロントエンドフレームワーク
- **Context**: ブラウザベースのSPAが必要
- **Alternatives Considered**:
  1. Vanilla JS — 依存なし、軽量
  2. React — コンポーネント指向、エコシステム充実
  3. Vue — 学習コスト低、軽量
- **Selected Approach**: React (Vite)
- **Rationale**: コンポーネント再利用、豊富なライブラリ、TypeScript統合
- **Trade-offs**: バンドルサイズ増加、学習コスト
- **Follow-up**: Viteで高速開発環境構築

### Decision: 状態管理
- **Context**: 分析結果、APIキー、進行状況の管理
- **Alternatives Considered**:
  1. Redux — 大規模向け、ボイラープレート多い
  2. Zustand — 軽量、シンプル
  3. React Context — 標準、追加依存なし
- **Selected Approach**: React Context + useReducer
- **Rationale**: 追加ライブラリ不要、中規模アプリに十分
- **Trade-offs**: 大規模になると複雑化の可能性
- **Follow-up**: 必要に応じてZustandに移行可能

### Decision: グラフ描画ライブラリ
- **Context**: ヒートマップ、時系列、散布図が必要
- **Alternatives Considered**:
  1. Chart.js (react-chartjs-2) — Canvas、軽量
  2. Nivo — D3ベース、heatmap充実
  3. ApexCharts — 多機能、heatmap対応
- **Selected Approach**: Recharts + D3.js（2Dプロット用）
- **Rationale**: React最適化、シンプルAPI、カスタマイズ性
- **Trade-offs**: ヒートマップはカスタム実装が必要
- **Follow-up**: ヒートマップ用にNivo追加検討

### Decision: LLM API選択
- **Context**: テキスト分析とEmbeddings生成に必要
- **Alternatives Considered**:
  1. OpenAI API (GPT-4o-mini + text-embedding-3-small)
  2. Google Gemini API (gemini-2.0-flash + gemini-embedding-001)
  3. Anthropic Claude API
- **Selected Approach**: Google Gemini API
- **Rationale**:
  - Free tierが充実（開発・テストに最適）
  - gemini-2.0-flashは高性能かつ1Mコンテキスト
  - gemini-embedding-001はMTEB 1位の高品質
  - @google/generative-ai SDKで簡単に統合
  - responseSchemaで構造化出力が容易
- **Trade-offs**: OpenAIほどの情報量・コミュニティサポートはない
- **Follow-up**: .envでAPIキー管理、Free tier制限に注意

### Decision: API呼び出し方式
- **Context**: ユーザーのAPIキーでLLM分析
- **Alternatives Considered**:
  1. クライアント直接呼び出し — サーバー不要
  2. Lambda + API Gateway — キー隠蔽
  3. Cloudflare Workers — エッジ実行
- **Selected Approach**: クライアント直接呼び出し
- **Rationale**:
  - Gemini APIはCORS許可済み
  - サーバー不要でデプロイ簡単
  - .envでAPIキー管理（Vite環境変数）
- **Trade-offs**: APIキーがブラウザに露出（開発時は.env、本番はユーザー入力）
- **Follow-up**: localStorage保存時は暗号化検討

## Risks & Mitigations

- **APIレート制限** — バッチ処理、リトライ機構、エクスポネンシャルバックオフ
- **大量データ処理** — Web Workers、チャンク処理、プログレス表示
- **conversations.jsonフォーマット変更** — バージョン検出、フォールバック処理
- **Embeddings次元数** — PCA/t-SNEで2Dに削減、DRUIDJSで処理

## References
- [Gemini API Embeddings Documentation](https://ai.google.dev/gemini-api/docs/embeddings) — Gemini Embeddings API仕様
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing) — 料金とFree tier情報
- [Gemini 2.0 Flash Documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-0-flash) — generateContent API仕様
- [@google/generative-ai SDK](https://www.npmjs.com/package/@google/generative-ai) — 公式JavaScript SDK
- [DRUIDJS GitHub](https://github.com/saehm/DruidJS) — 次元削減ライブラリ
- [Recharts Documentation](https://recharts.org/) — Reactグラフライブラリ
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) — PDF/PNGエクスポート
