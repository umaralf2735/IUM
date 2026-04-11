const API_URL = 'http://127.0.0.1:5000/api';

const menuGrid = document.getElementById('menu-grid');
const categoryFilter = document.getElementById('category-filter');
const loader = document.getElementById('loader');
const cartTotalEl = document.getElementById('cart-total');
const btnCheckout = document.getElementById('btn-checkout');

const menuModal = document.getElementById('menu-modal');
const closeMenuModalBtn = document.getElementById('close-menu-modal');
const mapsModal = document.getElementById('maps-modal');
const closeMapsModalBtn = document.getElementById('close-maps-modal');

let menus = [];
let categories = [];
let currentCategory = 'all';

// Carousel Logic
let slideIndex = 1;

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("carousel-slide");
    let dots = document.getElementsByClassName("dot");
    if (slides.length === 0) return;
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMenus('all');
    fetchCategories();
    showSlides(slideIndex);

    if (document.getElementById('search-menu-input')) {
        document.getElementById('search-menu-input').addEventListener('input', filterMenus);
    }

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

    window.addEventListener('click', (e) => {
        if (e.target === menuModal) closeMenuModal();
        if (e.target === mapsModal) closeMapsModal();
    });
    if (closeMapsModalBtn) closeMapsModalBtn.addEventListener('click', closeMapsModal);
    if (closeMenuModalBtn) closeMenuModalBtn.addEventListener('click', closeMenuModal);

    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

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
            const walk = (x - startX) * 2;
            menuGrid.scrollLeft = scrollLeft - walk;
        });
    }


});

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

async function fetchCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error("Gagal mengambil data kategori");
        categories = await res.json();

        const filterContainer = document.getElementById('category-filter');
        // Keep the 'Semua' button, append the rest
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.id = cat.name;
            btn.style.border = 'none';
            btn.style.color = 'var(--text-muted)';
            btn.textContent = cat.name;
            filterContainer.appendChild(btn);
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const catId = e.target.dataset.id;
                handleCategoryClick(e, catId);
            });
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
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

    currentCategory = categoryName;
    filterMenus();
}

function filterMenus() {
    let filtered = menus;
    const searchInput = document.getElementById('search-menu-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    if (currentCategory !== 'all') {
        filtered = filtered.filter(m => {
            const mCat = String(m.category || '').toLowerCase();
            return mCat === currentCategory.toLowerCase();
        });
    }

    if (searchTerm) {
        filtered = filtered.filter(m => {
            const mName = String(m.name || '').toLowerCase();
            const mDesc = String(m.description || '').toLowerCase();
            return mName.includes(searchTerm) || mDesc.includes(searchTerm);
        });
    }

    renderMenus(filtered);
}

function submitReview() {
    const name = document.getElementById('review-name').value;
    const rating = document.getElementById('review-rating').value;
    const text = document.getElementById('review-text').value;

    if (!name || !text) {
        alert("Nama dan Cerita harus diisi ya!");
        return;
    }

    alert("Terima kasih! Review dan momen Anda telah berhasil dikirim.");

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

        card.innerHTML = `
            ${imgHTML}
            <div class="menu-info" style="text-align: center;">
                <div style="display:flex; justify-content:center; align-items:center; margin-bottom: 5px; gap: 10px;">
                    <span class="menu-category" style="margin:0; display:inline-block; font-size: 0.75rem; color: var(--primary-col); font-weight:800;">${menu.category || 'UMUM'}</span>
                    ${stockBadge}
                </div>
                <h3 style="color:var(--text-white); font-weight:800; font-size:1.1rem;">${menu.name}</h3>
                <div class="menu-price" style="display:block; font-size:1rem; font-weight:700; color:var(--text-muted); margin-top:5px; text-decoration:line-through;">Rp ${(menu.price + 5000).toLocaleString('id-ID')}</div>
                <div class="menu-price" style="display:block; font-size:1.4rem; font-weight:900; color:#c72121; margin-top:0; margin-bottom:15px;">Rp ${menu.price.toLocaleString('id-ID')}</div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

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
            imgEl.style.display = 'none';
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

function closeMapsModal() {
    mapsModal.classList.remove('show');
}

async function openMapsModal() {
    try {

        const mapRes = await fetch(`${API_URL}/maps`);
        const mapData = await mapRes.json();

        document.getElementById('gmaps-link').href = mapData.maps_url;
        mapsModal.classList.add('show');
    } catch (error) {
        console.error("Failed map", error);
        alert("Gagal memuat layanan Maps.");
    }
}
