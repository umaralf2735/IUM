from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from app import db
from app.models import Admin, Category, Image, Menu

api_bp = Blueprint('api', __name__)

# --- USER ENDPOINTS ---

@api_bp.route('/menus', methods=['GET'])
def get_menus():
    category_id = request.args.get('category_id')
    if category_id:
        menus = Menu.query.filter_by(category_id=category_id).all()
    else:
        menus = Menu.query.all()
    return jsonify([menu.to_dict() for menu in menus]), 200

@api_bp.route('/menus/<int:id>', methods=['GET'])
def get_menu_detail(id):
    menu = Menu.query.get_or_404(id)
    return jsonify(menu.to_dict()), 200

@api_bp.route('/maps', methods=['GET'])
def get_maps():
    # Mock endpoint for general Maps URL
    return jsonify({
        "status": "success",
        "maps_url": "https://maps.google.com/?q=Warkop+Ayah",
        "description": "Lokasi Restoran"
    }), 200

@api_bp.route('/maps/reviews', methods=['GET'])
def get_maps_reviews():
    # Mock endpoint for Google Maps Reviews
    return jsonify({
        "status": "success",
        "reviews": [
            {"user": "Budi", "rating": 5, "comment": "Makanannya sangat enak!"},
            {"user": "Siti", "rating": 5, "comment": "Pelayanan ramah."}
        ],
        "overall_rating": 5
    }), 200

# --- ADMIN AUTH ---

@api_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    admin = Admin.query.filter_by(username=username).first()
    if admin and admin.check_password(password):
        access_token = create_access_token(identity=str(admin.id))
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Invalid username or password"}), 401

# --- ADMIN ENDPOINTS (PROTECTED) ---

# Admin Account Management
@api_bp.route('/admin/accounts', methods=['POST'])
@jwt_required()
def create_admin():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    if Admin.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    new_admin = Admin(username=username)
    new_admin.set_password(password)
    db.session.add(new_admin)
    db.session.commit()

    return jsonify({"msg": "Admin created successfully"}), 201

# Category Management
@api_bp.route('/admin/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in categories]), 200

@api_bp.route('/admin/categories', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({"msg": "Category name required"}), 400
    
    cat = Category(name=name)
    db.session.add(cat)
    db.session.commit()
    return jsonify({"msg": "Category created", "id": cat.id}), 201

@api_bp.route('/admin/categories/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_category(id):
    cat = Category.query.get_or_404(id)
    
    if request.method == 'PUT':
        data = request.get_json() or {}
        cat.name = data.get('name', cat.name)
        db.session.commit()
        return jsonify({"msg": "Category updated"}), 200
        
    elif request.method == 'DELETE':
        db.session.delete(cat)
        db.session.commit()
        return jsonify({"msg": "Category deleted"}), 200

# Image Management
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'webp'}

@api_bp.route('/admin/images', methods=['GET'])
@jwt_required()
def get_images():
    images = Image.query.all()
    return jsonify([{
        "id": img.id, 
        "filename": img.filename, 
        "url": f"/static/uploads/{img.filename}"
    } for img in images]), 200

@api_bp.route('/images', methods=['GET'])
def get_public_images():
    images = Image.query.all()
    return jsonify([{
        "id": img.id, 
        "filename": img.filename, 
        "url": f"/static/uploads/{img.filename}"
    } for img in images]), 200

@api_bp.route('/admin/images', methods=['POST'])
@jwt_required()
def upload_image():
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        new_image = Image(filename=filename, file_path=filepath)
        db.session.add(new_image)
        db.session.commit()
        return jsonify({"msg": "Image uploaded", "id": new_image.id, "url": f"/static/uploads/{filename}"}), 201

@api_bp.route('/admin/images/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_image(id):
    img = Image.query.get_or_404(id)
    if os.path.exists(img.file_path):
        os.remove(img.file_path)
    db.session.delete(img)
    db.session.commit()
    return jsonify({"msg": "Image deleted"}), 200

# Menu Management
@api_bp.route('/admin/menus', methods=['POST'])
@jwt_required()
def create_menu():
    data = request.get_json() or {}
    
    # Required fields
    if not all(k in data for k in ("name", "price", "category_id")):
        return jsonify({"msg": "Missing required fields (name, price, category_id)"}), 400
        
    menu = Menu(
        name=data['name'],
        price=data['price'],
        stock=data.get('stock', 0),
        description=data.get('description'),
        category_id=data['category_id'],
        image_id=data.get('image_id'),
        google_maps_url=data.get('google_maps_url'),
        map_reviews=data.get('map_reviews')
    )
    db.session.add(menu)
    db.session.commit()
    return jsonify({"msg": "Menu created", "id": menu.id}), 201

@api_bp.route('/admin/menus/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_admin_menu(id):
    menu = Menu.query.get_or_404(id)
    
    if request.method == 'PUT':
        data = request.get_json() or {}
        menu.name = data.get('name', menu.name)
        menu.price = data.get('price', menu.price)
        menu.stock = data.get('stock', menu.stock)
        menu.description = data.get('description', menu.description)
        menu.category_id = data.get('category_id', menu.category_id)
        menu.image_id = data.get('image_id', menu.image_id)
        menu.google_maps_url = data.get('google_maps_url', menu.google_maps_url)
        menu.map_reviews = data.get('map_reviews', menu.map_reviews)
        
        db.session.commit()
        return jsonify({"msg": "Menu updated"}), 200
        
    elif request.method == 'DELETE':
        db.session.delete(menu)
        db.session.commit()
        return jsonify({"msg": "Menu deleted"}), 200

# --- CHECKOUT SYSTEM ---
@api_bp.route('/checkout', methods=['POST'])
def checkout():
    data = request.get_json() or {}
    cart = data.get('cart', [])
    amount_paid = data.get('amount_paid', 0)
    
    if not cart:
        return jsonify({"msg": "Cart is empty"}), 400
        
    total_price = 0
    # Pre-check all items and stock
    for item in cart:
        menu = Menu.query.get(item['id'])
        if not menu:
            return jsonify({"msg": f"Menu with ID {item['id']} not found"}), 404
        if menu.stock < item['quantity']:
            return jsonify({"msg": f"Stock not enough for {menu.name}. Remaining: {menu.stock}"}), 400
        total_price += (menu.price * item['quantity'])
    
    if amount_paid < total_price:
        return jsonify({"msg": f"Insufficient payment. Total is {total_price}, but received {amount_paid}"}), 400
        
    change = amount_paid - total_price
    
    # Process order and subtract stock
    for item in cart:
        menu = Menu.query.get(item['id'])
        menu.stock -= item['quantity']
        
    db.session.commit()
    
    return jsonify({
        "msg": "Checkout successful",
        "total_price": total_price,
        "amount_paid": amount_paid,
        "change": change
    }), 200
