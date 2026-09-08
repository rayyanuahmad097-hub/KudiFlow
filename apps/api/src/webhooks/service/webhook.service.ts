// services/webhook.service.ts
import { WebhookRepository } from "../repositories/webhook.repository";
import { DeliveryService } from "./delivery.service";
import crypto from "crypto";

export class WebhookService {
  private repo = new WebhookRepository();
  private delivery = new DeliveryService();

  async register(data: any) {
    const secret = crypto.randomBytes(32).toString("hex");

    return this.repo.create({
      ...data,
      secret,
    });
  }

  async trigger(event: string, payload: any) {
    const webhooks = await this.repo.findByEvent(event);

    for (const webhook of webhooks) {
      await this.delivery.send(webhook, {
        event,
        data: payload,
      });
    }
  }
}