import test from "node:test";
import assert from "node:assert/strict";
import { readConversations, saveConversations } from "../src/store.js";

test("conversation store round trips a lead", async () => {
  const conversations = {
    "555499999999": {
      from: "555499999999",
      state: "qualifying",
      messages: [{ role: "user", content: "Quero um sistema" }],
      seenMessageIds: ["wamid.test"],
    },
  };

  await saveConversations(conversations);
  const loaded = await readConversations();
  assert.equal(loaded["555499999999"].messages[0].content, "Quero um sistema");
});
