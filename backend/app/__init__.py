from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    # ensure upload folder exists
    import os
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
