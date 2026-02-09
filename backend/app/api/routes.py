from fastapi import APIRouter, Depends, HTTPException, Header
from app.models.schemas import AskJijiRequest, AskJijiResponse
from app.services.retrieval import search_resources
from app.services.answer import generate_answer
from app.services.supabase_client import get_supabase_admin
from typing import Annotated

router = APIRouter()

async def verify_token(authorization: Annotated[str, Header()]):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    token = authorization.split(" ")[1] if " " in authorization else authorization
    supabase = get_supabase_admin()
    
    # Validate the JWT via Supabase
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
             raise HTTPException(status_code=401, detail="Invalid User Token")
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication Failed: {str(e)}")

@router.post("/ask-jiji", response_model=AskJijiResponse)
async def ask_jiji(
    request: AskJijiRequest,
    user: Annotated[object, Depends(verify_token)]
):
    query_text = request.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    answer = generate_answer(query_text)

    resources = search_resources(query_text)
    
    try:
        supabase = get_supabase_admin()
        # Resources IDs for logging
        resource_ids = [r.id for r in resources]
        
        supabase.table("queries").insert({
            "user_id": user.id,
            "query_text": query_text,
            "matched_resource_ids": resource_ids
        }).execute()
    except Exception as e:

        print(f"Failed to log query: {e}")

    return AskJijiResponse(
        answer=answer,
        resources=resources
    )
