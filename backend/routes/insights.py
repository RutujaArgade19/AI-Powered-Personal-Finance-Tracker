from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from collections import defaultdict
from datetime import datetime, timedelta
from database import get_db
from models.transaction import Transaction
from models.user import User
from middleware.auth import get_current_user
from config import settings
import json

router = APIRouter()

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return spending summary: totals, by category, trends."""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.date >= month_start,
        )
        .all()
    )

    total_spent = sum(abs(t.amount) for t in txs if not t.is_income)
    total_income = sum(t.amount for t in txs if t.is_income)

    by_category = defaultdict(float)
    for t in txs:
        if not t.is_income:
            by_category[t.category] += abs(t.amount)

    # Last 6 months trend
    monthly = []
    for i in range(5, -1, -1):
        d = now - timedelta(days=30 * i)
        month_txs = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            extract("month", Transaction.date) == d.month,
            extract("year", Transaction.date) == d.year,
            Transaction.is_income == False,
        ).all()
        monthly.append({
            "month": d.strftime("%b %Y"),
            "total": round(sum(abs(t.amount) for t in month_txs), 2),
        })

    return {
        "current_month": {
            "total_spent": round(total_spent, 2),
            "total_income": round(total_income, 2),
            "net": round(total_income - total_spent, 2),
        },
        "by_category": dict(by_category),
        "monthly_trend": monthly,
        "anomaly_count": sum(1 for t in txs if t.is_anomaly),
    }

@router.get("/ai-summary")
async def get_ai_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a natural language spending summary using OpenAI."""
    summary = get_summary(db=db, current_user=current_user)

    if not settings.OPENAI_API_KEY:
        # Return a template-based summary if no API key
        return generate_template_summary(summary, current_user.full_name)

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        prompt = f"""
You are a friendly personal finance advisor. Analyze this spending data for {current_user.full_name} and provide a concise, helpful summary in 3-4 sentences. Be specific with numbers and give 1-2 actionable tips.

Data:
- This month spent: ${summary['current_month']['total_spent']}
- This month income: ${summary['current_month']['total_income']}
- Net savings: ${summary['current_month']['net']}
- Spending by category: {json.dumps(summary['by_category'])}
- Monthly trend (last 6 months): {json.dumps(summary['monthly_trend'])}
- Unusual transactions detected: {summary['anomaly_count']}

Write a personal, encouraging summary with insights and tips.
"""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        ai_text = response.choices[0].message.content

    except Exception as e:
        return generate_template_summary(summary, current_user.full_name)

    return {"summary": ai_text, "data": summary}

def generate_template_summary(summary: dict, name: str) -> dict:
    """Fallback template-based summary."""
    spent = summary["current_month"]["total_spent"]
    income = summary["current_month"]["total_income"]
    net = summary["current_month"]["net"]
    top_cat = max(summary["by_category"], key=summary["by_category"].get) if summary["by_category"] else "N/A"
    top_amt = summary["by_category"].get(top_cat, 0)

    direction = "saved" if net >= 0 else "overspent by"
    amount_str = f"${abs(net):.2f}"

    text = (
        f"Hi {name}! This month you've spent ${spent:.2f} against ${income:.2f} in income — "
        f"you've {direction} {amount_str}. "
        f"Your biggest spending category is {top_cat} at ${top_amt:.2f}. "
    )
    if summary["anomaly_count"] > 0:
        text += f"⚠️ {summary['anomaly_count']} unusual transaction(s) detected — worth reviewing! "
    if net < 0:
        text += f"Consider reducing {top_cat} spending to get back on track."
    else:
        text += "Great job staying within budget this month! 🎉"

    return {"summary": text, "data": summary}
