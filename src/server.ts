interface CharacterStatus {
    power: string;
    intelligence: string;
    faith: string;
    vitality: string;
    dexterity: string;
    speed: string;
    charm: string;
    luck: string;
}

const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors"); // CORSミドルウェアをインポート

const app = express();
const port = 3000;

// フロントエンドからのリクエスト許可
app.use(
    cors({
        // 開発環境URL。デプロイ時は本番環境URLへ更新。
        origin: "https/localhpst:5173",
    })
);
// リクエストのJSONを扱いやすいデータに変更
app.use(express.json());

// ステータス取得APIエンドポイント
app.post("/api/get-status", async (req, res) => {
    const { characterId } = req.body; // フロントエンドから送られてきたcharacterIdを取得

    // IDが入力されていなかった場合
    if (!characterId) {
        return res
            .status(400)
            .json({ error: "キャラクターIDが指定されていません。" });
    }

    // ブラウザインスタンスを保持する変数
    let browser;

    try {
        // Puppeteerを起動
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        // 画像、css、fontのリソース読み込みをブロックして高速化
        await page.setRequestInterception(true);
        page.on("request", (request) => {
            if (
                ["image", "stylesheet", "font"].includes(request.resourceType())
            ) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // ユーザーIDを元にターゲットURLを構築
        const targetUrl = `http://www.game-can.com/ffa/kairan.cgi?mode=login&id=ketatuma`;
        console.log(`アクセスURL：${targetUrl}`);

        // URLにアクセス
        await page.goto(targetUrl, { waitUntil: "domcontentloaded" }); // DOMContentLoadedまで待機

        // ソースコードの解析とデータ抽出ロジック
        const characterStatus: CharacterStatus = await page.evaluate(() => {
            // 現在のステータス値を入れるオブジェクト
            const statusMap: CharacterStatus = {
                power: "",
                intelligence: "",
                faith: "",
                vitality: "",
                dexterity: "",
                speed: "",
                charm: "",
                luck: "",
            };
            // ステータス画面のソースコード
            const src = document.body.innerHTML;
            // ソースコードから余計なスペースをすべて削除
            const newSrc = src.replace(/\s/g, "");

            if (src && newSrc) {
                // ソースコードが取得できたら、現在のステータス値を抽出
                const currentPower = newSrc.match(/>力<.*?(\d+)/);
                const currentIntelligence = newSrc.match(/>知能<.*?(\d+)/);
                const currentFaith = newSrc.match(/>信仰心<.*?(\d+)/);
                const currentVitality = newSrc.match(/>生命力<.*?(\d+)/);
                const currentDexterity = newSrc.match(/>器用さ<.*?(\d+)/);
                const currentSpeed = newSrc.match(/>速さ<.*?(\d+)/);
                const currentCharm = newSrc.match(/>魅力<.*?(\d+)/);
                const currentLuck = newSrc.match(/>運<.*?(\d+)/);

                // 抽出したステータス値をオブジェクトに格納
                statusMap.power = currentPower[1];
                statusMap.intelligence = currentIntelligence[1];
                statusMap.faith = currentFaith[1];
                statusMap.vitality = currentVitality[1];
                statusMap.dexterity = currentDexterity[1];
                statusMap.speed = currentSpeed[1];
                statusMap.charm = currentCharm[1];
                statusMap.luck = currentLuck[1];
            }
            // characterStatusにオブジェクトを返す
            return statusMap;
        });
        // オブジェクトの中身をjsonデータでフロントエンドに渡す
        res.json(characterStatus);
    } catch {}
});
