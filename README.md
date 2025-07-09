# FFA+転職金額計算スクリプト - バックエンド

このリポジトリは、[ゲームの缶詰](http://www.game-can.com/) 内にある ブラウザ CGI ゲーム [FF Adventure+](http://www.game-can.com/ffa/others.cgi) の転職金額を計算するための Web アプリケーションのバックエンド部分です。

Node.js (Express) と Puppeteer で構築されており、キャラクター情報を Web スクレイピングによって取得し、[フロントエンド](https://github.com/abematsu-shingo/ffaJobchange-vue)に API として提供します。

## 目次

-   [機能概要](#機能概要)
-   [技術スタック](#技術スタック)
-   [プロジェクトセットアップ](#プロジェクトセットアップ)
    -   [前提条件](#前提条件)
    -   [インストール](#インストール)
    -   [本番ビルドと起動](#本番ビルドと起動)
-   [API エンドポイント](#apiエンドポイント)
-   [デプロイ](#デプロイ)
-   [環境変数](#環境変数)
-   [注意事項](#注意事項)
-   [ディレクトリ構造](#ディレクトリ構造)
-   [ライセンス](#ライセンス)

## 機能概要

-   指定されたキャラクター ID に基づき、外部サイトからキャラクターのステータス情報をスクレイピング。
-   スクレイピングしたデータを JSON 形式で整形し、Web API として提供。
-   入力値のサーバーサイドバリデーション。

## 技術スタック

-   **ランタイム**: Node.js
-   **フレームワーク**: Express.js
-   **スクレイピング**: Puppeteer
-   **言語**: TypeScript
-   **その他**: cors, dotenv

## プロジェクトセットアップ

### 前提条件

-   Node.js (v18 以上推奨)
-   npm または Yarn

### インストール

```bash
git clone [あなたのバックエンドリポジトリのURL]
cd [リポジトリ名]
npm install
# または yarn install
```

### 本番ビルドと起動

```bash
npm run build && npm start
# または
npm run serve # (npm run build と npm start を連続で実行)
```

## API エンドポイント

`POST /api/get-status`

指定されたキャラクター ID のステータス情報を取得します。

-   **URL**: `https://ffajobchange-puppeteer.onrender.com/api/get-status`
-   **メソッド**: `POST`
-   **リクエストヘッダー**: `Content-Type: application/json`
-   **リクエストボディ**:
    ```JSON
    { "characterId": "キャラクターID(半角英数字4〜8文字の文字列)" }
    ```
-   レスポンスボディ (成功時 - 200 OK):
    ```JSON
    {
    "power": "力のステータス値",
    "intelligence": "知能のステータス値",
    "faith": "信仰心のステータス値",
    "vitality": "生命力のステータス値",
    "dexterity": "器用さのステータス値",
    "speed": "速さのステータス値",
    "charm": "魅力のステータス値",
    "luck": "運のステータス値"
    }
    ```
    -   各プロパティは文字列型のステータス値
-   **レスポンスボディ (エラー時 - 400 Bad Request / 404 Not Found / 500 Internal Server Error)**:
    ```JSON
    {
    "error": "エラーメッセージ"
    }
    ```

## デプロイ

このバックエンドサービスは [Render.com](https://render.com/) にデプロイされています。
デプロイは GitHub の main リポジトリへのプッシュによって自動的にトリガーされるように設定されています。

## 環境変数

-   **PORT**: サーバーがリッスンするポート番号。Render 環境では自動的に設定されます。

## 注意事項

-   **Puppeteer の Chromium**: PaaS 環境では Puppeteer が Chromium を正しく起動するために追加の設定が必要です。
    -   **Pre-Deploy Command**:`npx puppeteer browsers install chrome`
-   **CORS 設定**: フロントエンドのデプロイ先 URL が変更された場合、`server.ts` 内の CORS `origin` も更新する必要があります。

## ディレクトリ構造

```
.
├── src/
│   └── server.ts          # メインのExpressサーバーとAPIロジック
├── package.json           # プロジェクトの依存関係とスクリプト
└── tsconfig.json          # TypeScriptの設定ファイル
```

## ライセンス

このプロジェクトは、MIT ライセンスの下でライセンスされています。
