'''
通用响应模型
'''
from pydantic import BaseModel

class Response(BaseModel):
    code: int
    msg: str
    data: dict = {}
