from datetime import datetime, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from data.database import SessionLocal
from data import models, schemas

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    total_tickets = db.query(models.Ticket).count()
    open_tickets = db.query(models.Ticket).filter(models.Ticket.status == "Open").count()
    in_progress_tickets = db.query(models.Ticket).filter(models.Ticket.status == "In Progress").count()
    closed_tickets = db.query(models.Ticket).filter(models.Ticket.status == "Closed").count()
    high_priority_tickets = db.query(models.Ticket).filter(models.Ticket.priority == "High").count()

    status_counts = (
        db.query(models.Ticket.status, func.count(models.Ticket.id))
        .group_by(models.Ticket.status)
        .all()
    )
    tickets_by_status = {status: count for status, count in status_counts}

    priority_counts = (
        db.query(models.Ticket.priority, func.count(models.Ticket.id))
        .group_by(models.Ticket.priority)
        .all()
    )
    tickets_by_priority = {priority: count for priority, count in priority_counts}

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_counts = (
        db.query(
            func.strftime("%Y-%m-%d", models.Ticket.created_at).label("date"),
            func.count(models.Ticket.id).label("count"),
        )
        .filter(models.Ticket.created_at >= thirty_days_ago)
        .group_by(func.strftime("%Y-%m-%d", models.Ticket.created_at))
        .order_by(func.strftime("%Y-%m-%d", models.Ticket.created_at))
        .all()
    )
    tickets_over_time = [{"date": date, "count": count} for date, count in daily_counts]

    recent_tickets = (
        db.query(models.Ticket)
        .order_by(models.Ticket.updated_at.desc())
        .limit(10)
        .all()
    )
    recent_activity = [
        {
            "ticket_id": ticket.ticket_id,
            "subject": ticket.subject,
            "priority": ticket.priority,
            "status": ticket.status,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
        }
        for ticket in recent_tickets
    ]

    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "closed_tickets": closed_tickets,
        "high_priority_tickets": high_priority_tickets,
        "tickets_by_status": tickets_by_status,
        "tickets_by_priority": tickets_by_priority,
        "tickets_over_time": tickets_over_time,
        "recent_activity": recent_activity,
    }
