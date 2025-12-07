from models.chat import Message

async def chat_llm(message: Message):
    return message.content
