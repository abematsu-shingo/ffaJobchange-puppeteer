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

import express from "express";
import puppeteer from "puppeteer";
import cors from "cors"; // CORSミドルウェアをインポート

const app = express();
const port = process.env.PORT || 3000;

// フロントエンドからのリクエスト許可
app.use(
    cors({
        // 開発環境URL。デプロイ時は本番環境URLへ更新。
        origin: [
            "http://localhost:5173",
            "http://lgqqi65169.rakkoserver.net",
            "https://lgqqi65169.rakkoserver.net",
        ],
    })
);
// リクエストのJSONを扱いやすいデータに変更
app.use(express.json());

// ステータス取得APIエンドポイント

app.post(
    "/api/get-status",
    async (req: express.Request, res: express.Response) => {
        const { characterId } = req.body as { characterId: string }; // フロントエンドから送られてきたcharacterIdを取得

        if (!characterId) {
            // IDが入力されていなかった場合
            res.status(400).json({
                error: "キャラクターIDを入力してください。",
            });
            return;
        } else if (/^.*[^ -~｡-ﾟ].*$/.test(characterId)) {
            // IDに全角が含まれていた場合
            res.status(400).json({
                error: "キャラクターIDは半角英数字で入力してください。",
            });
            return;
        } else if (!/^[a-zA-Z0-9]{4,8}$/.test(characterId)) {
            // IDが半角英数字かつ4文字〜8文字ではない場合
            res.status(400).json({
                error: "キャラクターIDは半角英数字4〜8文字で入力してください。",
            });
            return;
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

            // ユーザーエージェントの設定
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
            );

            // 画像、css、fontのリソース読み込みをブロックして高速化
            await page.setRequestInterception(true);
            page.on(
                "request",
                (request: {
                    resourceType: () => string;
                    abort: () => void;
                    continue: () => void;
                }) => {
                    if (
                        ["image", "stylesheet", "font"].includes(
                            request.resourceType()
                        )
                    ) {
                        request.abort();
                    } else {
                        request.continue();
                    }
                }
            );

            // ユーザーIDを元にターゲットURLを構築
            const targetUrl = `http://s2.game-can.com:8080/ffa/kairan.cgi?mode=login&id=${characterId}`;
            console.log(`アクセスURL：${targetUrl}`);

            // URLにアクセス
            await page.goto(targetUrl, { waitUntil: "domcontentloaded" }); // DOMContentLoadedまで待機

            // ソースコードの解析とデータ抽出ロジック
            const characterStatus: CharacterStatus | { error: string } =
                await page.evaluate(() => {
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

                    if (src.match(/ファイルを開けませんでした/)) {
                        return { error: "NOT_FOUND" };
                    } else if (src && newSrc) {
                        // ソースコードが取得できたら、現在のステータス値を抽出
                        const currentPower = newSrc.match(/>力<.*?(\d+)/);
                        const currentIntelligence =
                            newSrc.match(/>知能<.*?(\d+)/);
                        const currentFaith = newSrc.match(/>信仰心<.*?(\d+)/);
                        const currentVitality =
                            newSrc.match(/>生命力<.*?(\d+)/);
                        const currentDexterity =
                            newSrc.match(/>器用さ<.*?(\d+)/);
                        const currentSpeed = newSrc.match(/>速さ<.*?(\d+)/);
                        const currentCharm = newSrc.match(/>魅力<.*?(\d+)/);
                        const currentLuck = newSrc.match(/>運<.*?(\d+)/);

                        // 抽出したステータス値をオブジェクトに格納（nullチェック付き）
                        statusMap.power =
                            currentPower && currentPower[1]
                                ? currentPower[1]
                                : "";
                        statusMap.intelligence =
                            currentIntelligence && currentIntelligence[1]
                                ? currentIntelligence[1]
                                : "";
                        statusMap.faith =
                            currentFaith && currentFaith[1]
                                ? currentFaith[1]
                                : "";
                        statusMap.vitality =
                            currentVitality && currentVitality[1]
                                ? currentVitality[1]
                                : "";
                        statusMap.dexterity =
                            currentDexterity && currentDexterity[1]
                                ? currentDexterity[1]
                                : "";
                        statusMap.speed =
                            currentSpeed && currentSpeed[1]
                                ? currentSpeed[1]
                                : "";
                        statusMap.charm =
                            currentCharm && currentCharm[1]
                                ? currentCharm[1]
                                : "";
                        statusMap.luck =
                            currentLuck && currentLuck[1] ? currentLuck[1] : "";
                    }
                    // characterStatusにオブジェクトを返す
                    return statusMap;
                });

            if ("error" in characterStatus) {
                res.status(404).json({
                    error: "たぶんキャラクターIDが誤っています。正しいIDを入力してください。",
                });
                return;
            }
            // オブジェクトの中身をjsonデータでフロントエンドに渡す
            res.json(characterStatus);
        } catch (error) {
            console.error("src取得中にエラーが発生しました。", error);
            res.status(500).json({
                error: "データ取得中にサーバーエラーが発生しました。",
            });
        } finally {
            // ブラウザを閉じる
            if (browser) {
                await browser.close();
            }
        }
    }
);

// サーバー起動。第一引数にポート番号を指定することでサーバー起動。
app.listen(port, () => {
    console.log(`バックエンドサーバーが${port}で起動しました。`);
});
