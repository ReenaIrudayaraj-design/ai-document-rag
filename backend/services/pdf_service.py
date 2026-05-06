from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from fastapi import UploadFile
from fastapi.responses import JSONResponse
import shutil
import os

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

vector_store = None
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        print("Loading embeddings model...")
        _embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
        print("Embeddings model loaded")
    return _embeddings

def get_vector_store():
    return vector_store

async def process_pdf(file: UploadFile):
    global vector_store
    try:
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"File saved: {file_path}")

        loader = PyPDFLoader(file_path)
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
        )
        chunks = splitter.split_documents(docs)

        print(f"Creating vector store with {len(chunks)} chunks...")
        vector_store = FAISS.from_documents(chunks, get_embeddings())

        print(f"Stored {len(chunks)} chunks in vector store")
        return JSONResponse(content={"message": "Document processed successfully"})

    except Exception as e:
        print(f"PDF processing error: {e}")
        return JSONResponse(status_code=500, content={"error": "PDF processing failed", "detail": str(e)})