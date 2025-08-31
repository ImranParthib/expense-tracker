import logging
import logging.config
import os
from pythonjsonlogger import jsonlogger


def setup_logging(app):
    """Configure application logging."""
    
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    log_format = app.config.get('LOG_FORMAT')
    
    # Create formatters
    json_formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s'
    )
    
    standard_formatter = logging.Formatter(log_format)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level),
        format=log_format
    )
    
    # App logger
    app_logger = logging.getLogger('expense_tracker')
    app_logger.setLevel(getattr(logging, log_level))
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(standard_formatter)
    app_logger.addHandler(console_handler)
    
    # File handler for production
    if not app.debug:
        file_handler = logging.FileHandler('logs/app.log')
        file_handler.setFormatter(json_formatter)
        app_logger.addHandler(file_handler)
    
    # Suppress Flask's default logger in production
    if not app.debug:
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)
    
    app.logger.handlers.clear()
    app.logger.addHandler(console_handler)
    
    return app_logger
