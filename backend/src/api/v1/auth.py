from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from src.services.auth_service import AuthService
from src.utils.decorators import validate_json, log_api_calls, handle_db_errors
from src.utils.validators import user_registration_schema, user_login_schema
import logging

logger = logging.getLogger(__name__)

# Create auth blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
@log_api_calls
@handle_db_errors
@validate_json(user_registration_schema)
def register(validated_data):
    """
    Register a new user.
    
    Body:
        email: User email
        username: User username  
        password: User password
        first_name: User first name
        last_name: User last name
        
    Returns:
        201: User created successfully
        400: Validation error
        409: User already exists
    """
    try:
        result = AuthService.register_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        return jsonify({
            'message': 'User registered successfully',
            'user': result['user'],
            'access_token': result['access_token'],
            'refresh_token': result['refresh_token']
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 409


@auth_bp.route('/login', methods=['POST'])
@log_api_calls
@handle_db_errors
@validate_json(user_login_schema)
def login(validated_data):
    """
    Authenticate user login.
    
    Body:
        email: User email
        password: User password
        
    Returns:
        200: Login successful
        401: Invalid credentials
    """
    try:
        result = AuthService.login_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        return jsonify({
            'message': 'Login successful',
            'user': result['user'],
            'access_token': result['access_token'],
            'refresh_token': result['refresh_token']
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 401


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@log_api_calls
def refresh():
    """
    Refresh access token.
    
    Headers:
        Authorization: Bearer <refresh_token>
        
    Returns:
        200: New access token
        401: Invalid refresh token
    """
    try:
        current_user_id = get_jwt_identity()
        result = AuthService.refresh_token(current_user_id)
        
        return jsonify({
            'message': 'Token refreshed successfully',
            'access_token': result['access_token']
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 401


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
@log_api_calls
def get_current_user():
    """
    Get current user information.
    
    Headers:
        Authorization: Bearer <access_token>
        
    Returns:
        200: User information
        401: Invalid token
        404: User not found
    """
    try:
        current_user_id = get_jwt_identity()
        user = AuthService.get_user_by_id(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
@log_api_calls
def logout():
    """
    Logout user (client-side token invalidation).
    
    Headers:
        Authorization: Bearer <access_token>
        
    Returns:
        200: Logout successful
    """
    return jsonify({
        'message': 'Logout successful. Please remove token from client.'
    }), 200
