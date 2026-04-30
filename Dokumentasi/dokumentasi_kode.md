# Dokumentasi Kode Aplikasi Web Warkop Ayah

Dokumentasi ini berisi penjelasan secara fungsional mengenai blok dan baris kode pada *frontend* maupun *backend* aplikasi Warkop Ayah.

---

## 1. BACKEND (Python & Flask)
Backend aplikasi menggunakan *framework* Flask dengan *database* SQLAlchemy dan manajemen otorisasi menggunakan JWT (JSON Web Token).

### File: `backend/run.py`
File ini adalah gerbang utama (titik masuk/ *entry point*) untuk menjalankan server aplikasi.
* **Baris 1 - 3**: Mengimpor fungsi `create_app` dan objek database `db` dari modul `app`. Kemudian langsung membuat *instance* aplikasi Flask.
* **Baris 5 - 15**: Konfigurasi eksekusi saat file dijalankan secara langsung. Aplikasi membuka *app context* lalu menjalankan `db.create_all()` untuk menyinkronkan atau membuat struktur seluruh tabel database jika belum ada di dalam MySQL.
  * **Baris 8 - 14**: Mengecek ketersediaan akun Admin di *database*. Jika tabel Admin masih kosong (jumlah baris 0), sistem otomatis mendaftarkan akun default dengan *username* `admin` dan kata sandi `admin123`.
* **Baris 16**: Menjalankan server lokal (web server) dengan mode *debug* pada *port* `5000`.

### File: `backend/app/config.py`
Menyimpan konfigurasi environment utama untuk server Flask.
* **Baris 1 - 4**: Mengimpor *library* `dotenv` untuk memuat variabel rahasia dari file `.env`.
* **Baris 6 - 15**: Mendeklarasikan class `Config`.
  * `SECRET_KEY` & `JWT_SECRET_KEY`: Kunci keamanan enkripsi untuk *sessions* web dan *JSON Web Token* untuk autentikasi API.
  * `SQLALCHEMY_DATABASE_URI`: Alamat koneksi untuk *database* MySQL. Nilai default mengarah ke database `warkop.ayah` di *localhost*.
  * `UPLOAD_FOLDER`: Variabel path lokal untuk direktori penyimpanan *file* gambar yang diunggah (`static/uploads`).
  * `MAX_CONTENT_LENGTH`: Batasan ukuran maksimal unggahan *file* di *server*, yaitu sebesar 16 MB.

### File: `backend/app/models.py`
Mendefinisikan skema struktur tabel untuk *database* MySQL (ORM SQLAlchemy).
* **Baris 4 - 15 (Model `Admin`)**: Skema tabel akun admin. Memuat fungsi `set_password` untuk menerapkan teknik hashing kata sandi, dan `check_password` untuk mencocokkan kata sandi pada proses *login*.
* **Baris 17 - 22 (Model `Category`)**: Skema tabel kategori menu. Memiliki properti `menus` yang bersifat relasi *One-to-Many* dengan tabel `Menu`.
* **Baris 24 - 30 (Model `Image`)**: Skema tabel untuk menyimpan rekam jejak berkas gambar fisik (mengandung nama dan *path* file direktori). Juga berelasi dengan tabel `Menu`.
* **Baris 32 - 59 (Model `Menu`)**: Skema tabel master menu yang mencatat atribut nama pesanan, harga, stok, deskripsi, dan integrasi ulasan/url *Google Maps*.
  * **Baris 47 - 59 (`to_dict`)**: Fungsi pembantu untuk mengonversi data bentuk *Object* menjadi bentuk barisan *Dictionary* (seperti format JSON). Ini berguna agar data langsung mudah dikirim pada respons HTTP *API*.

