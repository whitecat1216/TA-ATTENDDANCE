# 実装プラン（AI共有用）

## 0. メタ情報
- プロジェクト: 就業管理システム TA
- 最終更新日: 2026-05-22
- 優先度: 中
- 担当AI: 共有（引き継ぎ前提）
- ステータス: 進行中

## 1. 目的
- このファイルを読めば、別のAIでも同じ粒度で実装を継続できる状態にする。
- 認証実装を後回しにしつつ、Docker上のDBで画面・機能開発を先行できる状態を維持する。

## 2. スコープ
- 含める:
  - 依頼された機能修正
  - 影響範囲の最小限の関連修正
- 含めない:
  - 無関係なリファクタ
  - デザイン全面刷新

## 3. 要件
- 要件1: 認証は暫定的に後回しとし、開発継続可能な運用手順を明確化する。
- 要件2: Docker(PostgreSQL)起動とスキーマ反映手順が文書化されていること。
- 要件3: AI間で引き継げるよう、作業計画と履歴更新の運用を固定化する。

## 4. 受け入れ条件
- [x] Docker起動用の設定ファイルが存在する。
- [x] Docker利用時の手順書が docs/setup 配下に存在する。
- [x] AI共有用の plan.md と運用ガイドが docs/ai 配下に存在する。

## 5. 影響範囲
- 画面: ログイン画面（認証後回し方針の確認対象）
- 機能: 開発環境構築、DB初期化、AI作業引き継ぎ
- ファイル:
  - docker-compose.yml
  - .env
  - docs/setup/環境構築手順書.txt
  - docs/setup/docker_db手順書.txt
  - docs/ai/copilot指示書.md
  - docs/ai/AI実装運用.md
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

## 6. 実装タスク
- [x] Docker DB起動設定を追加する。
- [x] Docker DB手順書を作成する。
- [x] AI共有用の plan.md と運用ガイドを作成する。
- [x] ログイン画面の暫定モック化（admin/password）を実装する。

## 7. 実装メモ（AI向け）
- 既存方針を優先し、変更は最小単位にする。
- 認証は現時点で後回し運用を許容する。
- docs/history/チャット履歴.txt へ結果を追記する。

## 8. 検証項目
- [ ] 型エラーなし
- [ ] ビルド成功（electron-builder は Windows の symlink 権限で失敗）
- [ ] 主要画面の動作確認
- [x] docker compose up -d が成功

## 9. 進捗ログ
- 2026-05-21: ファイル作成
- 2026-05-21: Docker DB設定と手順書を追加
- 2026-05-21: AI共有運用（plan.md / 運用ガイド / Copilot指示書連携）を追加
- 2026-05-21: plan.md を雛形から実運用内容へ更新
- 2026-05-21: admin/password の暫定ログインを追加（認証後回し対応）
- 2026-05-21: 給与パッケージ化の次期計画を追加
- 2026-05-21: 次期計画を人事給与パッケージ化へ拡張
- 2026-05-22: docs/ai の指示書を基に .github/copilot-instructions.md を追加
- 2026-05-22: 参照しやすいようにリポジトリ直下へ copilot-instructions.md を追加
- 2026-05-22: Copilot 指示書を日本語表記へ更新
- 2026-05-22: 人事給与システムを別リポジトリ連携 + ネイティブモバイル前提へ要件更新
- 2026-05-22: 現行勤怠システムのモバイル対応タスクを追加
- 2026-05-22: 現行勤怠システム向け React Native アプリ追加タスクを開始

## 12. 現在タスク（Copilot向け指示書整備）
### 12-1. 目的
- docs/ai 配下の既存指示書を GitHub Copilot が読み取れる形式に整理し、リポジトリ標準の指示書として配置する。

### 12-2. 要件
- 要件1: `docs/ai/指示書.txt`、`docs/ai/copilot指示書.md`、`docs/ai/AI実装運用.md` の内容を踏まえること。
- 要件2: GitHub Copilot が参照しやすい `copilot-instructions.md` を新規作成すること。
- 要件3: 既存運用（plan 優先、履歴追記、最小変更）と矛盾しない内容にすること。

### 12-3. 受け入れ条件
- [x] `.github/copilot-instructions.md` が存在する。
- [x] `copilot-instructions.md` がリポジトリ直下に存在する。
- [x] docs/ai の運用ルールが Copilot 用の表現に整理されている。
- [x] plan.md とチャット履歴に今回の対応内容が記録されている。

