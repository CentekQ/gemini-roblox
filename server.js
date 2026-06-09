const express = require("express");
const app = express();
app.use(express.json());

// fetch dla Node/Render
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// klucz z Render ENV
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/gemini", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                error: "Brak GEMINI_API_KEY w ENV"
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        // 🔥 NAJWAŻNIEJSZA ZMIANA (debug – pokazuje prawdziwą odpowiedź API)
        return res.json(data);

    } catch (err) {
        console.log("ERROR:", err);

        return res.status(500).json({
            error: "Server crashed",
            details: err.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Działa na porcie " + PORT);
});
