const express = require("express");
const app = express();
app.use(express.json());

// fetch kompatybilny z Node / Render
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// API KEY z ENV
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// endpoint
app.post("/gemini", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                error: "Brak GEMINI_API_KEY w ENV"
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
                GEMINI_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `
Jesteś generatorem skryptów Roblox Studio (Lua).

Zasady:
- Zwracaj TYLKO kod Lua
- Nie dodawaj wyjaśnień
- Kod ma działać w Roblox Studio
- Twórz obiekty 3D (Part, Model, Workspace)
- Możesz używać fizyki, CFrame, TweenService

Zadanie:
${prompt}
                                    `
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

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

// start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Działa na porcie " + PORT);
});
