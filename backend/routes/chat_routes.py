from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse
from services.rag_service import stream_rag_response

router = APIRouter()

@router.post("")    # ← no slash
@router.post("/")   # ← with slash — handles both
async def chat(request: Request):
    body = await request.json()
    message = body.get("message", "")
    session_id = body.get("sessionId", "default")

    if not message.strip():
        return JSONResponse(status_code=400, content={"error": "Message is required"})

    return StreamingResponse(
        stream_rag_response(message, session_id),
        media_type="text/plain",
        headers={
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )