from typing import List
from app.models.schemas import Resource
from app.services.supabase_client import get_supabase_admin

import re

def clean_query(query: str) -> str:
    """Strip common natural language prefixes to isolate the key search term."""
    q = query.lower().strip()
    # Remove trailing punctuation
    q = q.rstrip("?.!")
    
    # Common prefixes to remove
    prefixes = [
        r"tell me about",
        r"what is",
        r"search for",
        r"find me",
        r"show me",
        r"give me",
        r"i want to learn about",
        r"can you tell me about",
        r"how does",
        r"do you have info on",
        r"inform me on",
        r"all about",
        r"learn about",
    ]
    
    for p in prefixes:
        new_q = re.sub(rf"^{p}\s*", "", q, flags=re.IGNORECASE)
        if new_q != q:
            return new_q.strip()
    
    return q

def search_resources(query: str, limit: int = 5) -> List[Resource]:
    supabase = get_supabase_admin()
    
    # Clean the query for natural language handling
    cleaned_query = clean_query(query)
    filter_pattern = f"%{cleaned_query}%"
    
    # Selecting columns explicitly
    response = supabase.table("resources") \
        .select("*") \
        .or_(f"title.ilike.{filter_pattern},description.ilike.{filter_pattern}") \
        .limit(limit) \
        .execute()
    
    data = response.data
    
    results: List[Resource] = []
    
    for item in data:
        storage_path = item.get("storage_path", "").strip()
        
        signed_url = ""
        if storage_path:
            try:
                # Create a signed URL valid for 1 hour (3600 seconds)
                res = supabase.storage.from_("learning-content").create_signed_url(storage_path, 3600)
                # Handle different response types from Supabase client
                if isinstance(res, dict):
                    signed_url = res.get("signedURL", "")
                else:
                    signed_url = getattr(res, "signedURL", "") or str(res)
            except Exception as e:
                # Log the error
                print(f"DEBUG: Failed to sign URL for: '{storage_path}'")
                print(f"DEBUG: Error details: {e}")
                
                # DIAGNOSTIC: List files in the folder to see what's actually there
                try:
                    folder = "/".join(storage_path.split("/")[:-1]) if "/" in storage_path else ""
                    files = supabase.storage.from_("learning-content").list(folder)
                    print(f"DEBUG: Files found in folder '{folder}': {[f['name'] for f in files]}")
                except Exception as list_e:
                    print(f"DEBUG: Could not list files: {list_e}")
                
                # We return an empty string or a placeholder if the file is missing in storage
                signed_url = "#" 


        results.append(Resource(
            id=item["id"],
            title=item["title"],
            description=item.get("description"),
            type=item["type"],
            url=signed_url
        ))
        
    return results
