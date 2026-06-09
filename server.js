const express = require("express");
const app = express();
app.use(express.json());

// fetch kompatybilny z Render / Node
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// klucz z ENV (Render)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🔥 endpoint AI
app.post("/gemini", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                error: "Brak GEMINI_API_KEY w ENV"
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
                GEMINI_API_KEY,
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

        // 🧠 bezpieczne wyciąganie odpowiedzi
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        // jeśli coś poszło nie tak
        if (!text) {
            return res.json({
                error: "Brak odpowiedzi z Gemini",
                debug: data
            });
        }

        return res.json({
            response: text
        });

    } catch (err) {
        console.log("ERROR:", err);

        return res.status(500).json({
            error: "Server crashed",
            details: err.message
        });
    }
});

// start serwera
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Działa na porcie " + PORT);
});