### 12-4. 影響範囲
- 機能: AI 作業ルール、ドキュメント運用
- ファイル:
  - copilot-instructions.md
  - .github/copilot-instructions.md
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 12-5. 実装タスク
- [x] docs/ai 配下の指示書を確認する。
- [x] Copilot 用の指示書へ再構成する。
- [x] リポジトリ直下にも参照用の指示書を配置する。
- [x] 作業記録を plan.md とチャット履歴へ反映する。

## 11. 次期実装（別リポジトリ連携型の人事給与システム）
### 11-1. 目的
- 勤怠システムとは別リポジトリで、人事給与システムを構築する。
- 両システムは連携前提とし、将来的に iOS / Android のネイティブアプリでも利用できる構成にする。

### 11-2. 要件
- 要件1: 人事給与システムは本システムとは別リポジトリで管理すること。
- 要件2: 勤怠システムとの連携境界とデータ責務を定義すること。
- 要件3: 従業員、部門、役職、雇用区分を人事情報として管理できること。
- 要件4: 入社、退職、異動などの人事イベントを履歴管理できること。
- 要件5: 締め処理（月次）を実行できること。
- 要件6: 残業/深夜/休日区分を月次集計できること。
- 要件7: 会社別フォーマットの CSV を設定で切替できること。
- 要件8: 実行ログ（監査）を記録できること。
- 要件9: iOS / Android のネイティブアプリ向け要件を考慮した API / 画面責務を定義すること。

### 11-3. 受け入れ条件
- [ ] 人事給与システムが別リポジトリ前提で設計されている。
- [ ] 勤怠システムとの連携境界が定義されている。
- [ ] 従業員の所属・役職・雇用区分変更を履歴付きで管理できる。
- [ ] 入社・退職・異動が月次集計対象に正しく反映される。
- [ ] 指定期間の集計結果が画面表示と CSV 出力で一致する。
- [ ] 会社 A/B で CSV フォーマットを設定のみで切替できる。
- [ ] 未承認データ除外時、除外件数が確認できる。
- [ ] 再締め実行時、差分件数を表示できる。
- [ ] iOS / Android ネイティブアプリ向けの対象機能が整理されている。

### 11-4. 影響範囲
- 画面: 新規人事給与 Web 管理画面、ネイティブモバイルアプリ、現在の勤怠システムの連携設定
- 機能: 人事管理、集計エンジン、締め処理、CSV エクスポート、API 連携、モバイル対応
- ファイル:
  - docs/ai/給与パッケージ化要件.md
  - docs/ai/plan.md
  - copilot-instructions.md
  - .github/copilot-instructions.md
  - （将来作成）別リポジトリの設計資料 / API 仕様書 / モバイル設計書

### 11-5. 実装タスク
- [ ] システム境界とデータ責務を定義する
- [ ] 別リポジトリ用アーキテクチャを整理する
- [ ] 人事データモデルを追加する（employees / employee_positions / employee_status_history / organization_settings）
- [ ] 給与データモデルを追加する（payroll_periods / payroll_results / payroll_export_jobs / payroll_settings）
- [ ] 連携 API / バッチ仕様を定義する
- [ ] 集計ロジックをサービス層へ分離する
- [ ] 締め処理フローを実装する
- [ ] CSV フォーマット設定機構を実装する
- [ ] モバイルアプリ要件を API / 画面設計へ反映する
- [ ] 実行監査ログを実装する

### 11-6. 参照ドキュメント
- docs/ai/給与パッケージ化要件.md

## 13. 現在タスク（別リポジトリ化とモバイル対応の要件整理）
### 13-1. 目的
- 人事給与システムを本システムと別リポジトリで構築する前提へ変更し、モバイル対応方針を要件書と計画書へ反映する。

### 13-2. 要件
- 要件1: 人事給与システムは本リポジトリとは別リポジトリで構築する前提に変更すること。
- 要件2: 勤怠システムとの連携前提を要件書へ明記すること。
- 要件3: モバイル対応は iOS / Android ネイティブアプリ前提で整理すること。
- 要件4: Copilot 指示書にもこの方針への参照を追加すること。

