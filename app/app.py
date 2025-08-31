from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@db:5432/expense_tracker'
db = SQLAlchemy(app)


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
    amount = data.get('amount')
    description = data.get('description')
    date = data.get('date')
    category_id = data.get('category_id')

    if not all([amount, description, date, category_id]):
        return jsonify({'error': 'All fields are required'}), 400

    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    try:
        date_obj = datetime.datetime.strptime(date, "%Y-%m-%d").date()
    except Exception:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

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
    with app.app_context():
        db.create_all()
    app.run(debug=True)
