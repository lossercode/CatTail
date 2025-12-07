from pydantic import BaseModel

class Message(BaseModel):
    mode_name: str
    api_key: str
    content: str




