// controllers/webhook.controller.ts
import { Request, Response } from "express";
import { WebhookService } from "../services/webhook.service";

const service = new WebhookService();

export class WebhookController {
  async register(req: Request, res: Response) {
    const webhook = await service.register(req.body);
    res.status(201).json(webhook);
  }
}