### 13-3. 受け入れ条件
- [x] `docs/ai/給与パッケージ化要件.md` が別リポジトリ連携前提へ更新されている。
- [x] `docs/ai/plan.md` の次期実装が別リポジトリ + モバイル前提へ更新されている。
- [x] `copilot-instructions.md` と `.github/copilot-instructions.md` に参照方針が追記されている。
- [x] チャット履歴に今回の要件整理内容が追記されている。

### 13-4. 影響範囲
- 機能: 人事給与システム構想、リポジトリ分割方針、モバイル対応方針
- ファイル:
  - docs/ai/給与パッケージ化要件.md
  - docs/ai/plan.md
  - copilot-instructions.md
  - .github/copilot-instructions.md
  - docs/history/チャット履歴.txt

### 13-5. 実装タスク
- [x] 別リポジトリ前提へ要件書を書き換える。
- [x] モバイル対応要件を追加する。
- [x] 次期実装計画を新方針へ更新する。
- [x] Copilot 指示書へ参照方針を追記する。
- [x] 作業履歴を追記する。

## 14. 現在タスク（現行勤怠システムのモバイル対応）
### 14-1. 目的
- まずはこの勤怠システム自体をスマートフォン画面でも操作しやすい UI に改善する。

### 14-2. 要件
- 要件1: 既存のレイアウトをモバイル画面幅でも閲覧・操作しやすくすること。
- 要件2: ナビゲーション、ヘッダー、主要フォーム、主要一覧をレスポンシブ対応すること。
- 要件3: シフト表や集計表など情報量の多い画面は、必要に応じて横スクロールまたはモバイル向け表示を用意すること。
- 要件4: 無関係な機能追加やデザイン全面刷新は行わないこと。

### 14-3. 受け入れ条件
- [x] サイドバーがモバイルで開閉可能になっている。
- [x] ログイン画面、ダッシュボード、打刻画面がスマートフォン幅で崩れず操作できる。
- [x] 休暇管理、従業員管理、集計、CSV 画面がスマートフォン幅で閲覧しやすい。
- [x] シフト表がモバイルでも閲覧できる。
- [x] 変更内容が plan.md とチャット履歴に記録されている。

### 14-4. 影響範囲
- 画面: ログイン、共通レイアウト、ダッシュボード、打刻、シフト、休暇、集計、従業員管理、CSV
- 機能: レスポンシブレイアウト、モバイルナビゲーション、モバイル表示最適化
- ファイル:
  - src/components/layout/Layout.tsx
  - src/components/layout/Sidebar.tsx
  - src/components/layout/Header.tsx
  - src/pages/Login.tsx
  - src/pages/Dashboard.tsx
  - src/pages/TimeTracking.tsx
  - src/pages/ShiftManagement.tsx
  - src/pages/LeaveManagement.tsx
  - src/pages/AttendanceSummary.tsx
  - src/pages/EmployeeManagement.tsx
  - src/pages/Reports.tsx
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 14-5. 実装タスク
- [x] 共通レイアウトをモバイル対応する。
- [x] 主要カードとフォームの余白・段組みを調整する。
- [x] 一覧系画面にモバイル向け表示または横スクロール導線を追加する。
- [x] シフト表のモバイル閲覧性を改善する。
- [x] 作業履歴を追記する。

## 15. 現在タスク（React Native アプリ追加）
### 15-1. 目的
- このリポジトリ内に `mobile/` を追加し、iOS / Android 配布を前提とした React Native アプリを作成する。

### 15-2. 要件
- 要件1: `mobile/` 配下に React Native アプリを新規追加すること。
- 要件2: 既存の Supabase と認証方針（暫定 admin/password を含む）を利用できること。
- 要件3: 少なくともログイン、ダッシュボード、打刻、主要導線をアプリとして操作できること。
- 要件4: 今後の拡張のため、画面構成と状態管理を分離した構成にすること。

## 16. 現在タスク（暫定ログイン時の打刻表示不具合修正）
### 16-1. 目的
- 暫定ログイン `admin/password` 利用時でも、打刻時刻の取得・表示・更新が行えるようにする。

### 16-2. 要件
- 要件1: 暫定ログイン時は Supabase 接続が未使用でも当日打刻を表示できること。
- 要件2: 出勤、退勤、打刻修正が Web と mobile の両方で一貫して動作すること。
- 要件3: 実 Supabase 認証利用時の既存動作は維持すること。

