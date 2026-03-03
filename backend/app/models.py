from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    menus = db.relationship('Menu', backref='category', lazy='dynamic')

class Image(db.Model):
    __tablename__ = 'images'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    menus = db.relationship('Menu', backref='image', lazy='dynamic')

class Menu(db.Model):
    __tablename__ = 'menus'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    
    # Optional URL/Link for Google Maps Review or specific maps link
    google_maps_url = db.Column(db.String(255))
    map_reviews = db.Column(db.Text) 
    
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    image_id = db.Column(db.Integer, db.ForeignKey('images.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'category': self.category.name if self.category else None,
            'category_id': self.category_id,
            'image_url': f'/static/uploads/{self.image.filename}' if self.image else None,
            'google_maps_url': self.google_maps_url,
            'map_reviews': self.map_reviews
        }
