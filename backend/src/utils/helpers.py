from datetime import datetime, date
from decimal import Decimal
from flask_sqlalchemy import BaseQuery
from src.config.database import db
import logging

logger = logging.getLogger(__name__)


def format_currency(amount, currency_symbol='$'):
    """
    Format amount as currency string.
    
    Args:
        amount: Decimal or float amount
        currency_symbol: Currency symbol
        
    Returns:
        str: Formatted currency string
    """
    if isinstance(amount, Decimal):
        return f"{currency_symbol}{amount:.2f}"
    return f"{currency_symbol}{float(amount):.2f}"


def parse_date(date_string):
    """
    Parse date string to date object.
    
    Args:
        date_string: Date string in YYYY-MM-DD format
        
    Returns:
        date: Date object
        
    Raises:
        ValueError: If date format is invalid
    """
    try:
        if isinstance(date_string, date):
            return date_string
        return datetime.strptime(date_string, '%Y-%m-%d').date()
    except ValueError:
        raise ValueError('Invalid date format. Use YYYY-MM-DD.')


def paginate_query(query: BaseQuery, page: int, per_page: int):
    """
    Paginate SQLAlchemy query.
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-based)
        per_page: Items per page
        
    Returns:
        dict: Paginated results with metadata
    """
    # Ensure page and per_page are valid
    page = max(1, page)
    per_page = min(max(1, per_page), 100)  # Cap at 100 items
    
    # Execute pagination
    paginated = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    # Convert items to dictionaries
    items = [item.to_dict() if hasattr(item, 'to_dict') else item for item in paginated.items]
    
    return {
        'items': items,
        'pagination': {
            'page': paginated.page,
            'per_page': paginated.per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_prev': paginated.has_prev,
            'has_next': paginated.has_next,
            'prev_num': paginated.prev_num,
            'next_num': paginated.next_num
        }
    }


def build_expense_filters(query, filters):
    """
    Build expense query filters.
    
    Args:
        query: Base SQLAlchemy query
        filters: Dict of filter parameters
        
    Returns:
        Query: Filtered query
    """
    from src.models.expense import Expense
    from src.models.category import Category
    
    # Category filter
    if filters.get('category_id'):
        query = query.filter(Expense.category_id == filters['category_id'])
    
    # Date range filters
    if filters.get('start_date'):
        start_date = parse_date(filters['start_date'])
        query = query.filter(Expense.date >= start_date)
    
    if filters.get('end_date'):
        end_date = parse_date(filters['end_date'])
        query = query.filter(Expense.date <= end_date)
    
    # Search filter (description and notes)
    if filters.get('search'):
        search_term = f"%{filters['search']}%"
        query = query.filter(
            db.or_(
                Expense.description.ilike(search_term),
                Expense.notes.ilike(search_term),
                Category.name.ilike(search_term)
            )
        )
    
    # Sorting
    sort_by = filters.get('sort_by', 'date')
    sort_order = filters.get('sort_order', 'desc')
    
    if sort_by == 'date':
        order_field = Expense.date
    elif sort_by == 'amount':
        order_field = Expense.amount
    elif sort_by == 'description':
        order_field = Expense.description
    elif sort_by == 'created_at':
        order_field = Expense.created_at
    else:
        order_field = Expense.date
    
    if sort_order == 'asc':
        query = query.order_by(order_field.asc())
    else:
        query = query.order_by(order_field.desc())
    
    return query