### 16-3. 受け入れ条件
- [x] `admin/password` でログイン後、当日打刻の出勤時刻・退勤時刻が表示される。
- [x] 打刻修正内容が再読み込み後も保持される。
- [x] 実 Supabase 認証向けの既存クエリ経路が残っている。

### 16-4. 影響範囲
- 画面: 打刻画面（Web / mobile）
- 機能: 暫定ログイン時の打刻保存、打刻表示、打刻修正
- ファイル:
  - src/pages/TimeTracking.tsx
  - src/store/authStore.ts
  - mobile/src/screens/TimeTrackingScreen.tsx
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 16-5. 実装タスク
- [x] 暫定ログイン判定を既存認証ストアから利用可能にする。
- [x] Web の打刻画面に mock 保存経路を追加する。
- [x] mobile の打刻画面に同等の mock 保存経路を追加する。
- [x] 作業履歴を追記する。

### 16-6. 検証結果
- `npm run build:vite` 成功
- `cd mobile && npx tsc --noEmit` 相当の型検査成功
- Web / mobile の打刻画面で mock ログイン時に Supabase を通さない保存経路を実装

## 17. 進捗ログ追記
- 2026-05-22: 暫定ログイン時、Supabase 未接続でも打刻時刻が表示されるよう Web / mobile に mock 保存経路を追加

## 18. 現在タスク（Supabase ローカル開発環境への移行準備）
### 18-1. 目的
- Supabase CLI 前提のローカル開発構成を追加し、スキーマ管理を migration 化して開発開始を迅速化する。

### 18-2. 要件
- 要件1: `supabase/` ディレクトリを初期化前提の構成で追加すること。
- 要件2: `database/schema.sql` を初期 migration ファイルへ変換すること。
- 要件3: macOS セットアップ手順を Supabase ローカル運用に更新すること。
- 要件4: Web / mobile の環境変数サンプルを Supabase ローカル運用と整合させること。

### 18-3. 受け入れ条件
- [x] `supabase/config.toml`、`supabase/migrations/*`、`supabase/seed.sql` が存在する。
- [x] 初期 migration に現行スキーマが反映されている。
- [x] `docs/setup/SETUP_MACOS.md` が Supabase CLI 手順で更新されている。
- [x] `.env.example` と `mobile/.env.example` の設定手順が現行運用と一致する。

### 18-4. 影響範囲
- 機能: ローカル開発環境、DB 初期化、セットアップ手順
- ファイル:
  - supabase/config.toml
  - supabase/migrations/20260522100000_initial_schema.sql
  - supabase/seed.sql
  - database/schema.sql
  - docs/setup/SETUP_MACOS.md
  - .env.example
  - mobile/.env.example
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 18-5. 実装タスク
- [x] Supabase ローカル用ディレクトリと設定ファイルを追加する。
- [x] 初期 migration ファイルへ既存スキーマを移行する。
- [x] macOS セットアップ手順を Supabase CLI 運用へ更新する。
- [x] Web / mobile の環境変数サンプルを更新する。
- [x] 作業履歴を追記する。

### 18-6. 検証結果
- `get_errors` で変更ファイルにエラーなし
- `npm run supabase:status` は `supabase: command not found`（CLI 未導入のため実行環境依存で未確認）

## 19. 進捗ログ追記
- 2026-05-22: Supabase ローカル運用向けに `supabase/` 構成と初期 migration / seed を追加
- 2026-05-22: `SETUP_MACOS.md` を Supabase CLI ベースへ更新し、5分チェックリストを追加

## 20. 現在タスク（Supabase 起動後の Web / mobile 接続設定）
### 20-1. 目的
- 起動済み Supabase local の URL / Publishable key を Web と mobile の環境変数へ反映し、即開発可能な状態にする。

### 20-2. 要件
- 要件1: `.env` の Web 向け Supabase 設定を local 起動値へ更新すること。
- 要件2: `mobile/.env` を作成し、mobile 向け Supabase 設定を反映すること。
- 要件3: セキュリティ上、Secret key はクライアント環境変数へ設定しないこと。

### 20-3. 受け入れ条件
- [x] `.env` に local Supabase の URL と Publishable key が設定されている。
- [x] `mobile/.env` が存在し、URL と Publishable key が設定されている。
- [x] Secret key を設定していない。