### File: `backend/app/routes.py`
File ini adalah inti dari aplikasi, di sinilah semua jalur URL *API* (*endpoints*) dideklarasikan.
* **Baris 11 - 23 (Menampilkan Menu)**: Endpoint publik `GET /menus` dan `GET /menus/<id>`. Digunakan oleh frontend untuk mengambil seluruh daftar produk, memfilter pesanan berdasarkan ID Kategori, serta melihat secara detail salah satu produk.
* **Baris 25 - 42 (Informasi Lokasi)**: Endpoint publik `GET /maps` dan `/maps/reviews` untuk mengambil informasi lokasi URL Maps Warkop Ayah beserta ulasan statis.
* **Baris 44 - 58 (Login Admin)**: Endpoint `POST /admin/login`. Menerima permintaan yang mengirim *username* dan *password*. Backend akan memvalidasi *password hash*-nya. Jika berhasil, *server* membuat *Access Token* JWT lalu dikirimkan kembali ke *frontend* untuk akses area privat admin.
* **Baris 60 - 78 (Manajemen Akun Admin)**: Endpoint `POST /admin/accounts` untuk mendaftarkan akun admin tambahan. Titik akses ini dilindungi oleh anotasi `@jwt_required()`, yang artinya pemanggil harus menyertakan token otorisasi.
* **Baris 80 - 114 (Manajemen Kategori)**: Kumpulan Endpoint *Admin* untuk `GET`, `POST`, `PUT`, dan `DELETE` tabel Kategori. Jika sebuah Kategori dihapus (Baris 111), seluruh *Menu* yang berada dalam kategori tersebut ikut terhapus.
* **Baris 116 - 165 (Manajemen Upload Gambar)**:
  * **Baris 116**: Terdapat fungsi pembantu `allowed_file` untuk mengecek dan membatasi ekstensi berkas (.jpg, .png, dsb).
  * **Baris 138 (POST /admin/images)**: Endpoint untuk menerima kiriman gambar, menyimpan salinan aslinya ke dalam folder `/static/uploads`, lalu memasukkan metadatanya ke *database*.
  * **Baris 157 (DELETE /admin/images/<id>)**: Jika gambar dihapus, aplikasi tidak hanya menghapus referensi di *database* namun juga berkas fisiknya (`os.remove(img.file_path)`).
* **Baris 167 - 211 (Manajemen Produk Menu)**: Endpoint admin untuk menambahkan `POST`, mengubah `PUT`, dan membuang `DELETE` sebuah produk. Melakukan validasi pengisian properti nama, harga, stok, kategori, gambar, serta informasi peta.
* **Baris 213 - 248 (Transaksi Pembayaran / Checkout)**: Endpoint publik `POST /checkout`. 
  * Menerima sebuah barisan objek keranjang (`cart`) dan jumlah uang bayar.
  * Server me-*looping* keranjang (Baris 223), mencocokkan setiap menu dari database untuk memastikan bahwa **stok tidak kurang/habis**.
  * Jika lolos, stok akan dikurangi secara langsung, kemudian server merespon beserta nominal kembalian (`change`).

### File: `backend/app/__init__.py`
* **Baris 10 - 24 (`create_app()`)**: Ini merupakan teknik Flask *Application Factory*. Di dalam fungsi inilah berbagai konfigurasi disematkan.
  * Mengaktifkan *CORS* agar domain frontend (localhost yang berbeda port) diizinkan mengakses API backend.
  * Menautkan sistem otorisasi *JWT* dan koneksi *Database SQLAlchemy*.
  * Baris 18 - 19: Membuat *directory path* penyimpanan folder unggahan (`uploads`) jikalau foldernya belum siap.
  * Baris 21 - 22: Mendaftarkan file jalur *API* (*Blueprint*) tadi kepada struktur *app* dengan sisipan alamat `/api`.

---

## 2. FRONTEND (HTML, CSS, JS)

### File: `frontend/index.html`
Berisi kerangka dasar antarmuka halaman beranda pelanggan.
* **Baris 18 - 33 (Navbar)**: Kerangka elemen Navigasi utama yang menampilkan identitas "Warkop Ayah" berserta tombol tautan bagian (Home, Menu, Moments, Lokasi Kami).
* **Baris 35 - 57 (Hero Section Carousel)**: Bagian promosi *banner* dengan kumpulan gambar-gambar *carousel/slider*.
* **Baris 59 - 68 (Search & Filter Section)**: Berisi kotak *input* (kolom pencarian pesanan) dan sebuah kontainer tombol `category-filter` untuk penyaringan kategori.
* **Baris 70 - 80 (Menu Grid Container)**: Ini merupakan kerangka kontainer *Grid* bernama `menu-grid`. Elemen ini kosong saat pertama kali, nantinya akan disisipkan dengan *Cards Menu* dari database oleh kode JavaScript.
* **Baris 82 - 119 (Informasi Perusahaan)**: Komponen informasi statis berupa bagian narasi `About Us` (Cerita Kami) dan susunan foto-foto dekorasi di `Gallery Section`.
* **Baris 121 - 136 (Pop-up Detail Modal)**: Menampung elemen tak-terlihat (*hidden*) bernama `menu-modal` yang akan dipanggil/dimunculkan sebagai sembulan ketika pelanggan melihat detail suatu produk Menu.
* **Baris 138 - 150 (Pop-up Maps Modal)**: Komponen modal penampil link jalan pintas agar pelanggan bisa langsung membuka aplikasi Google Maps.
* **Baris 156 - 177 (Footer Section)**: Berisi informasi kontak operasional seperti nomor WhatsApp, dan detail letak jalan.

