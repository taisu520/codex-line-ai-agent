import { Client } from "@notionhq/client";
import { classifyNote } from "./note-classifier.js";

const NOTE_COMMAND = "/note";
const NOTION_ERROR_REPLY = "Notion 寫入失敗";

const { NOTION_TOKEN, NOTION_DATABASE_ID } = process.env;

const notion = NOTION_TOKEN
  ? new Client({
      auth: process.env.NOTION_TOKEN
    })
  : null;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.warn(
    "Missing NOTION_TOKEN or NOTION_DATABASE_ID. /note commands will return the fallback error message."
  );
}

export function parseNoteCommand(text) {
  const trimmedText = text.trim();

  if (trimmedText === NOTE_COMMAND) {
    return "";
  }

  if (!trimmedText.startsWith(`${NOTE_COMMAND} `)) {
    return null;
  }

  return trimmedText.slice(NOTE_COMMAND.length).trim();
}

export async function createNotionNote(content) {
  if (!notion || !NOTION_DATABASE_ID || !content) {
    return NOTION_ERROR_REPLY;
  }

  const title = createTitle(content);
  const category = await classifyNote(content);

  try {
    await notion.pages.create({
      parent: {
        database_id: NOTION_DATABASE_ID
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        Content: {
          rich_text: [
            {
              text: {
                content
              }
            }
          ]
        },
        Source: {
          select: {
            name: "LINE"
          }
        },
        Category: {
          select: {
            name: category
          }
        }
      }
    });

    return `已新增到 Notion：\n分類：${category}\n標題：${title}`;
  } catch (error) {
    console.error("Notion API error:", error);
    return NOTION_ERROR_REPLY;
  }
}

function createTitle(content) {
  return Array.from(content.trim()).slice(0, 30).join("");
}
