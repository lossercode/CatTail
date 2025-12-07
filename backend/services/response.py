'''
通用响应服务
'''
from models.response import Response

def success(data: dict = {}):
    return Response(code=0, msg="success", data=data)

def error(msg: str = "error", code: int = 1):
    return Response(code=code, msg=msg)
    