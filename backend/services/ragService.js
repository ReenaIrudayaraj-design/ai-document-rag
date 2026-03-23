import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getVectorStore } from "./pdfService.js";

// In-memory session history (replaces your sessions object)
const sessions = {};

// Lazy singleton — created only on first request, after dotenv has loaded
let llm;
function getLLM() {
  if (!llm) {
    llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      streaming: true,
    });
  }
  return llm;
}

export async function chatWithRAG(req, res) {
  const { message, sessionId } = req.body;

  // Init session
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }
  const history = sessions[sessionId];

  const vectorStore = getVectorStore();
  if (!vectorStore) {
    return res.json({ message: "Please upload a document first." });
  }

  // 1. Retriever — retrieve top 3 relavant chunks using cosine similarity (replaces your manual cosineSimilarity + sort)
  const retriever = vectorStore.asRetriever({ k: 3 });

  const llm = getLLM();

  // 2. prompts
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"), //history so far
    ["human", "{input}"], // the new question
    ["human", "Given the above conversation, generate a standalone search query to retrieve relevant context."],//instruction to llm
  ]);

  const historyAwareRetriever = await createHistoryAwareRetriever({
    llm,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // 3. QA prompt — prompt template
  const qaPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Use the context below to answer the question.

Context:
{context}`,
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

  // 4. Chains — replaces your manual scoredChunks + OpenAI stream loop
  const documentChain = await createStuffDocumentsChain({ llm, prompt: qaPrompt });
  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever: historyAwareRetriever,
  });

  // 5. Stream response
  res.setHeader("Content-Type", "text/plain");

  let assistantReply = "";
  const stream = await retrievalChain.stream({
    input: message,
    chat_history: history,
  });

  for await (const chunk of stream) {
    const content = chunk.answer ?? "";
    assistantReply += content;
    res.write(content);
  }

  res.end();

  // Save turn to session history
  history.push(new HumanMessage(message));
  history.push(new AIMessage(assistantReply));
}