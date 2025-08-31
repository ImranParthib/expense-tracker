from datetime import datetime, date as date_type
from decimal import Decimal
from src.config.database import db


class Expense(db.Model):
    """Expense model for tracking financial transactions."""
    
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)  # Using Decimal for precision
    description = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)  # Additional notes
    receipt_url = db.Column(db.String(500))  # URL to receipt image
    tags = db.Column(db.String(200))  # Comma-separated tags
    is_recurring = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    
    # Indexes for better query performance
    __table_args__ = (
        db.Index('idx_user_date', 'user_id', 'date'),
        db.Index('idx_user_category', 'user_id', 'category_id'),
    )
    
    def __init__(self, amount, description, date, user_id, category_id, 
                 notes=None, receipt_url=None, tags=None, is_recurring=False):
        self.amount = Decimal(str(amount))  # Ensure decimal precision
        self.description = description
        self.date = date if isinstance(date, date_type) else datetime.strptime(date, '%Y-%m-%d').date()
        self.user_id = user_id
        self.category_id = category_id
        self.notes = notes
        self.receipt_url = receipt_url
        self.tags = tags
        self.is_recurring = is_recurring
    
    @property
    def formatted_amount(self):
        """Get formatted amount as string."""
        return f"${self.amount:.2f}"
    
    @property
    def tag_list(self):
        """Get tags as a list."""
        return [tag.strip() for tag in (self.tags or '').split(',')] if self.tags else []
    
    def set_tags(self, tag_list):
        """Set tags from a list."""
        self.tags = ', '.join(tag_list) if tag_list else None
    
    def to_dict(self, include_relations=True):
        """Convert expense to dictionary."""
        result = {
            'id': self.id,
            'amount': float(self.amount),
            'formatted_amount': self.formatted_amount,
            'description': self.description,
            'date': self.date.isoformat(),
            'notes': self.notes,
            'receipt_url': self.receipt_url,
            'tags': self.tag_list,
            'is_recurring': self.is_recurring,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_relations:
            result.update({
                'category': self.category.to_dict() if self.category else None,
                'user_id': self.user_id
            })
        
        return result
    
    def __repr__(self):
        return f'<Expense {self.description}: ${self.amount}>'
