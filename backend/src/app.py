from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from src.config.settings import get_config
from src.config.database import init_db
from src.config.logging import setup_logging
from src.api import api_v1_blueprint
import os
import logging

logger = logging.getLogger(__name__)


def create_app(config_name=None):
    """
    Application factory pattern.
    
    Args:
        config_name: Configuration name (development, testing, production)
        
    Returns:
        Flask: Configured Flask application
    """
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    config_class = get_config()
    app.config.from_object(config_class)
    
    # Setup logging
    setup_logging(app)
    logger.info(f"Starting application in {config_name} mode")
    
    # Initialize extensions
    init_extensions(app)
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Health check endpoint
    register_health_check(app)
    
    logger.info("Application initialized successfully")
    return app


def init_extensions(app):
    """Initialize Flask extensions."""
    
    # CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # JWT
    jwt = JWTManager(app)
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        logger.error("Token expired")
        return jsonify({'error': 'Token has expired'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        logger.error(f"Invalid token error: {error}")
        return jsonify({'error': 'Invalid token'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        logger.error(f"Missing token error: {error}")
        return jsonify({'error': 'Authorization token required'}), 401


def register_blueprints(app):
    """Register application blueprints."""
    
    # Register API v1 blueprint
    app.register_blueprint(api_v1_blueprint)
    
    # Legacy endpoints for backward compatibility
    register_legacy_endpoints(app)


def register_legacy_endpoints(app):
    """Register legacy endpoints for backward compatibility."""
    from src.api.v1.categories import categories_bp as v1_categories
    from src.api.v1.expenses import expenses_bp as v1_expenses
    
    # Legacy category endpoints (without /api/v1 prefix)
    @app.route('/categories', methods=['GET', 'POST'])
    def legacy_categories():
        from flask import request
        if request.method == 'GET':
            return v1_categories.view_functions['get_categories']()
        else:
            return v1_categories.view_functions['create_category']()
    
    # Legacy expense endpoints (without /api/v1 prefix)
    @app.route('/expenses', methods=['GET', 'POST'])
    def legacy_expenses():
        from flask import request
        if request.method == 'GET':
            return v1_expenses.view_functions['get_expenses']()
        else:
            return v1_expenses.view_functions['create_expense']()


def register_error_handlers(app):
    """Register global error handlers."""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad request',
            'message': 'The request could not be understood by the server'
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication required'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'error': 'Forbidden',
            'message': 'Access denied'
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'error': 'Method not allowed',
            'message': 'The method is not allowed for this endpoint'
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500


def register_health_check(app):
    """Register health check endpoint."""
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint for monitoring."""
        try:
            # Check database connection
            from src.config.database import db
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            
            return jsonify({
                'status': 'healthy',
                'timestamp': '2025-09-01T00:00:00Z',
                'version': '1.0.0',
                'environment': app.config.get('ENV', 'unknown')
            }), 200
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return jsonify({
                'status': 'unhealthy',
                'error': 'Database connection failed'
            }), 503
    
    @app.route('/api/v1/health', methods=['GET'])
    def api_health_check():
        """API health check endpoint."""
        return health_check()
