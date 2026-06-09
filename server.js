const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const GEMINI_API_KEY = "TWOJ_KLUCZ_TUTAJ";

app.post("/gemini", async (req, res) => {
    const prompt = req.body.prompt;

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        }
    );

    const data = await response.json();

    const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "Brak odpowiedzi";

    res.json({ response: text });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Działa na porcie " + PORT);
});