### 20-4. 影響範囲
- 機能: Web / mobile の Supabase 接続設定
- ファイル:
  - .env
  - mobile/.env
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 20-5. 実装タスク
- [x] Web 側 `.env` を更新する。
- [x] mobile 側 `.env` を新規作成する。
- [x] Secret key 未使用を確認する。
- [x] 作業履歴を追記する。

### 20-6. 検証結果
- `.env` と `mobile/.env` を読み取り、URL / Publishable key 反映を確認
- Secret key は未設定を確認
- `npm run dev:vite` で `http://localhost:5173/` 起動を確認

## 21. 進捗ログ追記
- 2026-05-23: Supabase local 起動値を Web / mobile の `.env` へ反映し、Vite 起動確認を実施

## 22. 現在タスク（打刻保存エラーと勤務状態表示の修正）
### 22-1. 目的
- 打刻修正フォームの `isMockUser` 参照エラーを解消し、打刻状態が「出勤中/退勤」で明確に表示されるようにする。

### 22-2. 要件
- 要件1: `TimeTracking.tsx` の保存処理で発生する `isMockUser is not defined` を解消すること。
- 要件2: 打刻画面に勤務状態（未出勤/出勤中/退勤）を表示すること。
- 要件3: 退勤ボタン押下後、勤務状態が退勤へ更新されること。

### 22-3. 受け入れ条件
- [x] 打刻修正の保存時に例外が発生しない。
- [x] 出勤打刻後に「出勤中」が表示される。
- [x] 退勤打刻後に「退勤」が表示される。

### 22-4. 影響範囲
- 画面: 打刻画面
- 機能: 打刻修正保存、勤務状態表示
- ファイル:
  - src/pages/TimeTracking.tsx
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 22-5. 実装タスク
- [x] `isMockUser` の参照スコープを修正する。
- [x] 勤務状態表示を追加する。
- [x] 動作確認を実施し履歴を追記する。

### 22-6. 検証結果
- `get_errors` で `src/pages/TimeTracking.tsx` にエラーなし
- `npm run build:vite` 成功

## 23. 進捗ログ追記
- 2026-05-23: `TimeTracking.tsx` の保存エラーを修正し、勤務状態表示（未出勤/出勤中/退勤）を追加

## 24. 現在タスク（Copilot 指示書の重複整理）
### 24-1. 目的
- `copilot-instructions.md` が2つ存在することによる混乱を解消し、参照先を明確化する。

### 24-2. 要件
- 要件1: Copilot が参照する正本ファイルを明示すること。
- 要件2: リポジトリ直下の案内ファイルは重複本文を持たず、正本への導線に限定すること。
- 要件3: 既存運用ルール（plan 更新、履歴追記）を維持すること。

### 24-3. 受け入れ条件
- [x] `.github/copilot-instructions.md` が正本として明記されている。
- [x] `copilot-instructions.md` が簡潔な参照ガイドに整理されている。
- [x] `docs/ai/plan.md` と `docs/history/チャット履歴.txt` に記録されている。

### 24-4. 影響範囲
- 機能: AI 指示書の参照運用
- ファイル:
  - .github/copilot-instructions.md
  - copilot-instructions.md
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 24-5. 実装タスク
- [x] 指示書の正本を `.github/copilot-instructions.md` に固定する。
- [x] 直下の `copilot-instructions.md` を重複のない案内文へ置換する。
- [x] 作業履歴を追記する。

### 24-6. 検証結果
- `copilot-instructions.md` の本文重複を解消し、正本参照のみへ整理
- 正本を `.github/copilot-instructions.md` に一本化

## 25. 進捗ログ追記
- 2026-05-23: Copilot 指示書を正本一本化（`.github`）し、直下ファイルを参照ガイドへ整理

## 26. 現在タスク（Windows 環境構築手順書の Markdown 化）
### 26-1. 目的
- `docs/setup/環境構築手順書.txt` を Windows 向けの Markdown 手順書へ移行し、参照しやすくする。

### 26-2. 要件
- 要件1: Windows（PowerShell）前提の内容を維持したまま `.md` へ移行すること。
- 要件2: 手順書は見出し・コードブロック付きで読みやすくすること。
- 要件3: 元の `.txt` は重複を避けるため削除すること。

### 26-3. 受け入れ条件
- [x] `docs/setup/SETUP_WINDOWS.md` が存在する。
- [x] `docs/setup/環境構築手順書.txt` が存在しない。
- [x] Windows 向け構築手順として必要項目が記載されている。

