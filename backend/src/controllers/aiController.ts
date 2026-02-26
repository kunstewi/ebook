import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// @desc    Generate chapter content using AI
// @route   POST /api/ai/generate-chapter
// @access  Private
export const generateChapterContent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title, description, bookContext } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Chapter title is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "AI service not configured. Please add GEMINI_API_KEY to environment variables"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are a professional book writer. Generate detailed, engaging content for a book chapter with the following details:

Title: ${title}
${description ? `Description: ${description}` : ""}
${bookContext ? `Book Context: ${bookContext}` : ""}

Please write comprehensive chapter content (approximately 500-1000 words) that is well-structured, engaging, and informative. Include relevant examples, explanations, and maintain a consistent narrative flow.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        res.status(200).json({
            success: true,
            content,
        });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate content",
            error: error.message
        });
    }
};

// @desc    Generate book outline using AI
// @route   POST /api/ai/generate-outline
// @access  Private
export const generateBookOutline = async (req: Request, res: Response): Promise<any> => {
    try {
        const { topic, genre, targetAudience, numberOfChapters } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "AI service not configured. Please add GEMINI_API_KEY to environment variables"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are a professional book planner. Create a detailed book outline with the following specifications:

Topic: ${topic}
${genre ? `Genre: ${genre}` : ""}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${numberOfChapters ? `Number of Chapters: ${numberOfChapters}` : "Number of Chapters: 10"}

Please provide:
1. A compelling book title
2. A subtitle
3. A detailed chapter-by-chapter outline with:
   - Chapter title
   - Brief description of what the chapter will cover

Format the response as a JSON object with the following structure:
{
  "title": "Book Title",
  "subtitle": "Book Subtitle",
  "chapters": [
    {
      "title": "Chapter Title",
      "description": "Chapter description"
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();

        // Try to extract JSON from the response
        try {
            // Remove markdown code blocks if present
            content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            const outline = JSON.parse(content);
            res.status(200).json({
                success: true,
                outline,
            });
        } catch (parseError) {
            // If JSON parsing fails, return the raw content
            res.status(200).json({
                success: true,
                rawContent: content,
                message: "Generated outline (manual parsing may be required)",
            });
        }
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate outline",
            error: error.message
        });
    }
};

// @desc    Improve existing content using AI
// @route   POST /api/ai/improve-content
// @access  Private
export const improveContent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { content, improvementType } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "AI service not configured. Please add GEMINI_API_KEY to environment variables"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let prompt = "";

        switch (improvementType) {
            case "grammar":
                prompt = `Please improve the grammar and spelling of the following text while maintaining its original meaning and style:\n\n${content}`;
                break;
            case "clarity":
                prompt = `Please improve the clarity and readability of the following text while maintaining its original meaning:\n\n${content}`;
                break;
            case "expand":
                prompt = `Please expand and elaborate on the following text, adding more details, examples, and explanations:\n\n${content}`;
                break;
            case "simplify":
                prompt = `Please simplify the following text to make it easier to understand while maintaining the key points:\n\n${content}`;
                break;
            default:
                prompt = `Please improve the following text by enhancing its grammar, clarity, and overall quality:\n\n${content}`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const improvedContent = response.text();

        res.status(200).json({
            success: true,
            improvedContent,
        });
    } catch (error: any) {
        console.error("AI Improvement Error:", error);
        res.status(500).json({
            message: "Failed to improve content",
            error: error.message
        });
    }
};

// @desc    Generate creative book titles using AI
// @route   POST /api/ai/generate-title
// @access  Private
export const generateTitle = async (req: Request, res: Response): Promise<any> => {
    try {
        const { topic, genre, keywords } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "AI service not configured. Please add GEMINI_API_KEY to environment variables"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Generate 5 creative and engaging book titles for a book about:

Topic: ${topic}
${genre ? `Genre: ${genre}` : ""}
${keywords ? `Keywords: ${keywords}` : ""}

Please provide titles that are:
- Catchy and memorable
- Relevant to the topic
- Appropriate for the genre
- Professional and marketable

Format the response as a JSON array of objects with 'title' and 'subtitle' fields:
[
  {
    "title": "Main Title",
    "subtitle": "Subtitle or tagline"
  }
]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();

        // Try to extract JSON from the response
        try {
            // Remove markdown code blocks if present
            content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            const titles = JSON.parse(content);
            res.status(200).json({
                success: true,
                titles,
            });
        } catch (parseError) {
            // If JSON parsing fails, return the raw content
            res.status(200).json({
                success: true,
                rawContent: content,
                message: "Generated titles (manual parsing may be required)",
            });
        }
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate titles",
            error: error.message
        });
    }
};

// Export handled by inline export const
