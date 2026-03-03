const API_URL = 'http://127.0.0.1:5000/api';

// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const categoryFilter = document.getElementById('category-filter');
const loader = document.getElementById('loader');

// Modal Elements
const menuModal = document.getElementById('menu-modal');
const closeMenuModalBtn = document.getElementById('close-menu-modal');
const mapsModal = document.getElementById('maps-modal');
const closeMapsModalBtn = document.getElementById('close-maps-modal');

// Cart Elements
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const cartFloatingBtn = document.getElementById('cart-floating-btn');

// Init variables
let menus = [];
let categories = [];
let cart = [];

// Init App
document.addEventListener('DOMContentLoaded', () => {
    fetchMenus();
    fetchCategories();

    // Event Listeners
    document.getElementById('nav-maps').addEventListener('click', (e) => {
        e.preventDefault();
        openMapsModal();
    });

    document.getElementById('exit-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const confirmExit = confirm('Keluar dari sistem?');
        if (confirmExit) {
            document.body.innerHTML = '<div style="height:100vh;display:flex;align-items:center;justify-content:center;font-size:2rem;color:white;background:#0f172a;">Terima Kasih. Sistem Diakhiri.</div>';
        }
    });

    // Close Modals Settings
    window.addEventListener('click', (e) => {
        if (e.target === menuModal) closeMenuModal();
        if (e.target === mapsModal) closeMapsModal();
        if (e.target === cartModal) cartModal.classList.remove('show');
        if (e.target === checkoutModal) checkoutModal.classList.remove('show');
    });
    closeMenuModalBtn.addEventListener('click', closeMenuModal);
    closeMapsModalBtn.addEventListener('click', closeMapsModal);

    // Cart Events
    cartFloatingBtn.addEventListener('click', () => {
        updateCartUI();
        cartModal.classList.add('show');
    });
    document.getElementById('close-cart-modal').addEventListener('click', () => cartModal.classList.remove('show'));
    document.getElementById('close-checkout-modal').addEventListener('click', () => checkoutModal.classList.remove('show'));

    document.getElementById('btn-checkout').addEventListener('click', () => {
        cartModal.classList.remove('show');
        openCheckoutModal();
    });

    document.getElementById('btn-process-payment').addEventListener('click', processCheckout);
    document.getElementById('checkout-paid').addEventListener('input', calculateChange);
});

// Fetch Menus
async function fetchMenus(categoryId = '') {
    loader.style.display = 'block';
    menuGrid.innerHTML = '';
    try {
        const url = categoryId ? `${API_URL}/menus?category_id=${categoryId}` : `${API_URL}/menus`;
        const res = await fetch(url);
        menus = await res.json();
        renderMenus(menus);
    } catch (error) {
        console.error('Error fetching menus:', error);
        menuGrid.innerHTML = '<p style="color:red;">Gagal memuat data menu.</p>';
    } finally {
        loader.style.display = 'none';
    }
}

// Fetch Categories
async function fetchCategories() {
    try {
        // Since we don't have public category endpoint, we extract from menus or mock it.
        // Actually, let's just create a mock local category list if endpoint is protected.
        // For public, we'll extract unique categories from the previously fetched menus.
        setTimeout(() => {
            const uniqueCategories = [...new Set(menus.map(m => m.category).filter(c => c))];
            uniqueCategories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.textContent = cat;
                // Finding first matching category id
                const catId = menus.find(m => m.category === cat)?.category_id;
                btn.dataset.id = catId;
                btn.addEventListener('click', (e) => handleCategoryClick(e, catId));
                categoryFilter.appendChild(btn);
            });

            // Add event to 'Semua' button
            document.querySelector('.filter-btn[data-id=""]').addEventListener('click', (e) => handleCategoryClick(e, ''));
        }, 500);

    } catch (error) {
        console.error('Error handling categories:', error);
    }
}

function handleCategoryClick(e, categoryId) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    fetchMenus(categoryId);
}

// Render Menus
function renderMenus(menuData) {
    if (menuData.length === 0) {
        menuGrid.innerHTML = '<p>Tidak ada menu yang tersedia saat ini.</p>';
        return;
    }

    menuData.forEach(menu => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.addEventListener('click', () => openMenuDetail(menu.id));

        const imgSrc = menu.image_url ? `http://127.0.0.1:5000${menu.image_url}` : null;

        const imgHTML = imgSrc
            ? `<img src="${imgSrc}" alt="${menu.name}" class="menu-img">`
            : `<div class="img-fallback"><i class="fa-solid fa-utensils"></i></div>`;

        const stockBadge = (menu.stock > 0)
            ? `<span style="background:var(--bg-dark);color:#22c55e;padding:2px 8px;border-radius:10px;font-size:0.8rem;">Stok: ${menu.stock}</span>`
            : `<span style="background:var(--bg-dark);color:#ef4444;padding:2px 8px;border-radius:10px;font-size:0.8rem;">Habis</span>`;

        const btnClass = menu.stock > 0 ? 'btn-primary' : 'btn-secondary';
        const pointerEvents = menu.stock > 0 ? '' : 'pointer-events:none; opacity:0.5;';

        card.innerHTML = `
            ${imgHTML}
            <div class="menu-info">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                    <span class="menu-category" style="margin:0;">${menu.category || 'Umum'}</span>
                    ${stockBadge}
                </div>
                <h3>${menu.name}</h3>
                <div class="menu-price">Rp ${menu.price.toLocaleString('id-ID')}</div>
                <button class="${btnClass}" style="width:100%; margin-top:10px; padding: 8px; font-size:0.9rem; ${pointerEvents}" onclick="event.stopPropagation(); addToCart(${menu.id})">
                    <i class="fa-solid fa-cart-plus"></i> Tambah Keranjang
                </button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// Modals Logic
async function openMenuDetail(id) {
    try {
        const res = await fetch(`${API_URL}/menus/${id}`);
        const menu = await res.json();

        document.getElementById('modal-title').textContent = menu.name;
        document.getElementById('modal-category').textContent = menu.category || 'Umum';
        document.getElementById('modal-price').textContent = `Rp ${menu.price.toLocaleString('id-ID')}`;
        document.getElementById('modal-desc').textContent = menu.description || 'Tidak ada deskripsi.';

        const imgEl = document.getElementById('modal-img');
        if (menu.image_url) {
            imgEl.src = `http://127.0.0.1:5000${menu.image_url}`;
            imgEl.style.display = 'block';
        } else {
            imgEl.style.display = 'none'; // simple handling
        }

        menuModal.classList.add('show');
    } catch (error) {
        console.error("Failed to get detail", error);
        alert("Gagal memuat detail menu.");
    }
}

