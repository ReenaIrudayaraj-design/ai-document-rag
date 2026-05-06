from fastapi import APIRouter, UploadFile, File
from services.pdf_service import process_pdf

router = APIRouter()

@router.post("")
@router.post("/")
async def upload(file: UploadFile = File(...)):
    return await process_pdf(file)