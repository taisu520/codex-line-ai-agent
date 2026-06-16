# LINE Bot AI Agent MVP

這是一個最小可用版本的 LINE Bot 遠端控制台。  
目前只處理 LINE 的文字訊息。v0.5.1 新增東亞樹 Inbox 處理指令：固定指令會走內建回覆，`/process` 會把東亞樹 Inbox 資料送到對應待整理資料庫，`/ea` 會寫入東亞樹 Inbox，`/note` 會寫入一般 Notion Inbox，一般自然語言訊息會交給 AI 回覆。

Google Calendar 目前仍是測試指令，不會真的寫入外部服務。

## 版本狀態

### v0.5.1

- 新增 `/process 關鍵字` 指令。
- 搜尋東亞樹 Inbox 中 `Name` 包含關鍵字且 `Processed=false` 的資料。
- 找到多筆時不處理，要求使用更精確的關鍵字。
- 依 `Target` 寫入對應待整理資料庫：
  - `人物待整理`
  - `思想待整理`
  - `作品待整理`
  - `歷史待整理`
- 寫入成功後更新原 Inbox：
  - `Processed=true`
  - `Status=Done`

### v0.5

- 新增 `/ea 內容` 指令。
- `/ea` 只寫入東亞樹 Inbox，不會直接寫入人物樹、思想樹、作品樹、歷史樹。
- 東亞樹 Inbox 欄位對應：
  - `Name`：內容前 30 字
  - `Content`：完整內容
  - `Processed`：`false`
- 保留 `/note` 自動分類與一般 AI 對話。

### v0.4

- 保留 v0.3 的 Notion Inbox 寫入功能。
- 新增 `/note` 自動分類。
- 目前仍全部寫入同一個 `LINE AI Agent Inbox`。
- Notion 欄位對應：
  - `Name`：內容前 30 字
  - `Content`：完整內容
  - `Source`：`LINE`
  - `Category`：AI 判斷的分類，選項為 `東亞樹`、`日文`、`其他`

### v0.3

- 保留 v0.2 的 OpenAI 一般聊天功能。
- 新增 `/note 內容` 指令。
- `/note` 會建立一筆 Notion database page。
- Notion 欄位對應：
  - `Name`：內容前 30 字
  - `Content`：完整內容
  - `Source`：`LINE`

### v0.2

- 保留 v0.1 的 LINE webhook 與固定指令。
- 新增 OpenAI API 一般聊天功能。
- 如果 OpenAI API 暫時失敗，會回覆：

```text
AI 回覆暫時失敗，請稍後再試。
```

### v0.1

- Node.js + Express
- LINE Messaging API webhook
- LINE signature 驗證
- 基礎文字指令

## 功能

- Node.js + Express
- 接收 LINE Messaging API webhook
- 驗證 LINE signature
- 只處理文字訊息
- 使用 `.env` 管理 LINE 與 OpenAI 金鑰
- 非固定指令會送到 OpenAI API 產生回覆
- `/process 關鍵字` 會處理東亞樹 Inbox 資料
- `/ea 內容` 會寫入東亞樹 Inbox
- `/note 內容` 會寫入 Notion database，並自動寫入 `Category`
- 可部署到 Render

## 可用指令

```text
/help
/ping
/讀書 今天
/notion 測試
/calendar 測試
/process 關鍵字
/ea 內容
/note 內容
```

回覆內容：

- `/help`：列出可用指令
- `/ping`：回覆 `pong`
- `/讀書 今天`：回覆今天讀書計畫
- `/notion 測試`：回覆 `Notion 串接待完成`
- `/calendar 測試`：回覆 `Google Calendar 串接待完成`
- `/process 關鍵字`：處理東亞樹 Inbox 資料
- `/ea 內容`：把內容新增到東亞樹 Inbox
- `/note 內容`：把內容新增到 Notion

東亞樹 Inbox 處理範例：

```text
/process 牟宗三
```

成功時會回覆：

