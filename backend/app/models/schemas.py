from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AskJijiRequest(BaseModel):
    query: str

class Resource(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    type: str # 'ppt' | 'video'
    url: str

class AskJijiResponse(BaseModel):
    answer: str
    resources: List[Resource]

class QueryLog(BaseModel):
    id: str
    user_id: str
    query_text: str
    created_at: datetime
