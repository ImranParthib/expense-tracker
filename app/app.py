from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import time
import psycopg2
from psycopg2 import OperationalError

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@db:5432/expense_tracker'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

def wait_for_db():
    """Wait for database to become available"""
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Try to connect to PostgreSQL
            conn = psycopg2.connect(
                host='db',
                database='expense_tracker',
                user='postgres',
                password='postgres',
                port=5432
            )
            conn.close()
            print("✅ Database connection successful!")
            return True
        except OperationalError as e:
            retry_count += 1
            print(f"⏳ Waiting for database... (attempt {retry_count}/{max_retries})")
            print(f"Error: {e}")
            time.sleep(2)
    
    print("❌ Failed to connect to database after maximum retries")
    return False


# =====================
# MODELS
# =====================
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)


# =====================
# ROUTES
# =====================

@app.route('/categories', methods=['POST'])
def add_category():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Category name is required'}), 400

    category = Category(name=name)
    db.session.add(category)
    db.session.commit()

    return jsonify({'id': category.id, 'name': category.name}), 201


@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in categories])


@app.route('/expenses', methods=['POST'])
def add_expense():
    data = request.get_json()
    print(f"🔍 Received data: {data}")
    amount = data.get('amount')
    description = data.get('description')
    date = data.get('date')
    category_id = data.get('category_id')
    
    print(f"🔍 Date value: '{date}' (type: {type(date)})")

    if not all([amount, description, date, category_id]):
        return jsonify({'error': 'All fields are required'}), 400

    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    # Try to parse date - use a very explicit approach
    try:
        # Just in case date is an empty string or None
        if not date or not isinstance(date, str):
            return jsonify({'error': 'Date must be a valid string in YYYY-MM-DD format'}), 400
            
        # Hard-code the format exactly
        year, month, day = map(int, date.split('-'))
        date_obj = datetime(year, month, day).date()
    except ValueError as e:
        print(f"❌ Date parsing error: {e}")
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-09-01).'}), 400
    except Exception as e:
        print(f"❌ Unexpected error parsing date: {e}")
        return jsonify({'error': 'Error processing date.'}), 400

    # Guarantee only Python date object is used
    expense = Expense(
        amount=float(amount),
        description=str(description),
        date=date_obj,
        category_id=int(category_id)
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify({
        'id': expense.id,
        'amount': expense.amount,
        'description': expense.description,
        'date': expense.date.isoformat(),
        'category': category.name
    }), 201


@app.route('/expenses', methods=['GET'])
def get_expenses():
    expenses = Expense.query.all()
    result = []
    for e in expenses:
        category = db.session.get(Category, e.category_id)
        result.append({
            'id': e.id,
            'amount': e.amount,
            'description': e.description,
            'date': e.date.isoformat(),
            'category': category.name if category else None
        })
    return jsonify(result)


# =====================
# INIT
# =====================
if __name__ == '__main__':
    print("🚀 Starting Flask application...")
    
    # Wait for database to become available
    if not wait_for_db():
        print("❌ Could not connect to database. Exiting...")
        exit(1)
    
    # Create database tables
    print("📊 Creating database tables...")
    with app.app_context():
        db.create_all()
    print("✅ Database tables created successfully!")
    
    # Start the Flask application
    print("🌟 Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000)
