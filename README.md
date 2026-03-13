# 🌾 CropPortal — Django + Oracle + React + Bootstrap 5

A full-stack crop marketplace rebuilt from Node.js/SQLite to **Django REST Framework + Oracle Database + React.js + Bootstrap 5**.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, Django 4.2, Django REST Framework |
| Database | Oracle DB (via `cx_Oracle` or `oracledb`) |
| Auth | JWT (SimpleJWT) + OTP via Email + Google OAuth 2.0 |
| Frontend | React 18, React Router 6, Bootstrap 5.3, Vanilla JS |
| File Storage | Django media (local; swap for S3 in production) |

---

## 📁 Project Structure

```
crop_portal/
├── apps/
│   ├── accounts/          # User model, JWT auth, OTP, Google OAuth
│   ├── crops/             # Crop listings, media, categories, inquiries, saves
│   └── dashboard/         # Farmer & customer dashboard stats
├── crop_portal/
│   ├── settings.py        # Oracle DB config, JWT, CORS, email
│   └── urls.py            # API routes + React SPA catch-all
├── templates/
│   └── index.html         # Serves the React build
├── frontend/              # React application
│   └── src/
│       ├── api/           # Centralized API layer (fetch + token refresh)
│       ├── context/       # AuthContext (login, register, Google OAuth)
│       ├── components/    # Navbar, Footer, CropCard
│       └── pages/         # All page components
├── requirements.txt
└── .env.example
```

---

## ⚡ Quick Start

### 1. Oracle Database Setup

```sql
-- Connect as SYSDBA
CREATE USER crop_portal_user IDENTIFIED BY cropPortal123;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE TO crop_portal_user;
GRANT UNLIMITED TABLESPACE TO crop_portal_user;
```

### 2. Python / Django Setup

```bash
# Clone and setup
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Oracle credentials and email settings

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Seed categories (optional)
python manage.py shell -c "
from apps.crops.models import Category
categories = ['Grains & Cereals', 'Vegetables', 'Fruits', 'Pulses & Legumes', 'Oilseeds', 'Spices & Herbs', 'Dairy & Eggs', 'Flowers']
[Category.objects.get_or_create(name=c) for c in categories]
print('Categories seeded!')
"

# Start Django server
python manage.py runserver
```

### 3. React Frontend Setup

```bash
cd frontend
npm install
npm start      # Starts on http://localhost:3000
```

> React proxies API calls to `http://localhost:8000` (configured in package.json)

---

## 🔑 Key Features

### Authentication
- **Register** as Farmer or Customer with role-based access
- **JWT Login** with access/refresh token rotation
- **OTP Password Reset** via email (6-digit code, 10-min expiry)
- **Google OAuth 2.0** sign-in with role selection
- **Change Password** from profile page

### Farmer Features
- Add, edit, delete crop listings
- Upload multiple images & videos per crop
- View all inquiries from customers in a table
- Dashboard with stats: total listings, views, inquiries

### Customer Features
- Browse and search crops with advanced filters
- Save/unsave crops with heart button
- Send contact inquiries to farmers from crop detail page
- View inquiry history on dashboard

### Crop Listing
- Category filtering (Grains, Vegetables, Fruits, etc.)
- Price range, organic, location, status filters
- Sorting by price, date, views
- Pagination (12 per page)
- Media gallery with image thumbnails and video preview

---

## 🌐 API Endpoints

```
POST   /api/auth/register/                  Register user
POST   /api/auth/login/                     Login → JWT tokens
POST   /api/auth/token/refresh/             Refresh access token
GET    /api/auth/profile/                   Get/update own profile
POST   /api/auth/password-reset/request/    Send OTP to email
POST   /api/auth/password-reset/confirm/    Verify OTP + set new password
POST   /api/auth/google/                    Google OAuth login

GET    /api/crops/                          List crops (with filters)
POST   /api/crops/                          Create crop (farmer only)
GET    /api/crops/<id>/                     Crop detail
PATCH  /api/crops/<id>/                     Update crop (owner only)
DELETE /api/crops/<id>/                     Delete crop (owner only)
POST   /api/crops/<id>/media/               Upload images/videos
POST   /api/crops/<id>/save/                Toggle save/unsave
GET    /api/crops/saved/                    Customer's saved crops
GET    /api/crops/mine/                     Farmer's own crops
GET    /api/crops/categories/               All categories
POST   /api/crops/inquiries/send/           Send inquiry to farmer
GET    /api/crops/inquiries/received/       Farmer's received inquiries

GET    /api/dashboard/farmer/               Farmer dashboard stats
GET    /api/dashboard/customer/             Customer dashboard stats
```

---

## 🗄️ Oracle Database Tables

| Table | Description |
|-------|-------------|
| `cp_users` | Users (farmers, customers, admins) |
| `cp_otp_tokens` | OTP tokens for password reset |
| `cp_categories` | Crop categories |
| `cp_crops` | Crop listings |
| `cp_crop_media` | Images and videos for crops |
| `cp_contact_inquiries` | Customer-to-farmer messages |
| `cp_saved_crops` | Customer saved/wishlist crops |

---

## 🚀 Production Deployment

1. `cd frontend && npm run build` — build React
2. Copy `frontend/build/*` to Django `static/` folder
3. `python manage.py collectstatic`
4. Set `DEBUG=False` in `.env`
5. Use Gunicorn + Nginx for serving

---

## 📞 Original Project

Based on: https://github.com/sareddy-050/crop-sell-  
Original stack: Node.js, Express, SQLite, HTML/CSS/JS  
New stack: **Django, Oracle DB, React, Bootstrap 5, JWT**