```text
已處理東亞樹 Inbox：

Target：思想待整理
標題：牟宗三與康德比較
```

如果找到多筆，會回覆：

```text
找到多筆符合資料，請使用更精確的關鍵字
```

如果找不到，會回覆：

```text
找不到符合條件的東亞樹 Inbox 資料
```

東亞樹 Inbox 範例：

```text
/ea 今天開始整理牟宗三與康德的比較
```

成功時會回覆：

```text
已新增到東亞樹 Inbox：
今天開始整理牟宗三與康德的比較
```

如果東亞樹 Inbox 寫入失敗，會回覆：

```text
東亞樹 Inbox 寫入失敗
```

Notion 筆記範例：

```text
/note 牟宗三與康德：智的直覺是在回答人是否能接近絕對價值
```

成功時會回覆：

```text
已新增到 Notion：
分類：東亞樹
標題：牟宗三與康德：智的直覺是在回答人是否能接近絕對價值
```

如果 Notion 寫入失敗，會回覆：

```text
Notion 寫入失敗
```

## 本機設定

1. 安裝套件

```bash
npm install
```

2. 建立 `.env`

```bash
cp .env.example .env
```

3. 編輯 `.env`

```env
LINE_CHANNEL_SECRET=你的 LINE Channel Secret
LINE_CHANNEL_ACCESS_TOKEN=你的 LINE Channel Access Token
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-4.1-mini
NOTION_TOKEN=你的 Notion Integration Token
NOTION_DATABASE_ID=你的 Notion Database ID
NOTION_EA_INBOX_DATABASE_ID=你的東亞樹 Inbox Database ID
NOTION_EA_PEOPLE_STAGING_DATABASE_ID=你的東亞樹人物待整理 Database ID
NOTION_EA_THOUGHT_STAGING_DATABASE_ID=你的東亞樹思想待整理 Database ID
NOTION_EA_WORK_STAGING_DATABASE_ID=你的東亞樹作品待整理 Database ID
NOTION_EA_HISTORY_STAGING_DATABASE_ID=你的東亞樹歷史待整理 Database ID
PORT=3000
```

`OPENAI_MODEL` 可以先保留預設值。之後如果要更換模型，只要調整環境變數，不一定要改程式。

v0.5.1 需要新增四個待整理資料庫 ID，用來讓 `/process` 依照 `Target` 分流。

4. 啟動

```bash
npm run dev
```

本機服務會啟動在：

```text
http://localhost:3000
```

LINE webhook endpoint 是：

```text
http://localhost:3000/webhook
```

本機測試 LINE webhook 通常還需要 ngrok 或其他公開網址工具，因為 LINE 需要能連到公開 HTTPS 網址。

## 部署到 Render

這個專案也附了 `render.yaml`，可以用 Render Blueprint 部署；如果你想一步一步設定，也可以照下面的手動方式。

### 1. 建立 GitHub repository

把這個專案推到 GitHub。

### 2. 在 Render 建立 Web Service

1. 進入 Render Dashboard。
2. 選擇 `New`。
3. 選擇 `Web Service`。
4. 連接你的 GitHub repository。
5. 設定：

```text
Environment: Node
Build Command: npm install
Start Command: npm start
```

### 3. 設定 Environment Variables

在 Render 的 `Environment` 頁面加入：

```text
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
OPENAI_API_KEY
NOTION_TOKEN
NOTION_DATABASE_ID
NOTION_EA_INBOX_DATABASE_ID
NOTION_EA_PEOPLE_STAGING_DATABASE_ID
NOTION_EA_THOUGHT_STAGING_DATABASE_ID
NOTION_EA_WORK_STAGING_DATABASE_ID
NOTION_EA_HISTORY_STAGING_DATABASE_ID
```

