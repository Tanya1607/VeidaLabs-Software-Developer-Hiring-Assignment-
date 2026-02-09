def generate_answer(query: str) -> str:
    # Deterministic mock answer
    # We could implement simple logic based on keywords
    query_lower = query.lower()
    
    if "photosynthesis" in query_lower:
        return "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the aid of chlorophyll."
    elif "gravity" in query_lower:
        return "Gravity is a fundamental interaction which causes mutual attraction between all things that have mass or energy."
    elif "math" in query_lower or "addition" in query_lower:
        return "Mathematics includes the study of such topics as quantity (number theory), structure (algebra), space (geometry), and change (analysis)."
    elif "history" in query_lower:
        return "History is the study of the past. Events occurring before the invention of writing systems are considered prehistory."
    else:
        return f"I couldn't find any specific resources about '{query}' in my library. Try searching for 'Gravity' or 'Photosynthesis' to see sample resources!"
