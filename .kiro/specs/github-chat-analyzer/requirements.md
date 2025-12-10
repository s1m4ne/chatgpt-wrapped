# Requirements Document

## Introduction
ChatGPT Wrappedは、ChatGPTの会話履歴エクスポートデータ（conversations.json）を読み込み、Spotify WrappedやYouTube Music Recap風に1年間の利用を"エモく振り返る"ブラウザベースの分析ダッシュボードです。ローカル環境で動作し、ユーザーが入力したOpenAI APIキーを使用してLLM分析を行います。

## Requirements

### Requirement 1: データ入力
**Objective:** As a ユーザー, I want ChatGPTエクスポートデータをアップロードする, so that 自分の会話履歴を分析できる

#### Acceptance Criteria
1. When ユーザーがconversations.jsonファイルをドラッグ&ドロップした時, the ChatGPT Wrapped shall ファイルを読み込み解析を開始する
2. When ユーザーがファイル選択ダイアログからJSONを選択した時, the ChatGPT Wrapped shall ファイルを読み込み解析を開始する
3. If 無効なJSON形式のファイルがアップロードされた場合, then the ChatGPT Wrapped shall エラーメッセージを表示する
4. If ChatGPTエクスポート形式と異なるJSONがアップロードされた場合, then the ChatGPT Wrapped shall フォーマットエラーを表示する

### Requirement 2: APIキー管理
**Objective:** As a ユーザー, I want OpenAI APIキーを入力する, so that LLM分析機能を利用できる

#### Acceptance Criteria
1. The ChatGPT Wrapped shall APIキー入力フォームを提供する
2. When ユーザーがAPIキーを入力した時, the ChatGPT Wrapped shall ローカルストレージに保存するオプションを提供する
3. If 無効なAPIキーが入力された場合, then the ChatGPT Wrapped shall 認証エラーを表示する
4. When ユーザーがAPIキーの削除を選択した時, the ChatGPT Wrapped shall ローカルストレージから削除する

### Requirement 3: 基本統計表示
**Objective:** As a ユーザー, I want 基本的な利用統計を見る, so that 1年間の利用状況を把握できる

#### Acceptance Criteria
1. When データが読み込まれた時, the ChatGPT Wrapped shall 総会話数を表示する
2. When データが読み込まれた時, the ChatGPT Wrapped shall 総メッセージ数を表示する
3. When データが読み込まれた時, the ChatGPT Wrapped shall 推定総トークン数を表示する
4. When データが読み込まれた時, the ChatGPT Wrapped shall 利用日数を表示する
5. When データが読み込まれた時, the ChatGPT Wrapped shall 最長連続利用日数を表示する

### Requirement 4: 活動パターン分析
**Objective:** As a ユーザー, I want 活動パターンを可視化する, so that いつChatGPTを使っているか理解できる

#### Acceptance Criteria
1. When データが読み込まれた時, the ChatGPT Wrapped shall 時間帯別の活動ヒートマップを表示する
2. When データが読み込まれた時, the ChatGPT Wrapped shall 月別メッセージ数グラフを表示する
3. When データが読み込まれた時, the ChatGPT Wrapped shall 曜日別の利用傾向を表示する

### Requirement 5: 単語・フレーズ分析（LLM）
**Objective:** As a ユーザー, I want よく使った単語やフレーズを知る, so that 自分の語彙傾向を理解できる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall よく使った単語ランキングTOP10を表示する
2. When LLM分析が実行された時, the ChatGPT Wrapped shall 口癖・頻出フレーズを抽出して表示する
3. When LLM分析が実行された時, the ChatGPT Wrapped shall TF-IDFベースの重要単語を表示する

### Requirement 6: トピック分類（LLM）
**Objective:** As a ユーザー, I want 会話のトピック分類を見る, so that 何について多く話したか把握できる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall トピック別会話割合TOP10を表示する
2. When LLM分析が実行された時, the ChatGPT Wrapped shall 各トピックのパーセンテージを表示する
3. When LLM分析が実行された時, the ChatGPT Wrapped shall トピックごとのアイコン・絵文字を表示する

### Requirement 7: テーマ変遷分析（LLM）
**Objective:** As a ユーザー, I want 月ごとのテーマ変化を見る, so that 1年間の興味の移り変わりを振り返れる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall 月ごとの主要テーマを時系列で表示する
2. When LLM分析が実行された時, the ChatGPT Wrapped shall テーマ変遷のタイムライングラフを表示する
3. When LLM分析が実行された時, the ChatGPT Wrapped shall 新しく登場したトピックをハイライト表示する

