# Warkop Ayah (Aplikasi Kasir & Pemesanan Menu)

Proyek ini adalah sistem Web untuk manajemen pemesanan, keranjang kasir (Checkout), dan kontrol stok untuk restoran **Warkop Ayah**. Berjalan dengan Backend REST API **Python (Flask)** dan Frontend murni **HTML/CSS/JS**.

---

## 🚀 Panduan Install di Komputer/Laptop Baru

Jika Anda baru saja men-download/clone berpusat dari GitHub untuk dipindah ke laptop lain, ikuti langkah-langkah di bawah agar program bisa berjalan lancar:

### 1. Persiapan Database MySQL (Penting!)
Sebenarnya, Anda **TIDAK PERLU repot** menjalankan panjang-lebar script `.sql` untuk membuat tabel karena Python sudah dirancang otomatis menciptakan tabel (beserta Akun Admin default). Anda cukup membuat Database kosong bernama `warkop.ayah`:

**Cara 1 (Cepat via Laragon / XAMPP):**
1. Buka aplikasi **Laragon** (atau XAMPP) lalu Start Server **MySQL**-nya.
2. Buka HeidiSQL / phpMyAdmin.
3. Buat database baru dengan nama pasti: `warkop.ayah`.
4. Eksport File `database.sql` di dalam database yang baru dibuat tadi
5. Selesai!
`
*Catatan Tambahan:* Apabila Anda mau memakai script manual, sudah disediakan file `database.sql` di root folder. Anda cukup Import file tersebut, ia akan otomatis membuat tabelnya.

### 2. Install Kebutuhan Python
Buka Terminal/Command Prompt (CMD) di folder `backend`, lalu instal ekstensi yang diperlukan:
```bash
# Masuk ke folder backend
cd backend

# Buat lingkungan Virtual Environment (jika belum ada)
python -m venv venv

# Aktifkan Virtual Environment (Di Windows)
.\venv\Scripts\activate

# Instal seluruh module yg dicatat
pip install -r requirements.txt
```

### 3. Cara Menjalankan Server
Kami sudah membuatkan tombol praktis (**satu kali klik**) yang langsung mengaktifkan Backend maupun Frontend-nya secara bersamaan.

Di bagian paling luar folder proyek:
1. Pastikan Laragon/XAMPP (MySQL) dalam keadaan **Start/Running**.
2. **Double-Click** file bernama `start_restoran.bat`.
3. Akan terbuka 2 jendela CMD hitam (biarkan menyala).
4. Selesai! Anda bisa mengakses program di Web Browser:

🎯 **Link Pelanggan Pembeli:** [http://127.0.0.1:8191](http://127.0.0.1:8191)  
🛡️ **Link Admin Dashboard:** [http://127.0.0.1:8191/admin/login.html](http://127.0.0.1:8191/admin/login.html)  

### Catatan Tambahan
**Akun Admin Awal:** Admin sistem dibuat otomatis oleh python saat pertama kali berjalan.
* **Username:** `admin`
* **Password:** `admin123`
