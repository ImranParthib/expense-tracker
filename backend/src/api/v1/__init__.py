from flask import Blueprint
from .auth import auth_bp
from .categories import categories_bp
from .expenses import expenses_bp

# Create v1 API blueprint
api_v1_blueprint = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Register sub-blueprints
api_v1_blueprint.register_blueprint(auth_bp)
api_v1_blueprint.register_blueprint(categories_bp)
api_v1_blueprint.register_blueprint(expenses_bp)
