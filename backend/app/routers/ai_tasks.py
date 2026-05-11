from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.tools import generate_daily_briefing
from app.schemas import BriefingResponse

router = APIRouter(prefix="/api/ai/tasks", tags=["ai"])

_briefing_cache: dict = {}


@router.post("/generate", response_model=BriefingResponse)
def generate_tasks(db: Session = Depends(get_db)):
    import google.generativeai as genai
    from app.config import settings
    from datetime import date

    today = str(date.today())
    if _briefing_cache.get("date") == today:
        return _briefing_cache["result"]

    data = generate_daily_briefing(db)

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""
Aşağıdaki işletme verisine göre bugünkü operasyon brifingi yaz.
Türkçe, madde madde, yönetici için kısa ve net olsun.
Veri: {data}
"""
    response = model.generate_content(prompt)
    briefing_text = response.candidates[0].content.parts[0].text

    result = BriefingResponse(briefing=briefing_text, data=data)
    _briefing_cache["date"] = today
    _briefing_cache["result"] = result
    return result
