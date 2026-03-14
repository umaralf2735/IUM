const API_URL = 'http://127.0.0.1:5000/api';

// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const categoryFilter = document.getElementById('category-filter');
const loader = document.getElementById('loader');
const cartTotalEl = document.getElementById('cart-total');
const btnCheckout = document.getElementById('btn-checkout');

// Modal Elements
const menuModal = document.getElementById('menu-modal');
const closeMenuModalBtn = document.getElementById('close-menu-modal');
const mapsModal = document.getElementById('maps-modal');
const closeMapsModalBtn = document.getElementById('close-maps-modal');

// Cart Elements
const cartModal = document.getElementById('cart-modal');
const cartFloatingBtn = document.getElementById('cart-floating-btn');
const closeCartModal = document.getElementById('close-cart-modal'); // Assuming this is a new element to be added

// Payment Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModal = document.getElementById('close-checkout-modal');
const paymentTotalEl = document.getElementById('checkout-total');
const inputUang = document.getElementById('uang-pembeli');
const kembalianArea = document.getElementById('kembalian-area');
const kembalianTxt = document.getElementById('uang-kembalian');
const btnConfirmPay = document.getElementById('btn-confirm-pay');

// Init variables
let cart = [];
let menus = [];
let categories = [];

// Init App
document.addEventListener('DOMContentLoaded', () => {
    fetchMenus('all');
    fetchCategories();

    // Event Listeners
    if (document.getElementById('nav-maps')) document.getElementById('nav-maps').addEventListener('click', (e) => { e.preventDefault(); openMapsModal(); });

    if (document.getElementById('exit-btn')) {
        document.getElementById('exit-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const confirmExit = confirm('Keluar dari sistem?');
            if (confirmExit) {
                document.body.innerHTML = '<div style="height:100vh;display:flex;align-items:center;justify-content:center;font-size:2rem;color:white;background:#0f172a;">Terima Kasih. Sistem Diakhiri.</div>';
            }
        });
    }

    // Close Modals Settings
    window.addEventListener('click', (e) => {
        if (e.target === menuModal) closeMenuModal();
        if (e.target === mapsModal) closeMapsModal();
        if (e.target === cartModal) cartModal.classList.remove('show');
        if (e.target === checkoutModal) checkoutModal.classList.remove('show');
    });
    if (closeMapsModalBtn) closeMapsModalBtn.addEventListener('click', closeMapsModal);
    if (closeMenuModalBtn) closeMenuModalBtn.addEventListener('click', closeMenuModal);

    // Add event listeners for modal buttons here to prevent breakage
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    // Mouse Drag to Scroll
    let isDown = false;
    let startX;
    let scrollLeft;

    if (menuGrid) {
        menuGrid.addEventListener('mousedown', (e) => {
            isDown = true;
            menuGrid.style.cursor = 'grabbing';
            startX = e.pageX - menuGrid.offsetLeft;
            scrollLeft = menuGrid.scrollLeft;
        });
        menuGrid.addEventListener('mouseleave', () => {
            isDown = false;
            menuGrid.style.cursor = 'default';
        });
        menuGrid.addEventListener('mouseup', () => {
            isDown = false;
            menuGrid.style.cursor = 'default';
        });
        menuGrid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - menuGrid.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            menuGrid.scrollLeft = scrollLeft - walk;
        });
    }

    // Cart Events
    if (cartFloatingBtn) {
        cartFloatingBtn.addEventListener('click', () => {
            updateCartUI();
            cartModal.classList.add('show');
        });
    }
    if (document.getElementById('close-cart-modal')) document.getElementById('close-cart-modal').addEventListener('click', () => cartModal.classList.remove('show'));
    if (document.getElementById('close-checkout-modal')) document.getElementById('close-checkout-modal').addEventListener('click', () => checkoutModal.classList.remove('show'));

    if (document.getElementById('btn-checkout')) {
        document.getElementById('btn-checkout').addEventListener('click', () => {
            cartModal.classList.remove('show');
            openCheckoutModal();
        });
    }

    if (btnConfirmPay) btnConfirmPay.addEventListener('click', processCheckout);
    if (inputUang) inputUang.addEventListener('input', calculateChange);
});

// Fetch Menus
async function fetchMenus(categoryId = '') {
    loader.style.display = 'block';
    menuGrid.innerHTML = '';
    try {
        const url = (categoryId && categoryId !== 'all') ? `${API_URL}/menus?category_id=${categoryId}` : `${API_URL}/menus`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil data produk");
        menus = await res.json();
        renderMenus(menus);
    } catch (error) {
        console.error('Error fetching menus:', error);
        menuGrid.innerHTML = '<p style="color:red;">Gagal memuat data menu.</p>';
    } finally {
        loader.style.display = 'none';
    }
}

// Bind existing category filters defined in HTML
function fetchCategories() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const catId = e.target.dataset.id;
            handleCategoryClick(e, catId);
        });
    });
}

function handleCategoryClick(e, categoryName) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderBottom = 'none';
        btn.style.color = 'var(--text-muted)';
    });

    e.target.classList.add('active');
    e.target.style.borderBottom = '2px solid var(--text-white)';
    e.target.style.color = 'var(--text-white)';

    if (categoryName === 'all') {
        renderMenus(menus);
    } else {
        const filtered = menus.filter(m => {
            const mCat = String(m.category || '').toLowerCase();
            const mName = String(m.name || '').toLowerCase();
            const search = String(categoryName).toLowerCase();
            return mCat.includes(search) || mName.includes(search);
        });
        renderMenus(filtered);
    }
}

