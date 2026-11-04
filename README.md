# ☕ Warkop Ayah — Etalase Digital & Portal Manajemen Menu

Aplikasi web resmi **Warkop Ayah ("Kopi Jujur, Harga Sedulur")** yang berfungsi sebagai katalog/etalase digital modern untuk pelanggan serta portal manajemen menu, kategori, stok, dan galeri gambar untuk pengelola kedai.

Dibangun menggunakan **Python (Flask REST API)** pada sisi Backend dan **HTML5, CSS3, serta Vanilla JavaScript** pada sisi Frontend dengan desain responsif (*Desktop & Mobile*).

---

## ✨ Fitur Utama

### 🛍️ Halaman Pelanggan (Storefront)
- **Modern Storefront UI**: Navbar *pill* khas warna kuning emas (`#f7b70b`) & hitam arang (`#222222`), dilengkapi pencarian cepat langsung dari navbar.
- **Interactive Swipe Hero Carousel**: Banner foto kedai & produk yang dapat digeser (*touch swipe* di HP maupun *click & drag* dengan mouse di Laptop/PC) serta berjalan otomatis.
- **Katalog Menu & Filter Dinamis**: Pencarian *real-time* dan tombol filter kategori yang otomatis menyesuaikan daftar menu dari database (dilengkapi *smart fallback catalog* jika server sedang offline).
- **Detail Menu & Integrasi Lokasi**: Modal *pop-up* informasi detail tiap menu, indikator stok langsung (*Tersedia / Habis*), galeri suasana kedai (*Moments*), serta pintasan lokasi Google Maps.
- **Responsive Mobile Layout**: Navigasi *hamburger menu* yang rapi dan tata letak kartu produk yang optimal di layar smartphone.

### 🛡️ Portal Admin (Management Dashboard)
- **Akses Tersembunyi (Secret Trigger)**: Halaman login admin tidak ditampilkan di layar publik; dapat diakses dengan **menekan logo "WARKOP AYAH" di bagian *footer* bawah sebanyak 5 kali berturut-turut** (atau langsung melalui URL admin).
- **Modern Dashboard UI**: Dilengkapi *topbar* status kedai, ringkasan jumlah menu & kategori, *quick action cards*, dan navigasi responsif.
- **Manajemen Menu & Stok (CRUD)**: Tambah, ubah, dan hapus menu beserta harga, deskripsi, kategori, foto produk, serta jumlah stok.
- **Manajemen Kategori & Galeri Gambar**: Tambah/hapus kategori produk dan unggah (*upload*) foto menu langsung dari perangkat.
- **Manajemen Akun Admin**: Tambah akun pengelola baru dengan autentikasi berbasis **JWT (JSON Web Token)**.

---

## 📂 Struktur Proyek

```text
IUM/
├── backend/                  # Server REST API Flask (Port 5000)
│   ├── app/
│   │   ├── static/uploads/   # Penyimpanan gambar menu yang di-upload admin
│   │   ├── __init__.py       # Inisialisasi Flask, CORS, JWT, & DB
│   │   ├── config.py         # Konfigurasi koneksi MySQL & Secret Key
│   │   ├── models.py         # Model Database (Admin, Category, Menu, Image)
│   │   └── routes.py         # Endpoint API Publik & Admin
│   ├── requirements.txt      # Daftar pustaka Python
│   └── run.py                # Entry point server Backend
├── frontend/                 # Aplikasi Web Statis (Port 8191)
│   ├── admin/                # Halaman Login & Dashboard Admin
│   ├── css/style.css         # Stylesheet utama (Storefront & Responsive)
│   ├── images/               # Aset gambar kedai & produk (.webp / .png)
│   ├── js/main.js            # Logika katalog, filter, search, & swipe carousel
│   └── index.html            # Halaman utama pelanggan
├── database.sql              # Skema SQL database Warkop Ayah
└── start_restoran.bat        # Script satu-klik untuk menjalankan Backend & Frontend
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Persiapan Database MySQL
Aplikasi Flask sudah dirancang untuk **otomatis membuat tabel beserta akun Admin bawaan** saat pertama kali dijalankan. Anda hanya perlu menyiapkan database kosong bernama **`warkop.ayah`**:

1. Buka **Laragon** atau **XAMPP**, lalu jalankan (**Start**) modul **MySQL**.
2. Buka **phpMyAdmin** atau **HeidiSQL**.
3. Buat database baru dengan nama persis:
   ```sql
   CREATE DATABASE IF NOT EXISTS `warkop.ayah`;
   ```
4. *(Opsional)* Anda juga dapat mengimpor file [`database.sql`](file:///d:/Semester%206/IUM/database.sql) yang tersedia di folder utama proyek.

### 2. Instalasi Environment Python (Khusus Pertama Kali)
Buka **Command Prompt (CMD)** atau **PowerShell**, lalu jalankan perintah berikut:

```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Buat Virtual Environment (jika belum ada)
python -m venv venv

# 3. Aktifkan Virtual Environment (Windows)
.\venv\Scripts\activate

# 4. Instal seluruh dependensi Python
pip install -r requirements.txt
```

### 3. Menjalankan Server (Satu Klik)
Setelah MySQL aktif dan `venv` terinstal:
1. Kembali ke folder utama proyek, lalu **Double-Click** file **[`start_restoran.bat`](file:///d:/Semester%206/IUM/start_restoran.bat)**.
2. Dua jendela CMD akan terbuka otomatis (Backend di port `5000` dan Frontend di port `8191`). Biarkan kedua jendela tetap terbuka.
3. Buka browser dan akses tautan berikut:

- 🎯 **Halaman Pelanggan (Web Utama):** [http://127.0.0.1:8191](http://127.0.0.1:8191)
- 🛡️ **Halaman Login Admin:** [http://127.0.0.1:8191/admin/login.html](http://127.0.0.1:8191/admin/login.html) *(atau klik 5x logo Warkop Ayah di footer halaman utama)*

---

## 🔑 Akun Admin Default

Saat server backend pertama kali berjalan, sistem otomatis membuat akun pengelola bawaan:
- **Username:** `admin`
- **Password:** `admin123`

---

## 📍 Informasi Kedai
**Warkop Ayah — Coffee & Food**  
Jl. Kedurus III SD No.32, Karangpilang, Surabaya 60223  
WhatsApp: +62 813-3357-1793
