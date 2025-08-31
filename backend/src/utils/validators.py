from marshmallow import Schema, fields, validate, validates, ValidationError
from decimal import Decimal
import re


class EmailValidator:
    """Custom email validator."""
    
    def __call__(self, value):
        email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not email_regex.match(value):
            raise ValidationError('Invalid email format.')
        return value


class PasswordValidator:
    """Custom password validator."""
    
    def __call__(self, value):
        if len(value) < 8:
            raise ValidationError('Password must be at least 8 characters long.')
        
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Password must contain at least one uppercase letter.')
        
        if not re.search(r'[a-z]', value):
            raise ValidationError('Password must contain at least one lowercase letter.')
        
        if not re.search(r'\d', value):
            raise ValidationError('Password must contain at least one digit.')
        
        return value


class UserRegistrationSchema(Schema):
    """Schema for user registration validation."""
    
    email = fields.Email(required=True, validate=EmailValidator())
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=80),
        error_messages={'required': 'Username is required.'}
    )
    password = fields.Str(
        required=True,
        validate=PasswordValidator(),
        load_only=True
    )
    first_name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
        error_messages={'required': 'First name is required.'}
    )
    last_name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
        error_messages={'required': 'Last name is required.'}
    )


class UserLoginSchema(Schema):
    """Schema for user login validation."""
    
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class CategorySchema(Schema):
    """Schema for category validation."""
    
    name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
        error_messages={'required': 'Category name is required.'}
    )
    description = fields.Str(
        missing=None,
        validate=validate.Length(max=200)
    )
    color = fields.Str(
        missing='#6c757d',
        validate=validate.Regexp(
            r'^#[0-9A-Fa-f]{6}$',
            error='Color must be a valid hex color code (e.g., #FF5733).'
        )
    )
    icon = fields.Str(missing='📁', validate=validate.Length(max=50))


class ExpenseSchema(Schema):
    """Schema for expense validation."""
    
    amount = fields.Float(
        required=True,
        validate=validate.Range(min=0.01, error='Amount must be greater than 0.'),
        error_messages={'required': 'Amount is required.'}
    )
    description = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=200),
        error_messages={'required': 'Description is required.'}
    )
    date = fields.Date(
        required=True,
        error_messages={'required': 'Date is required.'}
    )
    category_id = fields.Int(
        required=True,
        error_messages={'required': 'Category is required.'}
    )
    notes = fields.Str(missing=None, validate=validate.Length(max=1000))
    receipt_url = fields.Str(missing=None)  # Simplified from Url field
    is_recurring = fields.Bool(missing=False)


class ExpenseQuerySchema(Schema):
    """Schema for expense query parameters."""
    
    page = fields.Int(missing=1, validate=validate.Range(min=1))
    per_page = fields.Int(missing=20, validate=validate.Range(min=1, max=100))
    category_id = fields.Int(missing=None)
    start_date = fields.Date(missing=None)
    end_date = fields.Date(missing=None)
    search = fields.Str(missing=None, validate=validate.Length(max=100))
    sort_by = fields.Str(
        missing='date',
        validate=validate.OneOf(['date', 'amount', 'description', 'created_at'])
    )
    sort_order = fields.Str(
        missing='desc',
        validate=validate.OneOf(['asc', 'desc'])
    )


# Schema instances for reuse
user_registration_schema = UserRegistrationSchema()
user_login_schema = UserLoginSchema()
category_schema = CategorySchema()
expense_schema = ExpenseSchema()
expense_query_schema = ExpenseQuerySchema()