### File: `frontend/css/style.css` (Gambaran Umum)
Mendeklarasikan kelas pengaturan visual (*style*), seperti *Color Palette* bernuansa gelap dan emas (variabel `--primary-col`), *layout grid*, struktur tata ruang (Margin/Padding), dan efek animasi (seperti interaksi *hover* dan *fade in*).

### File: `frontend/js/main.js`
Berisi logika interaksi peramban klien dengan backend (*Client-side Scripting*).
* **Baris 1 - 16**: Pendeklarasian elemen HTML yang paling sering diolah (seperti *Grid*, Tombol, Filter, dsb). Mendeklarasikan juga konstanta URL sasaran `API_URL` (localhost:5000).
* **Baris 18 - 44 (Fungsi Carousel)**: Kumpulan logika transisi gambar pada komponen depan (*Hero Slider*). Fungsi `showSlides()` mengkalkulasikan indeks, kemudian menyembunyikan gambar yang lama sambil menampilkan versi terbaru dengan memanipulasi *CSS display*.
* **Baris 46 - 124 (Inisialisasi Event Terpusat / DOMContentLoaded)**: 
  * Event ini jalan ketika halaman *HTML* telah usai terbaca sepenuhnya.
  * Menjalankan perintah awal `fetchMenus()` dan `fetchCategories()` untuk menyedot konten *API*.
  * **Baris 51 - 67 (Secret Admin Entry)**: Logika unik (Pintu Rahasia) di mana jika logo *Footer* ditekan cepat (*click*) beruntun sebanyak minimal 5 kali di bawah 1 detik, maka halaman akan ter-dialihkan otomatis (`window.location.href`) ke halaman login `admin/login.html`.
  * **Baris 92 - 122 (Drag to Scroll)**: *Script* penambahan fitur memegang dan menggeser layar (*drag horizontally*) pakai *mouse* layaknya *smartphone*, diterapkan pada daftar Menu Grid.
* **Baris 126 - 141 (`fetchMenus()`)**: Melakukan `fetch` HTTP ke endpoint `/menus`. Terdapat layar pemuatan (*loader*). Saat respons berhasil berupa *JSON*, hasilnya di-*pass* menuju `renderMenus()`.
* **Baris 143 - 170 (`fetchCategories()`)**: Mengambil data relasional master kategori lalu merakit komponen `<button>` ke sisi *Frontend*, beserta memberikan aksi di saat ditekan.
* **Baris 172 - 185 (`handleCategoryClick()`)**: Logika desain grafis manipulasi dom *active state* tombol (mengganti tebal bingkai dan warna), selagi mendaftarkan kategori pilihan menjadi parameter penyaringan fungsi `filterMenus()`.
* **Baris 187 - 208 (`filterMenus()`)**: Fungsi algoritma Filter. Menyaring daftar (array `menus`) terhadap masukan kata kunci dalam pencarian teks (`searchTerm`) maupun parameter tombol kategori (`currentCategory`).
* **Baris 242 - 261 (`navScrollSpy()`)**: Membaca kedalaman letak vertikal *scroll* pengguna (via `window.scrollY`). Gunanya menyesuaikan *highlight menu navbar* dengan area halaman (contoh: Home, About, Moments) yang sedang tayang aktif.
* **Baris 263 - 299 (`renderMenus()`)**: **Fungsi perakitan utama** komponen UI produk.
  * Me-*looping* data array (*forEach*).
  * Menyiapkan elemen `card` menu yang bersifat interaktif bila ditekan (*click trigger* ke `openMenuDetail`).
  * Mengevaluasi kondisi atribut stok. Jika stok habis (< 1), tempelkan label tulisan "Habis" bewarna merah (`#ef4444`). Jika masih tersedia (> 0) label "Stok: N" dengan tulisan hijau (`#22c55e`).
  * Menyisipkan elemen gambar (`image_url`) lengkap dengan tampilan mata uang Rupiah (`toLocaleString('id-ID')`), langsung ke dalam struktur `menuGrid` dengan metoda `appendChild`.
* **Baris 301 - 324 (`openMenuDetail()`)**: Logika *trigger* layar sembulan khusus menu produk. Memanggil `fetch` ulang ke API yang spesifik id `/menus/<id>` agar mengambil keterangan paling *fresh* tentang data menu, memperbarui antarmuka judul, keterangan, kategori dan foto, barulah memberikan perintah kelas CSS untuk memunculkan modalnya ke hadapan pengguna.
* **Baris 334 - 346 (`openMapsModal()`)**: Fungsi sederhana untuk memunculkan sembulan khusus link Google Maps dari respon HTTP data maps (`/api/maps`).
