# macOS セットアップ手順（TA Attendance）

## 1. 前提
- macOS 13 以降推奨
- Node.js 20 系推奨（最低 18 以上）
- npm
- Docker Desktop for Mac

確認コマンド:

```bash
node -v
npm -v
docker -v
docker compose version
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

## 4. 環境変数の作成

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

認証を後回しで開発する場合の例:

```env
VITE_SUPABASE_URL=http://localhost:5432
VITE_SUPABASE_ANON_KEY=dummy
```

補足:
- このプロジェクトは `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` が未設定だと起動時エラーになります。
- 後で Supabase Auth を使う場合は実値に置き換えてください。

## 5. Docker で DB 起動

Docker Desktop を起動してから、以下を実行します。

```bash
docker compose up -d
```

- `database/schema.sql` は初回起動時に自動投入されます。
- 接続先は `localhost:5432`（DB名: `ta_attendance`）です。

確認:

```bash
docker compose ps
```

停止:

```bash
docker compose down
```

データも削除する場合:

```bash
docker compose down -v
```

## 6. 開発起動（Vite + Electron）

```bash
npm run dev:all
```

- Vite: http://localhost:5173
- Electron: 自動でアプリウィンドウ起動

## 7. 暫定ログイン（現在の開発設定）

認証を後回しにしているため、以下でログインできます。

- ユーザー名: `admin`
- パスワード: `password`

## 8. よくあるトラブル

1. Electron が開かない
- `npm run dev:all` のログで `ELECTRON` 側エラーを確認
- セキュリティ設定でブロックされた場合は許可

2. 5432 ポート競合
- 既存の PostgreSQL を停止するか、`docker-compose.yml` の公開ポートを変更

3. schema.sql の変更が反映されない
- 初回投入のみのため、再投入する場合は `docker compose down -v` の後に `docker compose up -d`

4. 配布ビルド (`npm run build`) が失敗する
- macOS では署名設定や環境依存で失敗することがあります。
- 開発確認はまず `npm run dev:all` を優先してください。

## 9. 次の推奨作業
1. Supabase Auth を本番向けに再導入
2. 人事給与機能のデータモデル追加
3. CSV 出力仕様（会社別フォーマット）を設定駆動化