### Requirement 8: 知性マップ（LLM）
**Objective:** As a ユーザー, I want 会話の2Dマッピングを見る, so that 思考の傾向を視覚的に理解できる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall Embeddingsを使用して会話を2次元にプロットする
2. When LLM分析が実行された時, the ChatGPT Wrapped shall 軸の意味（技術↔企画、論理↔感情など）を表示する
3. When ユーザーがプロット上の点をクリックした時, the ChatGPT Wrapped shall 該当会話の概要を表示する

### Requirement 9: 代表セッション選出（LLM）
**Objective:** As a ユーザー, I want 今年の代表的な会話を見る, so that 重要だった会話を振り返れる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall 代表セッションベスト5を選出する
2. When LLM分析が実行された時, the ChatGPT Wrapped shall 各セッションに印象的なタイトルを付ける
3. When LLM分析が実行された時, the ChatGPT Wrapped shall 選出理由（深度、技術密度、感情変動など）を表示する

### Requirement 10: 文章特徴・感情分析（LLM）
**Objective:** As a ユーザー, I want 自分の文章の特徴を知る, so that コミュニケーションスタイルを理解できる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall 文章の特徴（技術的、カジュアルなど）を分析する
2. When LLM分析が実行された時, the ChatGPT Wrapped shall 感情傾向（好奇心、懸念など）を分析する
3. When LLM分析が実行された時, the ChatGPT Wrapped shall 質問パターンの特徴を分析する

### Requirement 11: GPTスタイル診断（LLM）
**Objective:** As a ユーザー, I want ChatGPT利用タイプ診断を受ける, so that 自分の使い方を楽しく理解できる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall 利用タイプ（思索型、企画爆発型など）を診断する
2. When LLM分析が実行された時, the ChatGPT Wrapped shall 相性スコア（%）を算出する
3. When LLM分析が実行された時, the ChatGPT Wrapped shall 診断結果の説明文を生成する

### Requirement 12: 名言選出（LLM）
**Objective:** As a ユーザー, I want 今年のベストプロンプトを見る, so that 印象的な会話を振り返れる

#### Acceptance Criteria
1. When LLM分析が実行された時, the ChatGPT Wrapped shall 今年の名言・ベストプロンプトを選出する
2. When LLM分析が実行された時, the ChatGPT Wrapped shall 選出理由を表示する
3. When LLM分析が実行された時, the ChatGPT Wrapped shall プロンプトの文脈を簡潔に説明する

### Requirement 13: UI/UXデザイン
**Objective:** As a ユーザー, I want Spotify Wrapped風のエモいデザインで見る, so that 振り返り体験を楽しめる

#### Acceptance Criteria
1. The ChatGPT Wrapped shall カード形式でスワイプ/スクロール可能なUIを提供する
2. The ChatGPT Wrapped shall ダークモードベースのビジュアルデザインを適用する
3. The ChatGPT Wrapped shall アニメーション効果を使用した演出を提供する
4. The ChatGPT Wrapped shall モバイル対応のレスポンシブデザインを適用する

### Requirement 14: 分析進行状況
**Objective:** As a ユーザー, I want 分析の進行状況を把握する, so that 待ち時間を理解できる

#### Acceptance Criteria
1. While LLM分析が実行中の間, the ChatGPT Wrapped shall 進行状況をプログレスバーで表示する
2. While LLM分析が実行中の間, the ChatGPT Wrapped shall 現在処理中の項目を表示する
3. If API呼び出しでエラーが発生した場合, then the ChatGPT Wrapped shall リトライオプションを提供する

### Requirement 15: 結果の保存・共有
**Objective:** As a ユーザー, I want 分析結果を保存・共有する, so that 他の人に見せたりSNSに投稿できる

#### Acceptance Criteria
1. When ユーザーが画像保存を選択した時, the ChatGPT Wrapped shall 各カードをPNG画像としてダウンロードできる
2. When ユーザーが全体保存を選択した時, the ChatGPT Wrapped shall 全結果をPDFとしてダウンロードできる
3. The ChatGPT Wrapped shall SNS共有用のサマリー画像を生成する
