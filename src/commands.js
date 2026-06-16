const HELP_TEXT = [
  "可用指令：",
  "/help：列出可用指令",
  "/ping：回覆 pong",
  "/讀書 今天：回覆今天讀書計畫",
  "/notion 測試：測試 Notion 串接狀態",
  "/calendar 測試：測試 Google Calendar 串接狀態"
].join("\n");

const TODAY_STUDY_PLAN = [
  "今天讀書計畫：",
  "1. 選一個主科，先讀 25 分鐘。",
  "2. 用 5 分鐘寫下今天最重要的 3 個概念。",
  "3. 做 3 題基礎題，確認自己真的懂。",
  "4. 結束前用一句話總結今天學到什麼。"
].join("\n");

export function handleTextCommand(text) {
  const command = text.trim();

  switch (command) {
    case "/help":
      return HELP_TEXT;
    case "/ping":
      return "pong";
    case "/讀書 今天":
      return TODAY_STUDY_PLAN;
    case "/notion 測試":
      return "Notion 串接待完成";
    case "/calendar 測試":
      return "Google Calendar 串接待完成";
    default:
      return null;
  }
}
