"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardRouter = void 0;
const express_1 = require("express");
const cardGenerator_1 = require("../services/cardGenerator");
exports.cardRouter = (0, express_1.Router)();
exports.cardRouter.post('/generate', async (req, res) => {
    try {
        const cardData = req.body;
        const svg = await (0, cardGenerator_1.generateCardData)(cardData);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Card generation failed';
        res.status(500).json({ error: message });
    }
});