`LINE_CHANNEL_SECRET` 和 `LINE_CHANNEL_ACCESS_TOKEN` 要從 LINE Developers Console 複製。  
`OPENAI_API_KEY` 要從 OpenAI API keys 頁面建立並複製。
`NOTION_TOKEN` 要從 Notion integration 取得。
`NOTION_DATABASE_ID` 是要寫入的 Notion database ID。
`NOTION_EA_INBOX_DATABASE_ID` 是東亞樹 Inbox database ID。
四個 `NOTION_EA_*_STAGING_DATABASE_ID` 是東亞樹待整理資料庫 ID。

### 4. 設定 LINE webhook URL

Render 部署完成後，會得到一個網址，例如：

```text
https://your-service-name.onrender.com
```

到 LINE Developers Console，把 webhook URL 設定成：

```text
https://your-service-name.onrender.com/webhook
```

然後啟用：

```text
Use webhook: Enabled
```

### 5. 測試

在 LINE 對你的 Bot 傳送：

```text
/ping
```

如果回覆：

```text
pong
```

代表 LINE 遠端控制台 MVP 已經可以運作。

接著傳送一般自然語言，例如：

```text
我今天想讀英文，但是不知道怎麼開始
```

如果 Bot 回覆繁體中文的讀書建議，代表 v0.2 的 OpenAI 一般聊天功能已經運作。

測試 Notion 寫入：

```text
/note 今天開始整理東亞樹知識庫的第一筆筆記
```

如果 Bot 回覆 `已新增到 Notion：`、分類和標題，代表 Notion integration 已經運作。

測試 v0.5 東亞樹 Inbox：

```text
/ea 今天開始整理牟宗三與康德的比較
```

預期 LINE 回覆：

```text
已新增到東亞樹 Inbox：
今天開始整理牟宗三與康德的比較
```

到東亞樹 Inbox 確認：

```text
Name       今天開始整理牟宗三與康德的比較
Content    今天開始整理牟宗三與康德的比較
Processed  false
```

測試 v0.5.1 東亞樹 Inbox 處理：

先在東亞樹 Inbox 準備一筆資料：

```text
Name       牟宗三與康德比較
Content    牟宗三與康德都在處理人如何接近普遍價值的問題
Processed  false
Target     思想待整理
Status     Ready
```

在 LINE 傳送：

```text
/process 牟宗三
```

預期 LINE 回覆：

```text
已處理東亞樹 Inbox：

Target：思想待整理
標題：牟宗三與康德比較
```

到 `思想待整理` 資料庫確認新增：

```text
Name           牟宗三與康德比較
Content        牟宗三與康德都在處理人如何接近普遍價值的問題
Source         East Asia Inbox
Inbox Page ID  原 Inbox page id
```

原 Inbox 應更新：

```text
Processed  true
Status     Done
```

測試 v0.4 自動分類：

```text
/note 今天開始建立東亞樹知識庫
```

預期分類：

```text
東亞樹
```

```text
/note 今天背了50個日文單字
```

預期分類：

```text
日文
```

```text
/note 今天天氣很好
```

預期分類：

```text
其他
```

## 專案結構

```text
.
├── README.md
├── package.json
├── render.yaml
├── .env.example
└── src
    ├── commands.js
    ├── east-asia-inbox.js
    ├── east-asia-processor.js
    ├── note-classifier.js
    ├── notion-notes.js
    ├── openai-agent.js
    └── index.js
```

## 更新到 v0.5.1 後要執行的指令

安裝套件：

```bash
npm install
```

如果你想明確安裝 Notion 官方 SDK：

```bash
npm install @notionhq/client
```

檢查語法：

```bash
npm run check
```

本機開發：

```bash
npm run dev
```

## Commit 與 Push

```bash
git status
git add .
git commit -m "Add East Asia inbox processor"
git push origin main
```

推上 GitHub 後，Render 會依照設定重新部署。

## 下一步

後續可以逐步加入：

- Notion API 寫入讀書紀錄
- Google Calendar 建立讀書行程
- 使用者權限控管
- 指令記錄與錯誤通知
- 長期學習資料庫
