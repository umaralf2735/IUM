const API_URL = 'http://127.0.0.1:5000/api';

const menuGrid = document.getElementById('menu-grid');
const categoryFilter = document.getElementById('category-filter');
const loader = document.getElementById('loader');

const menuModal = document.getElementById('menu-modal');
const closeMenuModalBtn = document.getElementById('close-menu-modal');
const mapsModal = document.getElementById('maps-modal');
const closeMapsModalBtn = document.getElementById('close-maps-modal');

const FALLBACK_CATEGORIES = [
    { id: 1, name: 'Mie & Makanan' },
    { id: 2, name: 'Minuman & Kopi' },
    { id: 3, name: 'Snack & Camilan' }
];

const FALLBACK_MENUS = [
    {
        id: 101,
        name: 'Indomie Goreng Original',
        description: 'Mi goreng legendaris disajikan hangat lengkap dengan taburan bawang goreng renyah.',
        price: 7000,
        category: 'Mie & Makanan',
        local_img: 'images/v42_813.png',
        stock: 25
    },
    {
        id: 102,
        name: 'Indomie Goreng Pedas',
        description: 'Mi goreng dengan sensasi pedas nikmat yang bikin melek dan makin semangat.',
        price: 7000,
        category: 'Mie & Makanan',
        local_img: 'images/v42_812.png',
        stock: 20
    },
    {
        id: 103,
        name: 'Indomie Goreng Rendang',
        description: 'Perpaduan bumbu rendang autentik yang kaya rempah dan gurih di setiap suapan.',
        price: 7500,
        category: 'Mie & Makanan',
        local_img: 'images/v42_814.png',
        stock: 18
    },
    {
        id: 104,
        name: 'Indomie Goreng Cabe Ijo',
        description: 'Aroma dan pedas khas cabai hijau pilihan yang khas dan menggugah selera.',
        price: 7500,
        category: 'Mie & Makanan',
        local_img: 'images/v42_815.png',
        stock: 15
    },
    {
        id: 105,
        name: 'Pop Mie Ayam Bawang',
        description: 'Mi kuah cup praktis dengan kaldu ayam bawang hangat, cocok untuk teman nongkrong malam.',
        price: 8000,
        category: 'Mie & Makanan',
        local_img: 'images/v42_821.png',
        stock: 14
    },
    {
        id: 106,
        name: 'Pop Mie Goreng Spesial',
        description: 'Pop Mie varian goreng spesial yang praktis, kenyang, dan nikmat disantap kapan saja.',
        price: 8000,
        category: 'Mie & Makanan',
        local_img: 'images/v42_822.png',
        stock: 16
    },
    {
        id: 107,
        name: 'Es Good Day & Nutrisari',
        description: 'Pilihan minuman dingin menyegarkan: Good Day Freeze, Cappuccino, hingga aneka rasa Nutrisari.',
        price: 5000,
        category: 'Minuman & Kopi',
        local_img: 'images/v1_162.webp',
        stock: 30
    },
    {
        id: 108,
        name: 'Roti Sisir & Wafer Nabati',
        description: 'Aneka camilan manis dan gurih pendamping ngopi santai di Warkop Ayah.',
        price: 3000,
        category: 'Snack & Camilan',
        local_img: 'images/v1_157.webp',
        stock: 22
    }
];

let menus = [];
let categories = [];
let currentCategory = 'all';

let slideIndex = 1;
let autoSlideTimer = null;

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    const track = document.getElementById("carousel-track");
    const slides = document.getElementsByClassName("carousel-slide");
    const dots = document.getElementsByClassName("dot");
    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    if (track) {
        track.style.transition = "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)";
        track.style.transform = `translateX(-${(slideIndex - 1) * 100}%)`;
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].className += " active";
    }
}

