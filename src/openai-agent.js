import OpenAI from "openai";

const SYSTEM_PROMPT =
  "你是臺樹的私人 AI Agent，透過 LINE 協助他讀書、整理想法、規劃東亞樹知識庫、日文學習、學測與分科準備。回答要使用繁體中文，語氣要穩定、清楚、一步一步，不要一次丟太多步驟。";

const AI_ERROR_REPLY = "AI 回覆暫時失敗，請稍後再試。";
const LINE_TEXT_LIMIT = 5000;

const { OPENAI_API_KEY, OPENAI_MODEL = "gpt-4.1-mini" } = process.env;

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

if (!OPENAI_API_KEY) {
  console.warn(
    "Missing OPENAI_API_KEY. Natural language chat replies will return the fallback error message."
  );
}

export async function createAiReply(userText) {
  if (!openai) return AI_ERROR_REPLY;

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: SYSTEM_PROMPT,
      input: userText
    });

    const replyText = response.output_text?.trim();
    if (!replyText) return AI_ERROR_REPLY;

    return limitLineText(replyText);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return AI_ERROR_REPLY;
  }
}

function limitLineText(text) {
  if (text.length <= LINE_TEXT_LIMIT) return text;
  return `${text.slice(0, LINE_TEXT_LIMIT - 20)}\n\n（回覆已截短）`;
}
