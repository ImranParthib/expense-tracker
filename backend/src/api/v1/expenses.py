from flask import Blueprint, request, jsonify
from src.services.expense_service import ExpenseService
from src.utils.decorators import (
    validate_json, 
    validate_query_params, 
    auth_required, 
    log_api_calls, 
    handle_db_errors
)
from src.utils.validators import expense_schema, expense_query_schema
import logging

logger = logging.getLogger(__name__)

# Create expenses blueprint
expenses_bp = Blueprint('expenses', __name__, url_prefix='/expenses')


@expenses_bp.route('', methods=['POST'])
@auth_required
@log_api_calls
@handle_db_errors
# @validate_json(expense_schema)  # Temporarily disabled
def create_expense(current_user_id, validated_data=None):
    """
    Create a new expense.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Body:
        amount: Expense amount
        description: Expense description
        date: Expense date (YYYY-MM-DD)
        category_id: Category ID
        notes: Additional notes (optional)
        receipt_url: Receipt URL (optional)
        tags: List of tags (optional)
        is_recurring: Whether expense is recurring (optional)
        
    Returns:
        201: Expense created successfully
        400: Validation error
        404: Category not found
    """
    try:
        # Manual JSON parsing for debugging
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Manual validation for testing
        required_fields = ['amount', 'description', 'date', 'category_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        expense = ExpenseService.create_expense(
            user_id=current_user_id,
            amount=data['amount'],
            description=data['description'],
            date=data['date'],
            category_id=data['category_id'],
            notes=data.get('notes'),
            receipt_url=data.get('receipt_url'),
            tags=data.get('tags', []),
            is_recurring=data.get('is_recurring', False)
        )
        
        return jsonify({
            'message': 'Expense created successfully',
            'expense': expense.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404


@expenses_bp.route('', methods=['GET'])
@auth_required
@log_api_calls
@validate_query_params(expense_query_schema)
def get_expenses(current_user_id, query_params):
    """
    Get expenses for current user with filtering and pagination.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Query Parameters:
        page: Page number (default: 1)
        per_page: Items per page (default: 20, max: 100)
        category_id: Filter by category ID
        start_date: Filter by start date (YYYY-MM-DD)
        end_date: Filter by end date (YYYY-MM-DD)
        search: Search in description, notes, and category name
        sort_by: Sort field (date, amount, description, created_at)
        sort_order: Sort order (asc, desc)
        
    Returns:
        200: Paginated list of expenses
    """
    # Extract pagination parameters
    page = query_params.pop('page', 1)
    per_page = query_params.pop('per_page', 20)
    
    # Get expenses with filters
    result = ExpenseService.get_user_expenses(
        user_id=current_user_id,
        filters=query_params,
        page=page,
        per_page=per_page
    )
    
    return jsonify(result), 200


@expenses_bp.route('/<int:expense_id>', methods=['GET'])
@auth_required
@log_api_calls
def get_expense(current_user_id, expense_id):
    """
    Get expense by ID.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Parameters:
        expense_id: Expense ID
        
    Returns:
        200: Expense details
        404: Expense not found
    """
    expense = ExpenseService.get_expense_by_id(expense_id, current_user_id)
    
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404
    
    return jsonify({
        'expense': expense.to_dict()
    }), 200


@expenses_bp.route('/<int:expense_id>', methods=['PUT'])
@auth_required
@log_api_calls
@handle_db_errors
@validate_json(expense_schema)
def update_expense(current_user_id, expense_id, validated_data):
    """
    Update expense.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Parameters:
        expense_id: Expense ID
        
    Body:
        amount: Expense amount (optional)
        description: Expense description (optional)
        date: Expense date (optional)
        category_id: Category ID (optional)
        notes: Additional notes (optional)
        receipt_url: Receipt URL (optional)
        tags: List of tags (optional)
        is_recurring: Whether expense is recurring (optional)
        
    Returns:
        200: Expense updated successfully
        404: Expense or category not found
    """
    try:
        expense = ExpenseService.update_expense(
            expense_id=expense_id,
            user_id=current_user_id,
            **validated_data
        )
        
        return jsonify({
            'message': 'Expense updated successfully',
            'expense': expense.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404


@expenses_bp.route('/<int:expense_id>', methods=['DELETE'])
@auth_required
@log_api_calls
@handle_db_errors
def delete_expense(current_user_id, expense_id):
    """
    Delete expense.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Parameters:
        expense_id: Expense ID
        
    Returns:
        200: Expense deleted successfully
        404: Expense not found
    """
    try:
        ExpenseService.delete_expense(expense_id, current_user_id)
        
        return jsonify({
            'message': 'Expense deleted successfully'
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404


@expenses_bp.route('/summary', methods=['GET'])
@auth_required
@log_api_calls
@validate_query_params(expense_query_schema)
def get_expense_summary(current_user_id, query_params):
    """
    Get expense summary statistics.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Query Parameters:
        category_id: Filter by category ID
        start_date: Filter by start date (YYYY-MM-DD)
        end_date: Filter by end date (YYYY-MM-DD)
        search: Search in description, notes, and category name
        
    Returns:
        200: Expense summary statistics
    """
    # Remove pagination parameters for summary
    query_params.pop('page', None)
    query_params.pop('per_page', None)
    query_params.pop('sort_by', None)
    query_params.pop('sort_order', None)
    
    summary = ExpenseService.get_expense_summary(
        user_id=current_user_id,
        filters=query_params if any(query_params.values()) else None
    )
    
    return jsonify({
        'summary': summary
    }), 200


@expenses_bp.route('/categories/<int:category_id>', methods=['GET'])
@auth_required
@log_api_calls
def get_category_expenses(current_user_id, category_id):
    """
    Get expenses for a specific category.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Parameters:
        category_id: Category ID
        
    Query Parameters:
        page: Page number (default: 1)
        per_page: Items per page (default: 20)
        
    Returns:
        200: Paginated list of expenses for category
        404: Category not found
    """
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        result = ExpenseService.get_category_expenses(
            user_id=current_user_id,
            category_id=category_id,
            page=page,
            per_page=per_page
        )
        
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
