import { Client } from "@notionhq/client";

const PROCESS_COMMAND = "/process";
const MULTIPLE_MATCHES_REPLY = "找到多筆符合資料，請使用更精確的關鍵字";
const NO_MATCH_REPLY = "找不到符合條件的東亞樹 Inbox 資料";
const UNSUPPORTED_TARGET_REPLY = "Target 尚未設定或不支援";
const PROCESS_ERROR_REPLY = "東亞樹 Inbox 處理失敗";
const SOURCE_NAME = "East Asia Inbox";
const DONE_STATUS = "Done";

const {
  NOTION_TOKEN,
  NOTION_EA_INBOX_DATABASE_ID,
  NOTION_EA_PEOPLE_STAGING_DATABASE_ID,
  NOTION_EA_THOUGHT_STAGING_DATABASE_ID,
  NOTION_EA_WORK_STAGING_DATABASE_ID,
  NOTION_EA_HISTORY_STAGING_DATABASE_ID
} = process.env;

const notion = NOTION_TOKEN
  ? new Client({
      auth: process.env.NOTION_TOKEN
    })
  : null;

const TARGET_DATABASES = {
  "人物待整理": NOTION_EA_PEOPLE_STAGING_DATABASE_ID,
  "思想待整理": NOTION_EA_THOUGHT_STAGING_DATABASE_ID,
  "作品待整理": NOTION_EA_WORK_STAGING_DATABASE_ID,
  "歷史待整理": NOTION_EA_HISTORY_STAGING_DATABASE_ID
};

if (!NOTION_TOKEN || !NOTION_EA_INBOX_DATABASE_ID) {
  console.warn(
    "Missing NOTION_TOKEN or NOTION_EA_INBOX_DATABASE_ID. /process commands will return the fallback error message."
  );
}

export function parseProcessCommand(text) {
  const trimmedText = text.trim();

  if (trimmedText === PROCESS_COMMAND) {
    return "";
  }

  if (!trimmedText.startsWith(`${PROCESS_COMMAND} `)) {
    return null;
  }

  return trimmedText.slice(PROCESS_COMMAND.length).trim();
}

export async function processEastAsiaInboxItem(keyword) {
  if (!notion || !NOTION_EA_INBOX_DATABASE_ID || !keyword) {
    return PROCESS_ERROR_REPLY;
  }

  try {
    const matches = await queryInboxByKeyword(keyword);

    if (matches.length === 0) {
      return NO_MATCH_REPLY;
    }

    if (matches.length > 1) {
      return MULTIPLE_MATCHES_REPLY;
    }

    const inboxPage = normalizeInboxPage(matches[0]);
    const targetDatabaseId = TARGET_DATABASES[inboxPage.target];

    if (!targetDatabaseId) {
      return UNSUPPORTED_TARGET_REPLY;
    }

    await createStagingPage(targetDatabaseId, inboxPage);
    await markInboxDone(inboxPage.id);

    return [
      "已處理東亞樹 Inbox：",
      "",
      `Target：${inboxPage.target}`,
      `標題：${inboxPage.title}`
    ].join("\n");
  } catch (error) {
    console.error("East Asia processor error:", error);
    return PROCESS_ERROR_REPLY;
  }
}

async function queryInboxByKeyword(keyword) {
  const response = await notion.databases.query({
    database_id: NOTION_EA_INBOX_DATABASE_ID,
    filter: {
      and: [
        {
          property: "Name",
          title: {
            contains: keyword
          }
        },
        {
          property: "Processed",
          checkbox: {
            equals: false
          }
        }
      ]
    },
    page_size: 2
  });

  return response.results;
}

function normalizeInboxPage(page) {
  return {
    id: page.id,
    title: readTitle(page.properties.Name),
    content: readRichText(page.properties.Content),
    target: page.properties.Target?.select?.name ?? ""
  };
}

async function createStagingPage(databaseId, inboxPage) {
  await notion.pages.create({
    parent: {
      database_id: databaseId
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: inboxPage.title
            }
          }
        ]
      },
      Content: {
        rich_text: [
          {
            text: {
              content: inboxPage.content
            }
          }
        ]
      },
      Source: {
        select: {
          name: SOURCE_NAME
        }
      },
      "Inbox Page ID": {
        rich_text: [
          {
            text: {
              content: inboxPage.id
            }
          }
        ]
      }
    }
  });
}

async function markInboxDone(pageId) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Processed: {
        checkbox: true
      },
      Status: {
        select: {
          name: DONE_STATUS
        }
      }
    }
  });
}

function readTitle(property) {
  return property?.title?.map((item) => item.plain_text).join("") ?? "";
}

function readRichText(property) {
  return property?.rich_text?.map((item) => item.plain_text).join("") ?? "";
}