function initHeroSwipe() {
    const container = document.getElementById("hero-carousel");
    const track = document.getElementById("carousel-track");
    if (!container || !track) return;

    let isDragging = false;
    let startX = 0;
    let currentDeltaX = 0;

    const getClientX = (e) => (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;

    const onStart = (e) => {
        isDragging = true;
        startX = getClientX(e);
        currentDeltaX = 0;
        track.style.transition = "none";
        if (autoSlideTimer) clearInterval(autoSlideTimer);
    };

    const onMove = (e) => {
        if (!isDragging) return;
        const x = getClientX(e);
        currentDeltaX = x - startX;
        const width = container.offsetWidth || 1;
        const basePercent = -(slideIndex - 1) * 100;
        const dragPercent = (currentDeltaX / width) * 100;
        track.style.transform = `translateX(${basePercent + dragPercent}%)`;
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        const width = container.offsetWidth || 1;
        const threshold = Math.min(70, width * 0.18);

        if (currentDeltaX < -threshold) {
            changeSlide(1);
        } else if (currentDeltaX > threshold) {
            changeSlide(-1);
        } else {
            showSlides(slideIndex);
        }

        autoSlideTimer = setInterval(() => changeSlide(1), 6000);
    };

    container.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    container.addEventListener("touchstart", onStart, { passive: true });
    container.addEventListener("touchmove", onMove, { passive: true });
    container.addEventListener("touchend", onEnd);
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchMenus('all');
    await fetchCategories();
    showSlides(slideIndex);
    initHeroSwipe();

    // Auto-advance hero slide every 6 seconds
    autoSlideTimer = setInterval(() => {
        changeSlide(1);
    }, 6000);

    // Secret entry step for admin: 5 clicks on footer logo within 2 seconds
    let secretClickCount = 0;
    let secretClickTimer;
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        footerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            secretClickCount++;
            clearTimeout(secretClickTimer);
            if (secretClickCount >= 5) {
                window.location.href = 'admin/login.html';
            }
            secretClickTimer = setTimeout(() => {
                secretClickCount = 0;
            }, 1000);
        });
    }

    const searchMenuInput = document.getElementById('search-menu-input');
    const navSearchInput = document.getElementById('nav-search-input');

    if (searchMenuInput) {
        searchMenuInput.addEventListener('input', () => {
            if (navSearchInput) navSearchInput.value = searchMenuInput.value;
            filterMenus();
        });
    }

    if (navSearchInput) {
        navSearchInput.addEventListener('input', () => {
            if (searchMenuInput) searchMenuInput.value = navSearchInput.value;
            filterMenus();
        });
        navSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const prodSec = document.getElementById('products');
                if (prodSec) prodSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (document.getElementById('nav-maps')) {
        document.getElementById('nav-maps').addEventListener('click', (e) => {
            e.preventDefault();
            openMapsModal();
        });
    }

    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinksEl = document.querySelector('.new-nav .nav-links');
    if (mobileToggle && navLinksEl) {
        mobileToggle.addEventListener('click', () => {
            navLinksEl.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.className = navLinksEl.classList.contains('open')
                    ? 'fa-solid fa-xmark'
                    : 'fa-solid fa-bars';
            }
        });
        navLinksEl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksEl.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            });
        });
    }

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
});

async function fetchMenus(categoryId = '') {
    loader.style.display = 'block';
    menuGrid.innerHTML = '';
    try {
        const url = (categoryId && categoryId !== 'all') ? `${API_URL}/menus?category_id=${categoryId}` : `${API_URL}/menus`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil data produk");
        const data = await res.json();
        menus = (Array.isArray(data) && data.length > 0) ? data : FALLBACK_MENUS;
        renderMenus(menus);
    } catch (error) {
        console.warn('Backend API tidak aktif atau kosong, menampilkan katalog default:', error);
        menus = FALLBACK_MENUS;
        renderMenus(menus);
    } finally {
        loader.style.display = 'none';
    }
}

function bindCategoryButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.currentTarget;
            const catId = targetBtn.dataset.id;
            handleCategoryClick(targetBtn, catId);
        });
    });
}

