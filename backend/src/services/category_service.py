from src.models.category import Category
from src.config.database import db
import logging

logger = logging.getLogger(__name__)


class CategoryService:
    """Service for managing expense categories."""
    
    @staticmethod
    def create_category(user_id, name, description=None, color='#6c757d', icon='📁'):
        """
        Create a new category for user.
        
        Args:
            user_id: User ID
            name: Category name
            description: Category description (optional)
            color: Category color hex code
            icon: Category icon
            
        Returns:
            Category: Created category
            
        Raises:
            ValueError: If category name already exists for user
        """
        # Check if category name already exists for this user
        existing_category = Category.query.filter_by(
            user_id=user_id,
            name=name,
            is_active=True
        ).first()
        
        if existing_category:
            raise ValueError(f'Category "{name}" already exists')
        
        # Create category
        category = Category(
            name=name,
            user_id=user_id,
            description=description,
            color=color,
            icon=icon
        )
        
        try:
            db.session.add(category)
            db.session.commit()
            
            logger.info(f"Category created: {name} for user {user_id}")
            return category
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to create category: {str(e)}")
            raise
    
    @staticmethod
    def get_user_categories(user_id, include_stats=False):
        """
        Get all categories for a user.
        
        Args:
            user_id: User ID
            include_stats: Include expense statistics
            
        Returns:
            list: List of categories
        """
        categories = Category.query.filter_by(
            user_id=user_id,
            is_active=True
        ).order_by(Category.name).all()
        
        return [category.to_dict(include_stats=include_stats) for category in categories]
    
    @staticmethod
    def get_category_by_id(category_id, user_id):
        """
        Get category by ID for specific user.
        
        Args:
            category_id: Category ID
            user_id: User ID
            
        Returns:
            Category: Category object or None
        """
        return Category.query.filter_by(
            id=category_id,
            user_id=user_id,
            is_active=True
        ).first()
    
    @staticmethod
    def update_category(category_id, user_id, **kwargs):
        """
        Update category.
        
        Args:
            category_id: Category ID
            user_id: User ID
            **kwargs: Fields to update
            
        Returns:
            Category: Updated category
            
        Raises:
            ValueError: If category not found or name conflicts
        """
        category = CategoryService.get_category_by_id(category_id, user_id)
        if not category:
            raise ValueError('Category not found')
        
        # Check for name conflicts if name is being updated
        if 'name' in kwargs and kwargs['name'] != category.name:
            existing_category = Category.query.filter_by(
                user_id=user_id,
                name=kwargs['name'],
                is_active=True
            ).first()
            
            if existing_category and existing_category.id != category_id:
                raise ValueError(f'Category "{kwargs["name"]}" already exists')
        
        try:
            # Update fields
            for field, value in kwargs.items():
                if hasattr(category, field):
                    setattr(category, field, value)
            
            db.session.commit()
            
            logger.info(f"Category updated: {category.name} for user {user_id}")
            return category
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to update category: {str(e)}")
            raise
    
    @staticmethod
    def delete_category(category_id, user_id):
        """
        Soft delete category (mark as inactive).
        
        Args:
            category_id: Category ID
            user_id: User ID
            
        Returns:
            bool: True if deleted successfully
            
        Raises:
            ValueError: If category not found or has expenses
        """
        category = CategoryService.get_category_by_id(category_id, user_id)
        if not category:
            raise ValueError('Category not found')
        
        # Check if category has expenses
        if category.expenses:
            raise ValueError('Cannot delete category with existing expenses')
        
        try:
            category.is_active = False
            db.session.commit()
            
            logger.info(f"Category deleted: {category.name} for user {user_id}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to delete category: {str(e)}")
            raise
