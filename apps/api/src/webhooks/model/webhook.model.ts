// models/webhook.model.ts
import mongoose from "mongoose";

const WebhookSchema = new mongoose.Schema({
  url: { type: String, required: true },
  events: [{ type: String, required: true }],
  secret: { type: String, required: true },
}, { timestamps: true });

export const WebhookModel = mongoose.model("Webhook", WebhookSchema);