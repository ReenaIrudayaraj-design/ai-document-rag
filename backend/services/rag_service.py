import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi import Request
from services.pdf_service import get_vector_store

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

sessions = {}
_llm = None


def get_llm():
    global _llm
    if _llm is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is missing. Check your .env file.")
        _llm = ChatGroq(
            api_key=api_key,
            model="llama-3.3-70b-versatile",
            streaming=True,
        )
    return _llm


async def stream_rag_response(message: str, session_id: str):
    if session_id not in sessions:
        sessions[session_id] = []
    history = sessions[session_id]

    vector_store = get_vector_store()
    if not vector_store:
        yield "Please upload a document first."
        return

    try:
        llm = get_llm()
        retriever = vector_store.as_retriever(search_kwargs={"k": 3})

        history_aware_prompt = ChatPromptTemplate.from_messages([
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
            ("human", "Given the above conversation, generate a standalone search query to retrieve relevant context."),
        ])

        history_aware_retriever = create_history_aware_retriever(
            llm, retriever, history_aware_prompt
        )

        qa_prompt = ChatPromptTemplate.from_messages([
            ("system", "Use the context below to answer the question.\n\nContext:\n{context}"),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])

        document_chain = create_stuff_documents_chain(llm, qa_prompt)
        retrieval_chain = create_retrieval_chain(history_aware_retriever, document_chain)

        result = await retrieval_chain.ainvoke({
            "input": message,
            "chat_history": history,
        })

        answer = result.get("answer", "No answer found")
        print("Answer:", answer)

        history.append(HumanMessage(content=message))
        history.append(AIMessage(content=answer))

        yield answer

    except Exception as e:
        print(f"Chain error: {e}")
        yield f"Error: {str(e)}"