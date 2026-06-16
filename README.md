# LINE Bot AI Agent MVP

這是一個最小可用版本的 LINE Bot 遠端控制台。  
目前只處理 LINE 的文字訊息，並先保留 Notion 與 Google Calendar 的測試指令，不會真的寫入外部服務。

## 功能

- Node.js + Express
- 接收 LINE Messaging API webhook
- 驗證 LINE signature
- 只處理文字訊息
- 使用 `.env` 管理 LINE 金鑰
- 可部署到 Render

## 可用指令

```text
/help
/ping
/讀書 今天
/notion 測試
/calendar 測試
```

回覆內容：

- `/help`：列出可用指令
- `/ping`：回覆 `pong`
- `/讀書 今天`：回覆今天讀書計畫
- `/notion 測試`：回覆 `Notion 串接待完成`
- `/calendar 測試`：回覆 `Google Calendar 串接待完成`

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
PORT=3000
```

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
```

值要從 LINE Developers Console 複製。

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

## 專案結構

```text
.
├── README.md
├── package.json
├── .env.example
└── src
    ├── commands.js
    └── index.js
```

## 下一步

後續可以逐步加入：

- Notion API 寫入讀書紀錄
- Google Calendar 建立讀書行程
- 使用者權限控管
- 指令記錄與錯誤通知
- AI 回覆與長期學習資料庫
