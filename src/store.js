import fs from "node:fs/promises";
import path from "node:path";

const dataDir = path.resolve("data");
const dataFile = path.join(dataDir, "conversations.json");

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function readConversations() {
  await ensureDataDir();
  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

export async function saveConversations(conversations) {
  await ensureDataDir();
  await fs.writeFile(dataFile, JSON.stringify(conversations, null, 2));
}