// Review Submit Mock
function submitReview() {
    const name = document.getElementById('review-name').value;
    const rating = document.getElementById('review-rating').value;
    const text = document.getElementById('review-text').value;

    if (!name || !text) {
        alert("Nama dan Cerita harus diisi ya!");
        return;
    }

    alert("Terima kasih! Review dan momen Anda telah berhasil dikirim.");

    // Create new mock block
    const list = document.getElementById('public-reviews-list');
    const stars = Array(Number(rating)).fill('<i class="fa-solid fa-star"></i>').join('');

    const div = document.createElement('div');
    div.className = 'review-card';
    div.style.cssText = 'background:#fff; padding:20px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.05); border-left: 4px solid var(--primary-col); animation: fadeIn 0.5s;';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <strong style="color:#333;">${name}</strong>
            <span style="color:#f7b70b;">${stars}</span>
        </div>
        <p style="color:#666; font-style: italic; line-height: 1.6;">"${text}"</p>
    `;
    list.prepend(div);

    document.getElementById('review-name').value = '';
    document.getElementById('review-text').value = '';
    document.getElementById('review-image').value = '';
}

// --- Scrolling Spy Logic ---
function navScrollSpy() {
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a.nav-btn');

    let current = '';
    sections.forEach(sec => {
        const sectionTop = sec.offsetTop;
        if (scrollY >= sectionTop - 150) {
            current = sec.getAttribute('id');
        }
    });

    navLinks.forEach(li => {
        li.classList.remove('active');
        if (current && li.getAttribute('href') == `#${current}`) {
            li.classList.add('active');
        }
    });
}
window.addEventListener('scroll', navScrollSpy);

// Render Menus
function renderMenus(menuData) {
    menuGrid.innerHTML = '';
    if (menuData.length === 0) {
        menuGrid.innerHTML = '<p style="text-align:center; width: 100%;">Tidak ada menu yang tersedia saat ini.</p>';
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
            <div class="menu-info" style="text-align: center;">
                <div style="display:flex; justify-content:center; align-items:center; margin-bottom: 5px; gap: 10px;">
                    <span class="menu-category" style="margin:0; display:inline-block; font-size: 0.75rem; color: var(--primary-col); font-weight:800;">${menu.category || 'UMUM'}</span>
                    ${stockBadge}
                </div>
                <h3 style="color:var(--text-white); font-weight:800; font-size:1.1rem;">${menu.name}</h3>
                <div class="menu-price" style="display:block; font-size:1rem; font-weight:700; color:var(--text-muted); margin-top:5px; text-decoration:line-through;">Rp ${(menu.price + 5000).toLocaleString('id-ID')}</div>
                <div class="menu-price" style="display:block; font-size:1.4rem; font-weight:900; color:#c72121; margin-top:0;">Rp ${menu.price.toLocaleString('id-ID')}</div>
                <button class="${btnClass}" style="width:80%; margin:15px auto 0 auto; padding: 10px; font-size:0.9rem; border-radius:30px; ${pointerEvents}; background:var(--primary-col); color:white; border:none; box-shadow: 0 4px 10px rgba(247,183,11,0.3); transition:0.3s" onclick="event.stopPropagation(); addToCart(${menu.id})">
                    <i class="fa-solid fa-cart-shopping"></i> BELI SEKARANG
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
        // Fetch mock map
        const mapRes = await fetch(`${API_URL}/maps`);
        const mapData = await mapRes.json();

        document.getElementById('gmaps-link').href = mapData.maps_url;
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
    const inputUangEl = document.getElementById('uang-pembeli');
    inputUangEl.value = '';

    // Ensure the event listener is locally bound to trigger instantly when typing
    inputUangEl.oninput = calculateChange;

    document.getElementById('kembalian-area').style.display = 'none';
    if (document.getElementById('checkout-error')) document.getElementById('checkout-error').textContent = '';
    checkoutModal.classList.add('show');
}

function calculateChange() {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paid = parseFloat(document.getElementById('uang-pembeli').value) || 0;

    if (paid >= totalPrice) {
        const change = paid - totalPrice;
        document.getElementById('kembalian-area').style.display = 'block';
        document.getElementById('uang-kembalian').textContent = `Rp ${change.toLocaleString('id-ID')}`;
        if (document.getElementById('checkout-error')) document.getElementById('checkout-error').textContent = '';
    } else {
        document.getElementById('kembalian-area').style.display = 'none';
        if (paid > 0 && document.getElementById('checkout-error')) {
            document.getElementById('checkout-error').textContent = 'Uang tidak cukup.';
        }
    }
}

async function processCheckout() {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paid = parseFloat(document.getElementById('uang-pembeli').value) || 0;

    if (cart.length === 0) return;
    if (paid < totalPrice) {
        if (document.getElementById('checkout-error')) document.getElementById('checkout-error').textContent = 'Harap bayar sesuai tagihan.';
        else alert('Uang pembayaran tidak cukup.');
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
            fetchMenus('all');
        } else {
            if (document.getElementById('checkout-error')) document.getElementById('checkout-error').textContent = data.msg || 'Terjadi kesalahan pada pembayaran.';
            else alert(data.msg || 'Terjadi kesalahan.');
        }
    } catch (err) {
        if (document.getElementById('checkout-error')) document.getElementById('checkout-error').textContent = 'Koneksi error.';
        else alert('Koneksi sistem terputus.');
    }
}
