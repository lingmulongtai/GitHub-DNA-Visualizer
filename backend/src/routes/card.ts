import { Router } from 'express';
import { generateCardData, CardData } from '../services/cardGenerator';

export const cardRouter = Router();

cardRouter.post('/generate', async (req, res) => {
  const { username, avatarUrl, name, topLanguages, personalityScores } = (req.body ?? {}) as Record<string, unknown>;

  if (
    typeof username !== 'string' || !username ||
    typeof avatarUrl !== 'string' || !avatarUrl.startsWith('https://') ||
    !Array.isArray(topLanguages) ||
    typeof personalityScores !== 'object' || personalityScores === null
  ) {
    res.status(400).json({ error: 'Invalid card data' });
    return;
  }

  try {
    const cardData: CardData = { username, avatarUrl, name: typeof name === 'string' ? name : null, topLanguages, personalityScores } as CardData;
    const svg = await generateCardData(cardData);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Card generation failed';
    res.status(500).json({ error: message });
  }
});