function closeMenuModal() {
    menuModal.classList.remove('show');
}

async function openMapsModal() {
    try {
        // Fetch mock map & reviews
        const mapRes = await fetch(`${API_URL}/maps`);
        const mapData = await mapRes.json();

        const reviewRes = await fetch(`${API_URL}/maps/reviews`);
        const reviewData = await reviewRes.json();

        document.getElementById('gmaps-link').href = mapData.maps_url;
        document.getElementById('overall-rating-number').textContent = reviewData.overall_rating;

        const reviewListEl = document.getElementById('reviews-list');
        reviewListEl.innerHTML = '';
        reviewData.reviews.forEach(r => {
            const starsHTML = Array(5).fill(0).map((_, i) =>
                i < r.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>'
            ).join('');

            reviewListEl.innerHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <span class="reviewer-name">${r.user}</span>
                        <div class="review-stars">${starsHTML}</div>
                    </div>
                    <p class="review-comment">"${r.comment}"</p>
                </div>
            `;
        });

        mapsModal.classList.add('show');
    } catch (error) {
        console.error("Failed map", error);
        alert("Gagal memuat layanan Maps.");
    }
}

function closeMapsModal() {
    mapsModal.classList.remove('show');
}

// === SHOPPING CART LOGIC ===
function addToCart(menuId) {
    const menu = menus.find(m => m.id === menuId);
    if (!menu || menu.stock <= 0) return;

    const existing = cart.find(c => c.id === menuId);
    if (existing) {
        if (existing.quantity < menu.stock) {
            existing.quantity += 1;
        } else {
            alert('Stok maksimum sudah dicapai di keranjang!');
            return;
        }
    } else {
        cart.push({ ...menu, quantity: 1 });
    }

    updateCartUI();

    // Animate badge
    const badge = document.getElementById('cart-badge');
    badge.style.transform = 'scale(1.5)';
    setTimeout(() => badge.style.transform = 'scale(1)', 200);
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    let totalQty = 0;
    let totalPrice = 0;

    cart.forEach((item, index) => {
        totalQty += item.quantity;
        totalPrice += (item.price * item.quantity);

        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                </div>
                <div class="cart-controls">
                    <button class="cart-btn" onclick="updateQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="cart-btn" onclick="updateQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
                    <button class="cart-btn" style="background:var(--primary-dark);" onclick="removeCartItem(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Keranjang masih kosong.</p>';
        document.getElementById('btn-checkout').disabled = true;
    } else {
        document.getElementById('btn-checkout').disabled = false;
    }

    document.getElementById('cart-badge').textContent = totalQty;
    document.getElementById('cart-total-price').textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
}

function updateQty(index, delta) {
    const item = cart[index];
    const maxStock = menus.find(m => m.id === item.id)?.stock || 0;

    if (item.quantity + delta > 0 && item.quantity + delta <= maxStock) {
        item.quantity += delta;
    } else if (item.quantity + delta > maxStock) {
        alert('Tidak ada stok tambahan.');
    }
    updateCartUI();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// === CHECKOUT LOGIC ===
function openCheckoutModal() {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    document.getElementById('checkout-paid').value = '';
    document.getElementById('checkout-change-container').style.display = 'none';
    document.getElementById('checkout-error').textContent = '';
    checkoutModal.classList.add('show');
}

function calculateChange() {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paid = parseFloat(document.getElementById('checkout-paid').value) || 0;

    if (paid >= totalPrice) {
        const change = paid - totalPrice;
        document.getElementById('checkout-change-container').style.display = 'block';
        document.getElementById('checkout-change').textContent = `Rp ${change.toLocaleString('id-ID')}`;
        document.getElementById('checkout-error').textContent = '';
    } else {
        document.getElementById('checkout-change-container').style.display = 'none';
        if (paid > 0) {
            document.getElementById('checkout-error').textContent = 'Uang tidak cukup.';
        }
    }
}

async function processCheckout() {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paid = parseFloat(document.getElementById('checkout-paid').value) || 0;

    if (cart.length === 0) return;
    if (paid < totalPrice) {
        document.getElementById('checkout-error').textContent = 'Harap bayar sesuai tagihan.';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cart: cart.map(c => ({ id: c.id, quantity: c.quantity })),
                amount_paid: paid
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Pembayaran Berhasil!\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}\nKembalian: Rp ${(paid - totalPrice).toLocaleString('id-ID')}`);
            cart = [];
            updateCartUI();
            checkoutModal.classList.remove('show');
            // Refresh menu list
            fetchMenus();
        } else {
            document.getElementById('checkout-error').textContent = data.msg || 'Terjadi kesalahan pada pembayaran.';
        }
    } catch (err) {
        document.getElementById('checkout-error').textContent = 'Koneksi error.';
    }
}
