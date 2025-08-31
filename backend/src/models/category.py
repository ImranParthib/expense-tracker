from datetime import datetime
from src.config.database import db


class Category(db.Model):
    """Category model for organizing expenses."""
    
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    color = db.Column(db.String(7), default='#6c757d')  # Hex color code
    icon = db.Column(db.String(50), default='📁')  # Emoji or icon class
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    expenses = db.relationship('Expense', backref='category', lazy=True, cascade='all, delete-orphan')
    
    # Constraints
    __table_args__ = (
        db.UniqueConstraint('user_id', 'name', name='unique_user_category'),
    )
    
    def __init__(self, name, user_id, description=None, color='#6c757d', icon='📁'):
        self.name = name
        self.user_id = user_id
        self.description = description
        self.color = color
        self.icon = icon
    
    @property
    def expense_count(self):
        """Get count of expenses in this category."""
        return len(self.expenses)
    
    @property
    def total_amount(self):
        """Get total amount of expenses in this category."""
        return sum(expense.amount for expense in self.expenses)
    
    def to_dict(self, include_stats=False):
        """Convert category to dictionary."""
        result = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_stats:
            result.update({
                'expense_count': self.expense_count,
                'total_amount': float(self.total_amount)
            })
        
        return result
    
    def __repr__(self):
        return f'<Category {self.name}>'