def generate_expense_summary(expenses):
    """
    Generate summary statistics for expenses.
    
    Args:
        expenses: List of expense objects
        
    Returns:
        dict: Summary statistics
    """
    if not expenses:
        return {
            'total_amount': 0.0,
            'total_count': 0,
            'average_amount': 0.0,
            'categories': {},
            'monthly_totals': {},
            'date_range': None
        }
    
    total_amount = sum(expense.amount for expense in expenses)
    total_count = len(expenses)
    average_amount = total_amount / total_count if total_count > 0 else 0
    
    # Category breakdown
    categories = {}
    for expense in expenses:
        category_name = expense.category.name if expense.category else 'Uncategorized'
        if category_name not in categories:
            categories[category_name] = {
                'count': 0,
                'total': Decimal('0.00'),
                'percentage': 0.0
            }
        categories[category_name]['count'] += 1
        categories[category_name]['total'] += expense.amount
    
    # Calculate percentages
    for category_data in categories.values():
        category_data['percentage'] = float(
            (category_data['total'] / total_amount * 100) if total_amount > 0 else 0
        )
        category_data['total'] = float(category_data['total'])
    
    # Monthly totals
    monthly_totals = {}
    for expense in expenses:
        month_key = expense.date.strftime('%Y-%m')
        if month_key not in monthly_totals:
            monthly_totals[month_key] = Decimal('0.00')
        monthly_totals[month_key] += expense.amount
    
    # Convert to float for JSON serialization
    monthly_totals = {k: float(v) for k, v in monthly_totals.items()}
    
    # Date range
    dates = [expense.date for expense in expenses]
    date_range = {
        'start': min(dates).isoformat(),
        'end': max(dates).isoformat()
    } if dates else None
    
    return {
        'total_amount': float(total_amount),
        'total_count': total_count,
        'average_amount': float(average_amount),
        'categories': categories,
        'monthly_totals': monthly_totals,
        'date_range': date_range
    }


def parse_date(date_string):
    """Parse date string to date object."""
    if isinstance(date_string, date):
        return date_string
    
    try:
        return datetime.strptime(date_string, '%Y-%m-%d').date()
    except ValueError:
        raise ValueError('Date must be in YYYY-MM-DD format')


def sanitize_filename(filename):
    """Sanitize filename for safe storage."""
    # Remove non-alphanumeric characters except dots, hyphens, and underscores
    sanitized = re.sub(r'[^\w\.-]', '_', filename)
    return sanitized


def paginate_query(query, page, per_page, max_per_page=100):
    """
    Paginate a SQLAlchemy query.
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-based)
        per_page: Items per page
        max_per_page: Maximum items per page
    
    Returns:
        dict: Pagination result with items and metadata
    """
    # Validate parameters
    page = max(1, page)
    per_page = min(per_page, max_per_page)
    
    # Execute pagination
    paginated = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return {
        'items': [item.to_dict() for item in paginated.items],
        'pagination': {
            'current_page': paginated.page,
            'total_pages': paginated.pages,
            'total_items': paginated.total,
            'per_page': paginated.per_page,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev,
            'next_page': paginated.next_num if paginated.has_next else None,
            'prev_page': paginated.prev_num if paginated.has_prev else None
        }
    }


def generate_expense_summary(expenses):
    """
    Generate summary statistics for expenses.
    
    Args:
        expenses: List of expense objects
    
    Returns:
        dict: Summary statistics
    """
    if not expenses:
        return {
            'total_amount': 0,
            'total_count': 0,
            'average_amount': 0,
            'categories': {}
        }
    
    total_amount = sum(expense.amount for expense in expenses)
    total_count = len(expenses)
    average_amount = total_amount / total_count if total_count > 0 else 0
    
    # Category breakdown
    categories = {}
    for expense in expenses:
        category_name = expense.category.name if expense.category else 'Uncategorized'
        if category_name not in categories:
            categories[category_name] = {
                'count': 0,
                'total_amount': 0
            }
        categories[category_name]['count'] += 1
        categories[category_name]['total_amount'] += float(expense.amount)
    
    return {
        'total_amount': float(total_amount),
        'total_count': total_count,
        'average_amount': float(average_amount),
        'categories': categories
    }


def build_expense_filters(query, filters):
    """
    Build expense query filters.
    
    Args:
        query: Base SQLAlchemy query
        filters: Dict of filter parameters
    
    Returns:
        SQLAlchemy query with filters applied
    """
    from src.models.expense import Expense
    
    # Date range filter
    if filters.get('start_date'):
        query = query.filter(Expense.date >= filters['start_date'])
    
    if filters.get('end_date'):
        query = query.filter(Expense.date <= filters['end_date'])
    
    # Category filter
    if filters.get('category_id'):
        query = query.filter(Expense.category_id == filters['category_id'])
    
    # Search filter (description and notes)
    if filters.get('search'):
        search_term = f"%{filters['search']}%"
        query = query.filter(
            db.or_(
                Expense.description.ilike(search_term),
                Expense.notes.ilike(search_term)
            )
        )
    
    # Sorting
    sort_by = filters.get('sort_by', 'date')
    sort_order = filters.get('sort_order', 'desc')
    
    sort_column = getattr(Expense, sort_by, Expense.date)
    if sort_order == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    return query
