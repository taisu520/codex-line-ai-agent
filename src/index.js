import crypto from "node:crypto";
import "dotenv/config";
import express from "express";
import {
  createEastAsiaInboxItem,
  parseEastAsiaCommand
} from "./east-asia-inbox.js";
import { handleTextCommand } from "./commands.js";
import { createNotionNote, parseNoteCommand } from "./notion-notes.js";
import { createAiReply } from "./openai-agent.js";

const app = express();

const {
  LINE_CHANNEL_SECRET,
  LINE_CHANNEL_ACCESS_TOKEN,
  PORT = 3000
} = process.env;

if (!LINE_CHANNEL_SECRET || !LINE_CHANNEL_ACCESS_TOKEN) {
  console.warn(
    "Missing LINE_CHANNEL_SECRET or LINE_CHANNEL_ACCESS_TOKEN. Add them to .env before receiving LINE webhooks."
  );
}

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "LINE Bot AI Agent",
    status: "ok",
    webhook: "/webhook"
  });
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!verifyLineSignature(req.body, req.get("x-line-signature"))) {
      return res.status(401).json({ error: "Invalid LINE signature" });
    }

    let payload;
    try {
      payload = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    try {
      await Promise.all((payload.events ?? []).map(handleLineEvent));
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("LINE webhook error:", error);
      return res.status(500).json({ error: "Webhook handling failed" });
    }
  }
);

async function handleLineEvent(event) {
  if (event.type !== "message") return;
  if (event.message?.type !== "text") return;
  if (!event.replyToken) return;

  const replyText = await createReplyText(event.message.text);

  await replyMessage(event.replyToken, replyText);
}

async function createReplyText(text) {
  const eastAsiaContent = parseEastAsiaCommand(text);
  if (eastAsiaContent !== null) {
    return createEastAsiaInboxItem(eastAsiaContent);
  }

  const noteContent = parseNoteCommand(text);
  if (noteContent !== null) {
    return createNotionNote(noteContent);
  }

  const commandReply = handleTextCommand(text);
  if (commandReply !== null) {
    return commandReply;
  }

  return createAiReply(text);
}

function verifyLineSignature(bodyBuffer, signature) {
  if (!LINE_CHANNEL_SECRET || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(bodyBuffer)
    .digest("base64");

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    signatureBuffer,
    expectedSignatureBuffer
  );
}

async function replyMessage(replyToken, text) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is missing.");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "text",
          text
        }
      ]
    })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`LINE reply failed: ${response.status} ${responseText}`);
  }
}

app.listen(PORT, () => {
  console.log(`LINE Bot AI Agent is running on port ${PORT}`);
});
