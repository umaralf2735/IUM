from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Optional: create a default admin if none exists
        from app.models import Admin
        if Admin.query.count() == 0:
            default_admin = Admin(username='admin')
            default_admin.set_password('admin123')
            db.session.add(default_admin)
            db.session.commit()
            print("Created default admin user (admin / admin123)")
    
    app.run(debug=True, port=5000)
