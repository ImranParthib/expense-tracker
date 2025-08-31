from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
import logging

logger = logging.getLogger(__name__)


def validate_json(schema):
    """Decorator to validate JSON input using Marshmallow schema."""
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Check if request has JSON
                if not request.is_json:
                    return jsonify({
                        'error': 'Content-Type must be application/json'
                    }), 400
                
                # Get JSON data
                json_data = request.get_json()
                if not json_data:
                    return jsonify({
                        'error': 'No JSON data provided'
                    }), 400
                
                # Validate using schema
                validated_data = schema.load(json_data)
                
                # Add validated data to kwargs
                kwargs['validated_data'] = validated_data
                
                return f(*args, **kwargs)
                
            except ValidationError as err:
                logger.warning(f"Validation error: {err.messages}")
                return jsonify({
                    'error': 'Validation failed',
                    'details': err.messages
                }), 400
            except Exception as err:
                logger.error(f"Unexpected error in validation: {str(err)}")
                return jsonify({
                    'error': 'Internal server error'
                }), 500
        
        return decorated_function
    return decorator


def validate_query_params(schema):
    """Decorator to validate query parameters using Marshmallow schema."""
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Validate query parameters
                validated_params = schema.load(request.args)
                
                # Add validated params to kwargs
                kwargs['query_params'] = validated_params
                
                return f(*args, **kwargs)
                
            except ValidationError as err:
                logger.warning(f"Query parameter validation error: {err.messages}")
                return jsonify({
                    'error': 'Invalid query parameters',
                    'details': err.messages
                }), 400
            except Exception as err:
                logger.error(f"Unexpected error in query validation: {str(err)}")
                return jsonify({
                    'error': 'Internal server error'
                }), 500
        
        return decorated_function
    return decorator


def auth_required(f):
    """Enhanced authentication decorator."""
    
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            if not current_user_id:
                return jsonify({
                    'error': 'Invalid authentication token'
                }), 401
            
            # Convert string identity back to int
            kwargs['current_user_id'] = int(current_user_id)
            
            return f(*args, **kwargs)
            
        except Exception as err:
            logger.error(f"Authentication error: {str(err)}")
            return jsonify({
                'error': 'Authentication failed'
            }), 401
    
    return decorated_function


def handle_db_errors(f):
    """Decorator to handle database errors gracefully."""
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as err:
            logger.error(f"Database error in {f.__name__}: {str(err)}")
            
            # Rollback any pending transactions
            from src.config.database import db
            db.session.rollback()
            
            # Return appropriate error
            if 'duplicate key' in str(err).lower() or 'unique constraint' in str(err).lower():
                return jsonify({
                    'error': 'Resource already exists'
                }), 409
            elif 'foreign key' in str(err).lower():
                return jsonify({
                    'error': 'Referenced resource not found'
                }), 400
            else:
                return jsonify({
                    'error': 'Database operation failed'
                }), 500
    
    return decorated_function


def log_api_calls(f):
    """Decorator to log API calls for monitoring."""
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        logger.info(f"API call: {request.method} {request.path} from {request.remote_addr}")
        
        try:
            result = f(*args, **kwargs)
            logger.info(f"API call completed successfully: {request.method} {request.path}")
            return result
        except Exception as err:
            logger.error(f"API call failed: {request.method} {request.path} - {str(err)}")
            raise
    
    return decorated_function
