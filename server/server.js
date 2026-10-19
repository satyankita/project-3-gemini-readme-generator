import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5002;

app.get("/", (req, res) => {
  res.json({ message: "Gemini README Generator API is running!" });
});

app.post("/api/generate-readme", async (req, res) => {
  try {
    const {
      name,
      description,
      techStack,
      features,
      installation,
      runCommand,
      github,
      author,
      license,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is missing. Add it to the server .env file.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
Create a professional GitHub README.md in Markdown for this project.

Project name: ${name}
Description: ${description || "Not provided"}
Technologies: ${techStack || "Not provided"}
Features: ${features || "Not provided"}
Installation command: ${installation || "npm install"}
Run command: ${runCommand || "npm run dev"}
GitHub repository: ${github || "Not provided"}
Author: ${author || "Not provided"}

Include:
1. Project title and description
2. Features
3. Tech stack
4. Installation instructions
5. How to run the project
6. Usage
7. Project structure, only if reasonable based on provided details

Return only the README Markdown content.
Do not invent features or commands that were not provided.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const readme = response.text;

    if (!readme) {
      return res.status(502).json({
        message: "Gemini returned an empty response. Please try again.",
      });
    }

    return res.json({ readme });
  } catch (error) {
    console.error("README generation error:", error.message);

    return res.status(500).json({
      message: "README generation failed. Check your API key and server logs.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