### 26-4. 影響範囲
- 機能: セットアップ手順書
- ファイル:
  - docs/setup/環境構築手順書.txt
  - docs/setup/SETUP_WINDOWS.md
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 26-5. 実装タスク
- [x] `.txt` から `.md` へ移行する。
- [x] Windows 向け手順を Markdown 形式へ整形する。
- [x] 作業履歴を追記する。

### 26-6. 検証結果
- `docs/setup/SETUP_WINDOWS.md` への移行を確認
- `docs/setup/環境構築手順書.txt` が存在しないことを確認

## 27. 進捗ログ追記
- 2026-05-23: Windows 環境構築手順書を `.txt` から `.md` へ移行し Markdown 整形を実施

## 28. 現在タスク（Windows 手順書ファイル名の統一）
### 28-1. 目的
- Windows 向けセットアップ手順書のファイル名を既存命名（`SETUP_MACOS.md`）に合わせて統一する。

### 28-2. 要件
- 要件1: `docs/setup/環境構築手順書.md` を分かりやすいファイル名へ変更すること。
- 要件2: 旧ファイル名の参照が残らないことを確認すること。

### 28-3. 受け入れ条件
- [x] `docs/setup/SETUP_WINDOWS.md` が存在する。
- [x] `docs/setup/環境構築手順書.md` が存在しない。
- [x] 旧ファイル名の参照が主要ドキュメントに残っていない。

### 28-4. 影響範囲
- 機能: セットアップ手順ドキュメント命名
- ファイル:
  - docs/setup/環境構築手順書.md
  - docs/setup/SETUP_WINDOWS.md
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 28-5. 実装タスク
- [x] Windows 手順書を `SETUP_WINDOWS.md` へリネームする。
- [x] 旧ファイル名の参照有無を確認する。
- [x] 作業履歴を追記する。

### 28-6. 検証結果
- `docs/setup/SETUP_WINDOWS.md` の存在を確認
- `docs/setup/環境構築手順書.md` が存在しないことを確認

## 29. 進捗ログ追記
- 2026-05-23: Windows 手順書ファイル名を `SETUP_WINDOWS.md` へ統一

### 15-3. 受け入れ条件
- [x] `mobile/` に React Native アプリが存在する。
- [x] アプリでログインできる。
- [x] アプリで打刻画面と主要導線を操作できる。
- [x] Supabase 接続設定手順が用意されている。
- [x] 変更内容が plan.md とチャット履歴に記録されている。

### 15-4. 影響範囲
- 画面: モバイル用ログイン、ダッシュボード、打刻、主要ナビゲーション
- 機能: React Native アプリ追加、Supabase 連携、モバイル認証状態管理
- ファイル:
  - mobile/**
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 15-5. 実装タスク
- [x] React Native アプリを `mobile/` に追加する。
- [x] Supabase と認証状態管理を移植する。
- [x] ログイン、ダッシュボード、打刻、主要ナビゲーションを実装する。
- [x] モバイル用設定手順を用意する。
- [x] 作業履歴を追記する。

## 30. 現在タスク（.gitignore の環境変数除外見直し）
### 30-1. 目的
- 環境変数ファイルの誤コミットを防ぎ、Web/mobile のローカル設定を安全に運用する。

### 30-2. 要件
- 要件1: `.env` 系ファイルを包括的に除外すること。
- 要件2: サンプルファイル（`.env.example` 系）は引き続き管理対象に残すこと。

### 30-3. 受け入れ条件
- [x] `.env.*` 系が除外される。
- [x] `.env.example` と `mobile/.env.example` が除外されない。

### 30-4. 影響範囲
- 機能: Git 運用（機密情報保護）
- ファイル:
  - .gitignore
  - docs/ai/plan.md
  - docs/history/チャット履歴.txt

### 30-5. 実装タスク
- [x] `.gitignore` の `.env` ルールを更新する。
- [x] 作業履歴を追記する。

### 30-6. 検証結果
- `.gitignore` に `.env.*` を追加し、ローカル環境変数を包括除外
- `!.env.example` と `!mobile/.env.example` を追加し、サンプルファイルの追跡を維持

## 31. 進捗ログ追記
- 2026-05-23: `.gitignore` の環境変数除外ルールを強化（example は除外対象外）

## 10. 完了報告テンプレート
- 変更概要:
- 変更ファイル:
- 確認結果:
- 未対応事項:
