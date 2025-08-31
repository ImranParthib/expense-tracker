from src.models.expense import Expense
from src.models.category import Category
from src.config.database import db
from src.utils.helpers import paginate_query, build_expense_filters, generate_expense_summary
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class ExpenseService:
    """Service for managing expenses."""
    
    @staticmethod
    def create_expense(user_id, amount, description, date, category_id, 
                      notes=None, receipt_url=None, tags=None, is_recurring=False):
        """
        Create a new expense.
        
        Args:
            user_id: User ID
            amount: Expense amount
            description: Expense description
            date: Expense date
            category_id: Category ID
            notes: Additional notes (optional)
            receipt_url: Receipt URL (optional)
            tags: List of tags (optional)
            is_recurring: Whether expense is recurring
            
        Returns:
            Expense: Created expense
            
        Raises:
            ValueError: If category not found or belongs to different user
        """
        # Verify category exists and belongs to user
        category = Category.query.filter_by(
            id=category_id,
            user_id=user_id,
            is_active=True
        ).first()
        
        if not category:
            raise ValueError('Category not found or access denied')
        
        # Create expense
        expense = Expense(
            amount=amount,
            description=description,
            date=date,
            user_id=user_id,
            category_id=category_id,
            notes=notes,
            receipt_url=receipt_url,
            is_recurring=is_recurring
        )
        
        # Set tags if provided
        if tags:
            expense.set_tags(tags)
        
        try:
            db.session.add(expense)
            db.session.commit()
            
            logger.info(f"Expense created: {description} (${amount}) for user {user_id}")
            return expense
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to create expense: {str(e)}")
            raise
    
    @staticmethod
    def get_user_expenses(user_id, filters=None, page=1, per_page=20):
        """
        Get paginated expenses for user with optional filters.
        
        Args:
            user_id: User ID
            filters: Dict of filter parameters
            page: Page number
            per_page: Items per page
            
        Returns:
            dict: Paginated expenses with metadata
        """
        # Base query
        query = Expense.query.filter_by(user_id=user_id).join(Category)
        
        # Apply filters if provided
        if filters:
            query = build_expense_filters(query, filters)
        else:
            # Default sorting by date descending
            query = query.order_by(Expense.date.desc())
        
        # Paginate results
        return paginate_query(query, page, per_page)
    
    @staticmethod
    def get_expense_by_id(expense_id, user_id):
        """
        Get expense by ID for specific user.
        
        Args:
            expense_id: Expense ID
            user_id: User ID
            
        Returns:
            Expense: Expense object or None
        """
        return Expense.query.filter_by(
            id=expense_id,
            user_id=user_id
        ).first()
    
    @staticmethod
    def update_expense(expense_id, user_id, **kwargs):
        """
        Update expense.
        
        Args:
            expense_id: Expense ID
            user_id: User ID
            **kwargs: Fields to update
            
        Returns:
            Expense: Updated expense
            
        Raises:
            ValueError: If expense not found or category access denied
        """
        expense = ExpenseService.get_expense_by_id(expense_id, user_id)
        if not expense:
            raise ValueError('Expense not found')
        
        # If category is being updated, verify it belongs to user
        if 'category_id' in kwargs:
            category = Category.query.filter_by(
                id=kwargs['category_id'],
                user_id=user_id,
                is_active=True
            ).first()
            
            if not category:
                raise ValueError('Category not found or access denied')
        
        try:
            # Handle special fields
            if 'tags' in kwargs:
                expense.set_tags(kwargs.pop('tags'))
            
            # Update other fields
            for field, value in kwargs.items():
                if hasattr(expense, field):
                    if field == 'amount':
                        setattr(expense, field, Decimal(str(value)))
                    else:
                        setattr(expense, field, value)
            
            db.session.commit()
            
            logger.info(f"Expense updated: {expense.description} for user {user_id}")
            return expense
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to update expense: {str(e)}")
            raise
    
    @staticmethod
    def delete_expense(expense_id, user_id):
        """
        Delete expense.
        
        Args:
            expense_id: Expense ID
            user_id: User ID
            
        Returns:
            bool: True if deleted successfully
            
        Raises:
            ValueError: If expense not found
        """
        expense = ExpenseService.get_expense_by_id(expense_id, user_id)
        if not expense:
            raise ValueError('Expense not found')
        
        try:
            db.session.delete(expense)
            db.session.commit()
            
            logger.info(f"Expense deleted: {expense.description} for user {user_id}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to delete expense: {str(e)}")
            raise
    
    @staticmethod
    def get_expense_summary(user_id, filters=None):
        """
        Get expense summary statistics.
        
        Args:
            user_id: User ID
            filters: Dict of filter parameters
            
        Returns:
            dict: Summary statistics
        """
        # Base query
        query = Expense.query.filter_by(user_id=user_id).join(Category)
        
        # Apply filters if provided
        if filters:
            query = build_expense_filters(query, filters)
        
        # Get all expenses for summary
        expenses = query.all()
        
        return generate_expense_summary(expenses)
    
    @staticmethod
    def get_category_expenses(user_id, category_id, page=1, per_page=20):
        """
        Get expenses for a specific category.
        
        Args:
            user_id: User ID
            category_id: Category ID
            page: Page number
            per_page: Items per page
            
        Returns:
            dict: Paginated expenses
        """
        # Verify category belongs to user
        category = Category.query.filter_by(
            id=category_id,
            user_id=user_id,
            is_active=True
        ).first()
        
        if not category:
            raise ValueError('Category not found or access denied')
        
        # Get expenses for category
        query = Expense.query.filter_by(
            user_id=user_id,
            category_id=category_id
        ).order_by(Expense.date.desc())
        
        return paginate_query(query, page, per_page)
