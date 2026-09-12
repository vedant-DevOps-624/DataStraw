from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from typing import Optional

from data.database import SessionLocal
from data import models, schemas
from services import ai_service

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_ticket_id(db: Session) -> str:
    last_ticket = db.query(models.Ticket).order_by(models.Ticket.id.desc()).first()
    if last_ticket:
        last_id_num = int(last_ticket.ticket_id.split("-")[-1])
        next_num = last_id_num + 1
    else:
        next_num = 1
    return f"TKT-{next_num:03d}"


@router.post("/", response_model=schemas.TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: schemas.TicketCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id(db)
    ticket = models.Ticket(
        ticket_id=ticket_id,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        subject=payload.subject,
        description=payload.description,
        priority=payload.priority,
        status="Open",
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/", response_model=list[schemas.TicketListResponse])
def list_tickets(
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    sort: Optional[str] = "newest",
    db: Session = Depends(get_db),
):
    query = db.query(models.Ticket)

    if status:
        query = query.filter(models.Ticket.status == status)

    if priority:
        query = query.filter(models.Ticket.priority == priority)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Ticket.customer_name.ilike(search_term),
                models.Ticket.ticket_id.ilike(search_term),
                models.Ticket.customer_email.ilike(search_term),
                models.Ticket.subject.ilike(search_term),
                models.Ticket.description.ilike(search_term),
            )
        )

    if sort == "oldest":
        query = query.order_by(models.Ticket.created_at.asc())
    else:
        query = query.order_by(models.Ticket.created_at.desc())

    tickets = query.all()
    return tickets


@router.get("/{ticket_id}", response_model=schemas.TicketDetailResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=schemas.TicketDetailResponse)
def update_ticket(
    ticket_id: str,
    payload: schemas.TicketUpdateRequest,
    db: Session = Depends(get_db),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if payload.status is None and payload.note is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of status or note must be provided",
        )

    if payload.status is not None:
        if payload.status not in ("Open", "In Progress", "Closed"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Use Open, In Progress, or Closed.",
            )
        ticket.status = payload.status

    if payload.note is not None:
        note = models.Note(ticket_id=ticket.ticket_id, note_text=payload.note)
        db.add(note)

    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/ai-assist", response_model=schemas.AIAssistResponse)
def ai_assist(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    try:
        result = ai_service.generate_ticket_assistance(ticket, ticket.notes)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service failed. Please try again later.",
        ) from exc

    return schemas.AIAssistResponse(**result)


@router.delete("/{ticket_id}", response_model=schemas.TicketDeleteResponse)
def delete_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if ticket.status != "Closed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only tickets with status 'Closed' can be deleted.",
        )

    db.delete(ticket)
    db.commit()

    return schemas.TicketDeleteResponse(message="Ticket deleted successfully", ticket_id=ticket.ticket_id)

