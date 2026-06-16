import { Client } from "@notionhq/client";

const EAST_ASIA_COMMAND = "/ea";
const EAST_ASIA_ERROR_REPLY = "東亞樹 Inbox 寫入失敗";

const { NOTION_TOKEN, NOTION_EA_INBOX_DATABASE_ID } = process.env;

const notion = NOTION_TOKEN
  ? new Client({
      auth: process.env.NOTION_TOKEN
    })
  : null;

if (!NOTION_TOKEN || !NOTION_EA_INBOX_DATABASE_ID) {
  console.warn(
    "Missing NOTION_TOKEN or NOTION_EA_INBOX_DATABASE_ID. /ea commands will return the fallback error message."
  );
}

export function parseEastAsiaCommand(text) {
  const trimmedText = text.trim();

  if (trimmedText === EAST_ASIA_COMMAND) {
    return "";
  }

  if (!trimmedText.startsWith(`${EAST_ASIA_COMMAND} `)) {
    return null;
  }

  return trimmedText.slice(EAST_ASIA_COMMAND.length).trim();
}

export async function createEastAsiaInboxItem(content) {
  if (!notion || !NOTION_EA_INBOX_DATABASE_ID || !content) {
    return EAST_ASIA_ERROR_REPLY;
  }

  const title = createTitle(content);

  try {
    await notion.pages.create({
      parent: {
        database_id: NOTION_EA_INBOX_DATABASE_ID
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
        Processed: {
          checkbox: false
        }
      }
    });

    return `已新增到東亞樹 Inbox：\n${title}`;
  } catch (error) {
    console.error("East Asia Inbox Notion API error:", error);
    return EAST_ASIA_ERROR_REPLY;
  }
}

function createTitle(content) {
  return Array.from(content.trim()).slice(0, 30).join("");
}
