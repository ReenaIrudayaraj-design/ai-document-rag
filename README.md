# AI Document Chat (RAG)

This project allows users to upload a document and ask questions about it using AI.

The system uses Retrieval Augmented Generation (RAG) to retrieve relevant document chunks and generate accurate answers.

## Features

- Upload PDF documents
- Automatic text extraction
- Text chunking
- Embedding generation
- Similarity search
- AI question answering
- Streaming responses
- Session based chat
- Toast notifications for UI feedback

## Tech Stack

Frontend
- React
- Fetch API
- React Toastify

Backend
- Node.js
- Express
- Multer (file upload)

AI / RAG
- Groq LLM (Llama 3.3 70B)
- Embeddings
- Cosine Similarity

## Project Architecture

User Uploads PDF
        │
        ▼
Text Extraction (pdf-parse)
        │
        ▼
Chunking
        │
        ▼
Embedding Generation
        │
        ▼
Vector Store (documentStore)
        │
        ▼
User Question
        │
        ▼
Similarity Search
        │
        ▼
Top Context Chunks
        │
        ▼
LLM Answer Generation


## Installation

Clone the repository

git clone https://github.com/yourusername/ai-document-rag.git

Install backend dependencies

cd backend
npm install

Install frontend dependencies

cd frontend
npm install

Create .env file

GROQ_API_KEY=your_api_key

Run backend

npm start

Run frontend

npm start

