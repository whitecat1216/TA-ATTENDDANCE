# 就業管理システム TA 環境構築手順（Windows）

## 1. 前提
- OS: Windows（PowerShell）
- Node.js 18 以上（推奨: 20系）
- npm
- Supabase（ローカル or クラウド）

## 2. プロジェクトを開く
PowerShell で実行:

```powershell
cd C:\Users\Yuuki\Desktop\ta-attendance
```

## 3. 依存パッケージをインストール

```powershell
npm install
```

## 4. 環境変数を作成
`.env.example` を `.env` にコピーして値を設定します。

```powershell
Copy-Item .env.example .env
```

設定例:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<Publishable key>
```

## 5. Supabase 準備

### 5-1. ローカル利用の場合
- Supabase CLI で起動する
- 取得した URL / Publishable key を `.env` に設定する

```powershell
npm run supabase:start
npm run supabase:status
```

### 5-2. クラウド利用の場合
- Supabase プロジェクトを作成する
- Project URL / Publishable key を `.env` に設定する

## 6. DB スキーマを適用
- ローカル Supabase 利用時は migration を利用
- 手動で適用する場合は `database/schema.sql` を Supabase SQL Editor で実行
- `departments`, `employees`, `attendance_records` などの作成を確認

## 7. 開発起動

```powershell
npm run dev:all
```

起動後:
- Vite: http://localhost:5173
- Electron ウィンドウが自動起動

## 8. 動作確認チェック
- ログイン画面が表示される
- サイドバーに各機能（打刻、シフト、休暇、集計、従業員管理、CSV）が表示される
- Supabase 接続エラーが出ない

## 9. よくあるエラー
1. `VITE_SUPABASE_URL` 未設定
- `.env` の値を確認

2. ログインできない
- Supabase Auth のユーザー作成有無を確認
- `employees.id` が `auth.users.id` と一致しているか確認

3. Electron が起動しない
- `npm install` が完了しているか確認
- セキュリティソフトやポリシーで Electron 実行がブロックされていないか確認

## 10. 補足
- 本番向けには RLS ポリシーの追加検証、監査ログ、バックアップ設計を推奨

### ローカル Docker で PostgreSQL のみを起動する場合の `.env` 例

```env
VITE_SUPABASE_URL=http://localhost:5432
VITE_SUPABASE_ANON_KEY=dummy
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ta_attendance
```

`VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` は必須です（ダミー値でも可）。
