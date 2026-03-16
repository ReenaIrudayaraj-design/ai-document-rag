import fs from "fs";
//import pdfParse from "pdf-parse";
import { chunkText } from "../utils/chunkText.js";
import { createEmbedding } from "./embeddingService.js";

export const documentStore = [];
const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;

export async function processPDF(req, res) {

  try {

    console.log("File path:", req.file.path);
    console.log("File size:", fs.statSync(req.file.path).size);
    // Read the uploaded PDF file
    const fileBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdfParse(fileBuffer);//extraction

    const chunks = chunkText(pdfData.text);//chunking

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);//embedding
      documentStore.push({
        text: chunk,
        embedding
      });

    }
    console.log(documentStore)
    res.json({ message: "Document processed successfully" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "PDF processing failed" });

  }

}