const API_URL = 'http://127.0.0.1:5000/api';
const token = localStorage.getItem('adminToken');

if (!token) {
    window.location.href = 'login.html';
}

const headers = {
    'Authorization': `Bearer ${token}`
};

let currentCategories = [];
let currentImages = [];

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboardData();

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });

    document.getElementById('add-category-form').addEventListener('submit', handleAddCategory);
    document.getElementById('upload-image-form').addEventListener('submit', handleUploadImage);
    document.getElementById('menu-form').addEventListener('submit', handleSaveMenu);
    document.getElementById('add-admin-form').addEventListener('submit', handleAddAdmin);
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'manage-menus') loadMenus();
            if (targetId === 'manage-categories') loadCategories();
            if (targetId === 'manage-images') loadImages();
        });
    });
}

async function loadDashboardData() {
    loadCategories();
    loadMenus(true); 
}

async function apiFetch(endpoint, options = {}) {
    options.headers = { ...options.headers, ...headers };
    if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (res.status === 401) {
            alert('Sesi berakhir. Silakan login kembali.');
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
            return null;
        }
        return res;
    } catch (err) {
        console.error('API Fetch Error:', err);
        return null;
    }
}

async function loadCategories() {
    const res = await apiFetch('/admin/categories');
    if (!res) return;
    const data = await res.json();
    currentCategories = data;

    document.getElementById('stat-categories').textContent = data.length;

    const tbody = document.getElementById('tbl-categories');
    tbody.innerHTML = '';

    const menuSelect = document.getElementById('m-category');
    menuSelect.innerHTML = '<option value="">-- Pilih Kategori --</option>';

    data.forEach(cat => {
        tbody.innerHTML += `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.name}</td>
                <td>
                    <button class="action-btn btn-del" onclick="deleteCategory(${cat.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        menuSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

async function handleAddCategory(e) {
    e.preventDefault();
    const name = document.getElementById('cat-name').value;
    const res = await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name })
    });

    if (res && res.ok) {
        document.getElementById('cat-name').value = '';
        loadCategories();
    } else {
        const text = res ? await res.text() : 'Network error';
        alert('Gagal menambah kategori: ' + (res ? res.status : '') + ' ' + text);
    }
}

async function deleteCategory(id) {
    if (!confirm('Hapus kategori ini?')) return;
    const res = await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
    if (res && res.ok) loadCategories();
    else alert('Gagal menghapus kategori. Mungkin sedang digunakan oleh menu.');
}

let globalMenus = [];
async function loadMenus(silent = false) {
    const res = await fetch(`${API_URL}/menus`); 
    if (!res.ok) return;
    const data = await res.json();
    globalMenus = data;

    document.getElementById('stat-menus').textContent = data.length;

    if (silent) return;

    const tbody = document.getElementById('tbl-menus');
    tbody.innerHTML = '';

    data.forEach(m => {
        let stockColor = 'var(--text)';
        let stockText = m.stock;
        if (m.stock <= 0) {
            stockColor = '#ef4444'; 
            stockText = 'Habis';
        } else if (m.stock > 10) {
            stockColor = '#22c55e'; 
        } else {
            stockColor = '#eab308'; 
        }

        tbody.innerHTML += `
            <tr>
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td>${m.category || '-'}</td>
                <td>Rp ${m.price.toLocaleString('id-ID')}</td>
                <td style="color: ${stockColor}; font-weight: bold;">${stockText}</td>
                <td>
                    <button class="action-btn btn-edit" title="Edit" onclick="editMenu(${m.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn btn-del" title="Hapus" onclick="deleteMenu(${m.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function openMenuForm() {
    document.getElementById('menu-form').reset();
    document.getElementById('menu-id').value = '';
    document.getElementById('menu-form-title').textContent = 'Tambah Menu';

    const imgSelect = document.getElementById('m-image');
    imgSelect.innerHTML = '<option value="">-- Tanpa Gambar --</option>';
    currentImages.forEach(img => {
        imgSelect.innerHTML += `<option value="${img.id}">${img.filename}</option>`;
    });

    document.getElementById('admin-menu-modal').classList.add('show');
}

function closeMenuForm() {
    document.getElementById('admin-menu-modal').classList.remove('show');
}

async function editMenu(id) {
    
    await loadImages();

    const menu = globalMenus.find(m => m.id === id);
    if (!menu) return;

    openMenuForm();
    document.getElementById('menu-form-title').textContent = 'Edit Menu';
    document.getElementById('menu-id').value = menu.id;
    document.getElementById('m-name').value = menu.name;
    document.getElementById('m-price').value = menu.price;
    document.getElementById('m-stock').value = menu.stock || 0;
    document.getElementById('m-category').value = menu.category_id;

}

async function handleSaveMenu(e) {
    e.preventDefault();
    const id = document.getElementById('menu-id').value;
    const data = {
        name: document.getElementById('m-name').value,
        price: parseFloat(document.getElementById('m-price').value),
        stock: parseInt(document.getElementById('m-stock').value) || 0,
        category_id: parseInt(document.getElementById('m-category').value),
        image_id: document.getElementById('m-image').value ? parseInt(document.getElementById('m-image').value) : null
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/admin/menus/${id}` : `/admin/menus`;

    const res = await apiFetch(url, {
        method: method,
        body: JSON.stringify(data)
    });

    if (res && res.ok) {
        closeMenuForm();
        loadMenus();
    } else {
        alert('Gagal menyimpan menu');
    }
}

async function deleteMenu(id) {
    if (!confirm('Hapus menu ini?')) return;
    const res = await apiFetch(`/admin/menus/${id}`, { method: 'DELETE' });
    if (res && res.ok) loadMenus();
}

async function loadImages() {
    const res = await apiFetch('/admin/images');
    if (!res) return;
    const data = await res.json();
    currentImages = data;

    const grid = document.getElementById('admin-image-grid');
    grid.innerHTML = '';

    data.forEach(img => {
        grid.innerHTML += `
            <div class="img-card">
                <img src="http://127.0.0.1:5000${img.url}" alt="image">
                <button class="img-del-btn" onclick="deleteImage(${img.id})"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
    });
}

async function handleUploadImage(e) {
    e.preventDefault();
    const fileInput = document.getElementById('image-file');
    if (fileInput.files.length === 0) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const uploadHeaders = { 'Authorization': `Bearer ${token}` };

    try {
        const res = await fetch(`${API_URL}/admin/images`, {
            method: 'POST',
            headers: uploadHeaders,
            body: formData
        });

        if (res.ok) {
            fileInput.value = '';
            loadImages();
        } else {
            const text = await res.text();
            alert('Gagal upload gambar: ' + res.status + ' - ' + text);
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteImage(id) {
    if (!confirm('Hapus gambar ini?')) return;
    const res = await apiFetch(`/admin/images/${id}`, { method: 'DELETE' });
    if (res && res.ok) loadImages();
}

async function handleAddAdmin(e) {
    e.preventDefault();
    const username = document.getElementById('new-admin-user').value;
    const password = document.getElementById('new-admin-pass').value;
    const msgEl = document.getElementById('admin-msg');

    msgEl.textContent = 'Menyimpan...';
    msgEl.style.color = 'var(--text-muted)';

    const res = await apiFetch('/admin/accounts', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });

    if (res && res.ok) {
        msgEl.textContent = 'Admin berhasil ditambahkan!';
        msgEl.style.color = '#4ade80'; 
        e.target.reset();
    } else {
        const d = await res.json();
        msgEl.textContent = d.msg || 'Gagal menambahkan admin.';
        msgEl.style.color = '#ff6b6b';
    }
}