async function fetchCategories() {
    const filterContainer = document.getElementById('category-filter');
    filterContainer.innerHTML = '<button class="filter-btn active" data-id="all"><i class="fa-solid fa-border-all"></i> Semua</button>';

    let apiCats = [];
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) apiCats = data;
        }
    } catch (error) {
        // Akan dilengkapi dari kategori yang ada pada daftar menu
    }

    const catMap = new Map();
    apiCats.forEach(c => {
        if (c && c.name) catMap.set(String(c.name).trim().toLowerCase(), String(c.name).trim());
    });
    menus.forEach(m => {
        if (m && m.category) {
            const name = String(m.category).trim();
            const key = name.toLowerCase();
            if (name && !catMap.has(key)) {
                catMap.set(key, name);
            }
        }
    });

    if (catMap.size === 0) {
        FALLBACK_CATEGORIES.forEach(c => catMap.set(c.name.toLowerCase(), c.name));
    }

    categories = Array.from(catMap.values()).map((name, idx) => ({ id: idx + 1, name }));

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.id = cat.name;
        btn.textContent = cat.name;
        filterContainer.appendChild(btn);
    });

    bindCategoryButtons();
}

function handleCategoryClick(targetBtn, categoryName) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    targetBtn.classList.add('active');
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
        menuGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: #6b7280; padding: 30px 0;">Tidak ada menu yang cocok dengan pencarian Anda.</p>';
        return;
    }

    menuData.forEach(menu => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.addEventListener('click', () => openMenuDetail(menu.id));

        const imgSrc = menu.image_url
            ? `http://127.0.0.1:5000${menu.image_url}`
            : (menu.local_img || null);

        const imgHTML = imgSrc
            ? `<div class="menu-img-box"><img src="${imgSrc}" alt="${menu.name}" class="menu-img"></div>`
            : `<div class="img-fallback"><i class="fa-solid fa-mug-hot"></i></div>`;

        const stockBadge = (menu.stock > 0)
            ? `<span class="menu-stock-pill in-stock">Stok: ${menu.stock}</span>`
            : `<span class="menu-stock-pill out-stock">Habis</span>`;

        const subDesc = menu.description || 'Cita rasa khas Warkop Ayah';

        card.innerHTML = `
            ${imgHTML}
            <div class="menu-info">
                <div class="menu-meta-row">
                    <span class="menu-cat-pill">${menu.category || 'Menu'}</span>
                    ${stockBadge}
                </div>
                <h3>${menu.name}</h3>
                <p class="menu-subdesc">${subDesc}</p>
                <div class="menu-price-row">
                    <span class="menu-price-main">Rp ${menu.price.toLocaleString('id-ID')}</span>
                </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

async function openMenuDetail(id) {
    let menu = menus.find(m => m.id === id);

    try {
        const res = await fetch(`${API_URL}/menus/${id}`);
        if (res.ok) {
            menu = await res.json();
        }
    } catch (error) {
        // Fallback to local menu item if API is offline
    }

    if (!menu) return;

    document.getElementById('modal-title').textContent = menu.name;
    document.getElementById('modal-category').textContent = menu.category || 'Umum';
    document.getElementById('modal-price').textContent = `Rp ${menu.price.toLocaleString('id-ID')}`;
    document.getElementById('modal-desc').textContent = menu.description || 'Disajikan hangat dengan kualitas terbaik khas Warkop Ayah.';

    const imgEl = document.getElementById('modal-img');
    const imgSrc = menu.image_url
        ? `http://127.0.0.1:5000${menu.image_url}`
        : (menu.local_img || null);

    if (imgSrc) {
        imgEl.src = imgSrc;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    menuModal.classList.add('show');
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
        if (mapRes.ok) {
            const mapData = await mapRes.json();
            if (mapData.maps_url) {
                document.getElementById('gmaps-link').href = mapData.maps_url;
            }
        }
    } catch (error) {
        // Keep default Google Maps URL in anchor tag
    }
    mapsModal.classList.add('show');
}
