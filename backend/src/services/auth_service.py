from flask_jwt_extended import create_access_token, create_refresh_token
from src.models.user import User
from src.config.database import db
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service for user management."""
    
    @staticmethod
    def register_user(email, username, password, first_name, last_name):
        """
        Register a new user.
        
        Args:
            email: User email
            username: User username
            password: User password
            first_name: User first name
            last_name: User last name
            
        Returns:
            dict: User data and tokens
            
        Raises:
            ValueError: If user already exists
        """
        # Check if user already exists
        existing_user = User.query.filter(
            db.or_(User.email == email, User.username == username)
        ).first()
        
        if existing_user:
            if existing_user.email == email:
                raise ValueError('Email already registered')
            else:
                raise ValueError('Username already taken')
        
        # Create new user
        user = User(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        try:
            db.session.add(user)
            db.session.commit()
            
            # Generate tokens
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))
            
            logger.info(f"User registered successfully: {user.email}")
            
            return {
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to register user: {str(e)}")
            raise
    
    @staticmethod
    def login_user(email, password):
        """
        Authenticate user login.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            dict: User data and tokens
            
        Raises:
            ValueError: If credentials are invalid
        """
        user = User.query.filter_by(email=email, is_active=True).first()
        
        if not user or not user.check_password(password):
            raise ValueError('Invalid email or password')
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        logger.info(f"User logged in successfully: {user.email}")
        
        return {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def get_user_by_id(user_id):
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User: User object or None
        """
        return User.query.filter_by(id=user_id, is_active=True).first()
    
    @staticmethod
    def refresh_token(user_id):
        """
        Generate new access token.
        
        Args:
            user_id: User ID
            
        Returns:
            dict: New access token
        """
        user = AuthService.get_user_by_id(user_id)
        if not user:
            raise ValueError('User not found')
        
        access_token = create_access_token(identity=str(user.id))
        
        return {
            'access_token': access_token
        }
