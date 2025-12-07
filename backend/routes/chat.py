from fastapi import APIRouter
from models.chat import Message
from services.chat import chat_llm
from services import response



chat_router = APIRouter(prefix="/chat", tags=["chat"])

@chat_router.post("/")
async def chat_llm(message: Message):
    return await chat_llm(message)

@chat_router.get("/")
async def get_chat_history():
    return response.success()
