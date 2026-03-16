import OpenAI from "openai";
import { cosineSimilarity } from "../utils/similarity.js";
import { documentStore } from "./pdfService.js";
import { createEmbedding } from "./embeddingService.js";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

export const sessions = {};

export async function chatWithRAG(req, res) {

    const { message, sessionId } = req.body;

    //  // check if document uploaded
    // if (!documentStore || documentStore.length === 0) {
    //     return res.json({
    //         message: "Please upload a document first."
    //     });
    // }

     // Create session if not exists
    if (!sessions[sessionId]) {
        sessions[sessionId] = [];
    }

    // Add user question to session
    sessions[sessionId].push({
        role: "user",
        content: message
    });

    const questionEmbedding = await createEmbedding(message);

    const scoredChunks = documentStore.map(chunk => ({
        text: chunk.text,
        score: cosineSimilarity(questionEmbedding, chunk.embedding)
    }));
    console.log("Document Store:", documentStore);
    console.log("Question Embedding:", questionEmbedding);
    console.log("Scored Chunks:", scoredChunks);
    scoredChunks.sort((a, b) => b.score - a.score);
    // Take top 3 relevant chunks
    const context = scoredChunks
        .slice(0, 3)
        .map(c => c.text)
        .join("\n");

    const prompt = `
        Use the context below to answer the question.

        Context:
        ${context}

        Question:
        ${message}
        `;

    const messages = [
        { role: "system", content: prompt },
        ...sessions[sessionId]
    ];

    const stream = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        stream: true
    });

    res.setHeader("Content-Type", "text/plain");
    // Stream the response back to the client
    let assistantReply = "";
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        assistantReply += content;
        res.write(content);
    }

    res.end();

}