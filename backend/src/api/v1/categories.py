from flask import Blueprint, request, jsonify
from src.services.category_service import CategoryService
from src.utils.decorators import validate_json, auth_required, log_api_calls, handle_db_errors
from src.utils.validators import category_schema
import logging

logger = logging.getLogger(__name__)

# Create categories blueprint
categories_bp = Blueprint('categories', __name__, url_prefix='/categories')


@categories_bp.route('', methods=['POST'])
@auth_required
@log_api_calls
@handle_db_errors
@validate_json(category_schema)
def create_category(current_user_id, validated_data):
    """
    Create a new category.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Body:
        name: Category name
        description: Category description (optional)
        color: Category color hex code (optional)
        icon: Category icon (optional)
        
    Returns:
        201: Category created successfully
        400: Validation error
        409: Category name already exists
    """
    try:
        category = CategoryService.create_category(
            user_id=current_user_id,
            name=validated_data['name'],
            description=validated_data.get('description'),
            color=validated_data.get('color', '#6c757d'),
            icon=validated_data.get('icon', '📁')
        )
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict(include_stats=True)
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 409


@categories_bp.route('', methods=['GET'])
@auth_required
@log_api_calls
def get_categories(current_user_id):
    """
    Get all categories for current user.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Query Parameters:
        include_stats: Include expense statistics (default: false)
        
    Returns:
        200: List of categories
    """
    include_stats = request.args.get('include_stats', 'false').lower() == 'true'
    
    categories = CategoryService.get_user_categories(
        user_id=current_user_id,
        include_stats=include_stats
    )
    
    return jsonify({
        'categories': categories,
        'total': len(categories)
    }), 200


@categories_bp.route('/<int:category_id>', methods=['GET'])
@auth_required
@log_api_calls
def get_category(current_user_id, category_id):
    """
    Get category by ID.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Parameters:
        category_id: Category ID
        
    Returns:
        200: Category details
        404: Category not found
    """
    category = CategoryService.get_category_by_id(category_id, current_user_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    return jsonify({
        'category': category.to_dict(include_stats=True)
    }), 200


@categories_bp.route('/<int:category_id>', methods=['PUT'])
@auth_required
@log_api_calls
@handle_db_errors
@validate_json(category_schema)
def update_category(current_user_id, category_id, validated_data):
    """
    Update category.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Parameters:
        category_id: Category ID
        
    Body:
        name: Category name (optional)
        description: Category description (optional)
        color: Category color hex code (optional)
        icon: Category icon (optional)
        
    Returns:
        200: Category updated successfully
        404: Category not found
        409: Category name already exists
    """
    try:
        category = CategoryService.update_category(
            category_id=category_id,
            user_id=current_user_id,
            **validated_data
        )
        
        return jsonify({
            'message': 'Category updated successfully',
            'category': category.to_dict(include_stats=True)
        }), 200
        
    except ValueError as e:
        error_msg = str(e)
        if 'not found' in error_msg:
            return jsonify({'error': error_msg}), 404
        else:
            return jsonify({'error': error_msg}), 409


@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@auth_required
@log_api_calls
@handle_db_errors
def delete_category(current_user_id, category_id):
    """
    Delete category.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Parameters:
        category_id: Category ID
        
    Returns:
        200: Category deleted successfully
        404: Category not found
        409: Category has expenses
    """
    try:
        CategoryService.delete_category(category_id, current_user_id)
        
        return jsonify({
            'message': 'Category deleted successfully'
        }), 200
        
    except ValueError as e:
        error_msg = str(e)
        if 'not found' in error_msg:
            return jsonify({'error': error_msg}), 404
        elif 'existing expenses' in error_msg:
            return jsonify({'error': error_msg}), 409
        else:
            return jsonify({'error': error_msg}), 400
