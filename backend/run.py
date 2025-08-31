#!/usr/bin/env python3
"""
Expense Tracker API Server
Senior-level Flask application with proper architecture
"""

import os
import sys
import time
import psycopg2
from psycopg2 import OperationalError
from src.app import create_app
from src.config.database import db
import logging

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

logger = logging.getLogger(__name__)


def wait_for_database(max_retries=30, retry_delay=2):
    """
    Wait for database to become available.
    
    Args:
        max_retries: Maximum number of retry attempts
        retry_delay: Delay between retries in seconds
        
    Returns:
        bool: True if database is available, False otherwise
    """
    db_config = {
        'host': os.environ.get('DB_HOST', 'db'),
        'database': os.environ.get('DB_NAME', 'expense_tracker'),
        'user': os.environ.get('DB_USER', 'postgres'),
        'password': os.environ.get('DB_PASSWORD', 'postgres'),
        'port': int(os.environ.get('DB_PORT', 5432))
    }
    
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(**db_config)
            conn.close()
            logger.info("✅ Database connection successful!")
            return True
        except OperationalError as e:
            logger.info(f"⏳ Waiting for database... (attempt {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        except Exception as e:
            logger.error(f"❌ Unexpected database error: {str(e)}")
            return False
    
    logger.error("❌ Failed to connect to database after maximum retries")
    return False


def initialize_database(app):
    """
    Initialize database tables.
    
    Args:
        app: Flask application instance
    """
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            logger.info("✅ Database tables created successfully!")
            
            # Create default categories for development
            if app.config.get('ENV') == 'development':
                create_default_data()
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize database: {str(e)}")
            raise


def create_default_data():
    """Create default data for development environment."""
    try:
        from src.models.user import User
        from src.models.category import Category
        
        # Check if default user exists
        default_user = User.query.filter_by(email='demo@example.com').first()
        if not default_user:
            # Create default user
            default_user = User(
                email='demo@example.com',
                username='demo',
                password='password123',  # This will be hashed
                first_name='Demo',
                last_name='User'
            )
            db.session.add(default_user)
            db.session.commit()
            logger.info("Created default demo user")
            
            # Create default categories
            default_categories = [
                {'name': 'Food & Dining', 'icon': '🍽️', 'color': '#ff6b6b'},
                {'name': 'Transportation', 'icon': '🚗', 'color': '#4ecdc4'},
                {'name': 'Entertainment', 'icon': '🎬', 'color': '#45b7d1'},
                {'name': 'Shopping', 'icon': '🛍️', 'color': '#f9ca24'},
                {'name': 'Bills & Utilities', 'icon': '💡', 'color': '#f0932b'},
                {'name': 'Health & Medical', 'icon': '🏥', 'color': '#eb4d4b'},
                {'name': 'Education', 'icon': '📚', 'color': '#6c5ce7'},
                {'name': 'Travel', 'icon': '✈️', 'color': '#a29bfe'},
            ]
            
            for cat_data in default_categories:
                category = Category(
                    name=cat_data['name'],
                    user_id=default_user.id,
                    icon=cat_data['icon'],
                    color=cat_data['color']
                )
                db.session.add(category)
            
            db.session.commit()
            logger.info("Created default categories")
            
    except Exception as e:
        logger.error(f"Failed to create default data: {str(e)}")
        db.session.rollback()


def main():
    """Main application entry point."""
    print("🚀 Starting Expense Tracker API Server...")
    print("=" * 50)
    
    # Wait for database
    if not wait_for_database():
        print("❌ Could not connect to database. Exiting...")
        sys.exit(1)
    
    # Create Flask application
    app = create_app()
    
    # Initialize database
    print("📊 Initializing database...")
    initialize_database(app)
    
    # Start server
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print(f"🌟 Starting server on {host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌍 Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print("=" * 50)
    
    try:
        app.run(host=host, port=port, debug=debug)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Failed to start server: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
