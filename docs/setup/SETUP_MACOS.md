# macOS セットアップ手順（TA Attendance / Supabase ローカル）

## 1. 前提
- macOS 13 以降推奨
- Node.js 20 系推奨（最低 18 以上）
- npm
- Docker Desktop for Mac
- Supabase CLI

確認コマンド:

```bash
node -v
npm -v
docker -v
supabase --version
```

Supabase CLI 未導入の場合（Homebrew）:

```bash
brew install supabase/tap/supabase
```

## 2. プロジェクト取得

```bash
cd ~/Desktop
git clone <YOUR_REPO_URL> ta-attendance
cd ta-attendance
```

既に取得済みなら `cd` のみでOKです。

## 3. 依存パッケージのインストール

```bash
npm install
```

## 4. Supabase ローカル環境を起動

Docker Desktop を起動してから、以下を実行します。

```bash
npm run supabase:start
```

補足:
- 初期スキーマは `supabase/migrations/20260522100000_initial_schema.sql` を使用します。
- 初期シードは `supabase/seed.sql` を使用します。

状態確認:

```bash
npm run supabase:status
```

停止:

```bash
npm run supabase:stop
```

DB を初期化し直す場合:

```bash
npm run supabase:reset
```

## 5. 環境変数の作成（Web）

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

`npm run supabase:status` の出力から `API URL` と `anon key` を `.env` へ設定します。

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<supabase status の anon key>
```

## 6. 環境変数の作成（mobile）

```bash
cp mobile/.env.example mobile/.env
```

`mobile/.env` も `npm run supabase:status` の値に合わせます。

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase status の anon key>
```

実機デバッグ時は `EXPO_PUBLIC_SUPABASE_URL` を開発マシンの LAN IP に変更してください。

## 7. 開発起動（Vite + Electron）

```bash
npm run dev:all
```

- Vite: http://localhost:5173
- Electron: 自動でアプリウィンドウ起動

## 8. 暫定ログイン（現在の開発設定）

認証を後回しで開発する場合は以下でログインできます。

- ユーザー名: `admin`
- パスワード: `password`

Supabase Auth の実ログイン確認へ移行する場合は、Supabase Studio でユーザー作成後に `employees` へ対応レコードを追加してください。

## 9. 5分チェックリスト（すぐ始めるための確認）
1. `npm run supabase:start` が成功する
2. `npm run supabase:status` で API URL / anon key が取得できる
3. `.env` と `mobile/.env` に上記値を設定済み
4. `npm run dev:all` でログイン画面が開く
5. 打刻画面で出勤/退勤が更新される

## 10. よくあるトラブル

1. `supabase` コマンドが見つからない
- `brew install supabase/tap/supabase` を実行
- 端末を再起動して `supabase --version` を確認

2. Docker が起動しておらず Supabase が立ち上がらない
- Docker Desktop を起動後、`npm run supabase:start` を再実行

3. 環境変数を設定したのに接続エラーになる
- `npm run supabase:status` の最新値を再コピーする
- Vite / Expo の開発サーバーを再起動する

4. migration 変更が反映されない
- `npm run supabase:reset` で再適用する

5. 配布ビルド (`npm run build`) が失敗する
- macOS では署名設定や環境依存で失敗することがあります
- 開発確認はまず `npm run dev:all` を優先してください

## 11. 次の推奨作業
1. mock ログインから Supabase Auth 実ログインへ段階移行
2. テストユーザー作成用 seed / script の整備
3. クラウドプロジェクト向け migration 適用手順の追加
