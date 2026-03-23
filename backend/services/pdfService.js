import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

// Singleton embeddings model (Xenova/all-MiniLM-L6-v2 — same as before)
export const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

// In-memory vector store (replaces documentStore array + cosineSimilarity)
let vectorStore = null;

export function getVectorStore() {
  return vectorStore;
}

export async function processPDF(req, res) {
  try {
    console.log("File path:", req.file.path);

    // 1. Load PDF — replaces pdf-parse + fs.readFileSync
    const loader = new PDFLoader(req.file.path);
    const docs = await loader.load();

    // 2. Chunk — replaces your chunkText utility
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50, // small overlap so context isn't lost at boundaries
    });
    const chunks = await splitter.splitDocuments(docs);

    // 3. Embed + store — replaces your for-loop with createEmbedding + documentStore.push
    vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

    console.log(`Stored ${chunks.length} chunks in vector store`);
    res.json({ message: "Document processed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PDF processing failed" });
  }
}