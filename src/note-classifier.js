import OpenAI from "openai";

const CATEGORIES = ["東亞樹", "日文", "其他"];
const DEFAULT_CATEGORY = "其他";

const CLASSIFIER_PROMPT = [
  "你是 LINE 筆記分類器。",
  "請只輸出以下三個分類之一，不要加解釋、標點或其他文字：",
  "東亞樹",
  "日文",
  "其他",
  "",
  "分類規則：",
  "- 與東亞樹知識庫、東亞哲學、佛教、中國思想、經典、牟宗三、康德、儒學、思想史相關：東亞樹",
  "- 與日文、日語、單字、文法、JLPT、五十音、閱讀、聽力相關：日文",
  "- 無法明確歸類到前兩者：其他"
].join("\n");

const { OPENAI_API_KEY, OPENAI_MODEL = "gpt-4.1-mini" } = process.env;

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

export async function classifyNote(content) {
  if (!openai) return DEFAULT_CATEGORY;

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: CLASSIFIER_PROMPT,
      input: content
    });

    return normalizeCategory(response.output_text);
  } catch (error) {
    console.error("OpenAI note classification error:", error);
    return DEFAULT_CATEGORY;
  }
}

function normalizeCategory(value) {
  const text = value?.trim() ?? "";

  if (CATEGORIES.includes(text)) {
    return text;
  }

  const matchedCategory = CATEGORIES.find((category) =>
    text.includes(category)
  );

  return matchedCategory ?? DEFAULT_CATEGORY;
}
