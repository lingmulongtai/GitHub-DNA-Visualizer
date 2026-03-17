import { Router } from 'express';
import { generateCardData, CardData } from '../services/cardGenerator';

export const cardRouter = Router();

cardRouter.post('/generate', async (req, res) => {
  try {
    const cardData: CardData = req.body;
    const svg = await generateCardData(cardData);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Card generation failed';
    res.status(500).json({ error: message });
  }
});
