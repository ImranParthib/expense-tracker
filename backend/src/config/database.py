from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def init_db(app):
    """Initialize database with app."""
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models to ensure they're registered
    from src.models import user, category, expense
    
    return db
