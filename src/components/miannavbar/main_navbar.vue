<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import sidebar from '../sidebar/sidebar.vue'
import overlaynavbar from './overlaynavbar.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  breadcrumb: {
    type: Array,
    default: () => []
  },
  backgroundImage: {
    type: String,
    default: '/overlaynav/product/navigatorcontent-bg.png'
  }
})

const navbarRef = ref(null)
const logoWrapperRef = ref(null)
const logoGlowRef = ref(null)
const sidebarRef = ref(null)

const route = useRoute()

// ✅ เมนู + route แยกแต่ละอันชัดเจน
const menuItems = [
  {
    label: 'ຜະລິດຕະພັນ ແລະ ການບໍລິການ',
    to: '/products',
    children: [
      {
        label: 'ຜະລິດຕະພັນ ແລະ ການບໍລິການ ທັງໝົດ',
        to: '/products_service/allproduct',
        icon: 'ri-layout-grid-fill'
      },
      {
        label: 'ກວດຍອດເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM',
        to: '/products_service/atm-inquiry',
        icon: 'ri-qr-scan-2-line'
      },
      {
        label: 'ຖອນເງິນສົດຂ້າມທະນາຄານຜ່ານຕູ້ ATM',
        to: '/products_service/atm-cash-withdraw',
        icon: 'fa-solid fa-money-bill-transfer'
      },
      {
        label: 'ໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM',
        to: '/products_service/atm-transfer',
        icon: 'fa-solid fa-right-left'
      },
      {
        label: 'ໂອນເງິນຂ້າມທະນາຄານເທິງມືຖື',
        to: '/products_service/mobile-transfer',
        icon: 'fa-solid fa-mobile-screen'
      },
      {
        label: 'ຊຳລະຂ້າມທະນາຄານຜ່ານ LAPNet',
        to: '/products_service/qr-payment',
        icon: 'fa-solid fa-money-bill-wave'
      },
      {
        label: 'ຊຳລະຂ້າມແດນຜ່ານ QR CODE  ',
        to: '/products_service/crossborder',
        icon: 'fa-solid fa-qrcode'
      }
    ]
  },
  {
    label: 'ສະມາຊິກ',
    to: '/members',
    children: [
      {
        label: 'ສະມາຊິກລະບົບບັດທະນາຄານຮ່ວມກັນ',
        to: '/member/membercardATM',
        icon: 'fa-solid fa-credit-card'
      },
      {
        label: 'ສະມາຊິກລະບົບຊຳລະຂ້າມທະນາຄານເທິງມືຖື',
        to: '/member/mobile_banking',
        icon: 'fa-solid fa-mobile-screen-button'
      },
      {
        label: 'ສະມາຊິກລະບົບຊຳລະຂ້າມແດນຜ່ານ QR Code',
        to: '/member/crossborder',
        icon: 'fa-solid fa-earth-asia'
      }
    ]
  },
  { label: 'ຂ່າວ ແລະ ກິດຈະກຳ', to: '/bloggrid' },
  { label: 'ຮ່ວມງານກັບເຮົາ', to: '/joinus' },
  {
    label: 'ກ່ຽວກັບພວກເຮົາ',
    to: '/about',
    children: [
      { label: 'ວິໄສທັດ ແລະ ພາລະກິດ', to: '/aboutus/vision', icon: 'fa-solid fa-lightbulb' },
      { label: 'ພາລະບົດບາດ', to: '/aboutus/role', icon: 'fa-solid fa-list-check' },
      { label: 'ຄວາມເປັນມາ', to: '/aboutus/history', icon: 'fa-solid fa-timeline' },
      {
        label: 'ສະພາບໍລິຫານ',
        to: '/aboutus/board_director',
        icon: 'fa-solid fa-users-between-lines'
      },
      {
        label: 'ໂຄງຮ່າງການຈັດຕັ້ງ',
        to: '/aboutus/companystructureimage',
        icon: 'fa-solid fa-sitemap'
      }
    ]
  },
  { label: 'ຕິດຕໍ່ພວກເຮົາ', to: '/contactus', isCta: true }
]

const isDesktop = () => {
  if (typeof window === 'undefined') return true
  return window.innerWidth > 768
}

const openSidebarFromNav = () => {
  sidebarRef.value?.toggleSidebar()
}

/** =========================
 * ✅ FIX HOVER BUG (stuck)
 * - ป้องกัน dropdown ค้าง / invisible overlay block
 * - ปิด dropdown เก่าทันทีเมื่อไป hover อันใหม่
 * - ใช้ pointer-events none ตอนปิด, auto ตอนเปิด
 * - overwrite auto + killTweens กัน tween ซ้อน
 * - ใส่ delay เล็กน้อยกันหลุด gap
 * ========================= */
const openDropdownEl = ref(null)
const closeTimers = new WeakMap()

const clearCloseTimer = (dropdown) => {
  const t = closeTimers.get(dropdown)
  if (t) {
    clearTimeout(t)
    closeTimers.delete(dropdown)
  }
}

const openDropdown = (dropdown, items) => {
  if (!dropdown) return

  clearCloseTimer(dropdown)

  gsap.killTweensOf(dropdown)
  gsap.killTweensOf(items)

  // เปิดแล้วค่อยให้รับเมาส์
  gsap.set(dropdown, { pointerEvents: 'auto' })

  gsap.to(dropdown, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: 0.25,
    ease: 'power3.out',
    overwrite: 'auto'
  })

  if (items?.length) {
    gsap.fromTo(
      items,
      { x: -10, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.22,
        stagger: 0.04,
        ease: 'back.out(1.7)',
        overwrite: 'auto'
      }
    )
  }
}

const closeDropdown = (dropdown) => {
  if (!dropdown) return

  clearCloseTimer(dropdown)

  gsap.killTweensOf(dropdown)

  gsap.to(dropdown, {
    autoAlpha: 0,
    y: -8,
    scale: 0.98,
    duration: 0.18,
    ease: 'power2.in',
    overwrite: 'auto',
    onComplete: () => {
      // ปิดแล้ว “ห้ามทับ” เมนูอื่น
      gsap.set(dropdown, { pointerEvents: 'none' })
    }
  })
}

const handleMouseEnter = (event) => {
  if (!isDesktop()) return

  const el = event.currentTarget
  const dropdown = el.querySelector('.dropdown-menu')
  const items = el.querySelectorAll('.dropdown-item')

  if (!dropdown) return

  // ✅ ปิดอันที่เคยเปิดอยู่ ถ้าไม่ใช่อันเดียวกัน
  if (openDropdownEl.value && openDropdownEl.value !== dropdown) {
    closeDropdown(openDropdownEl.value)
  }

  openDropdownEl.value = dropdown
  openDropdown(dropdown, items)
}

const handleMouseLeave = (event) => {
  if (!isDesktop()) return

  const el = event.currentTarget
  const dropdown = el.querySelector('.dropdown-menu')
  if (!dropdown) return

  // ✅ delay นิดนึง กันหลุดช่องว่างระหว่างปุ่มกับ dropdown
  clearCloseTimer(dropdown)
  const t = setTimeout(() => {
    closeDropdown(dropdown)
    if (openDropdownEl.value === dropdown) openDropdownEl.value = null
  }, 120)

  closeTimers.set(dropdown, t)
}

// ✅ เปลี่ยนหน้าแล้วปิด dropdown เสมอ กันค้าง
watch(
  () => route.fullPath,
  () => {
    if (openDropdownEl.value) {
      closeDropdown(openDropdownEl.value)
      openDropdownEl.value = null
    }
  }
)

onMounted(() => {
  // ✅ กัน state ค้างตั้งแต่เริ่ม: ซ่อน + ห้ามรับเมาส์
  gsap.set('.dropdown-menu', { autoAlpha: 0, y: -8, scale: 0.98, pointerEvents: 'none' })

  const tl = gsap.timeline({
    defaults: { duration: 0.8, ease: 'power3.out' }
  })

  tl.from(navbarRef.value, { y: -40, opacity: 0 })
    .from(logoGlowRef.value, { scale: 0.6, opacity: 0 }, '-=0.5')
    .from(logoWrapperRef.value, { x: -20, opacity: 0 }, '-=0.4')
    .from('.nav-group', { y: -10, opacity: 0, stagger: 0.08 }, '-=0.4')
})
</script>

<template>
  <header ref="navbarRef" class="nav-root">
    <!-- LEFT: LOGO -->
    <RouterLink to="/">
      <div class="nav-left">
        <div ref="logoGlowRef" class="logo-glow"></div>
        <div ref="logoWrapperRef" class="logo-wrapper">
          <img src="/logolapnet/logolapnet.PNG" alt="LapNet Logo" class="logo-img" />
          <div class="logo-text-col">
            <span class="logo-text-main">LAPNet</span>
            <span class="logo-text-sub">Lao National Payment Network CO., LTD</span>
          </div>
        </div>
      </div>
    </RouterLink>

    <!-- HAMBURGER + "MENU" LABEL (shows when hamburger is visible) -->
    <button class="nav-toggle" type="button" aria-label="Open menu" @click="openSidebarFromNav">
      <svg class="nav-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 6h16M4 12h16M4 18h16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <span class="nav-toggle-label">ເມນູ</span>
    </button>

    <!-- RIGHT: DESKTOP NAV -->
    <nav class="nav-right">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        class="nav-group"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <button
          v-if="item.children"
          class="nav-item"
          type="button"
          :class="{ 'nav-cta': item.isCta, 'has-dropdown': item.children }"
        >
          {{ item.label }}
          <span class="dropdown-arrow">▼</span>
        </button>

        <RouterLink
          v-else
          class="nav-item"
          :class="{ 'nav-cta': item.isCta }"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>

        <!-- DROPDOWN MENU -->
        <div v-if="item.children" class="dropdown-menu">
          <div class="dropdown-blur-bg"></div>
          <ul class="dropdown-list">
            <li v-for="(child, cIndex) in item.children" :key="cIndex" class="dropdown-item">
              <RouterLink class="dropdown-link" :to="child.to">
                <i :class="['dropdown-icon', child.icon]" aria-hidden="true"></i>
                {{ child.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <!-- MOBILE SIDEBAR -->
  <sidebar ref="sidebarRef" />
  <div class="box-margin" style="width: 100%; height: 15vh"></div>

  <!-- OVERLAY NAVBAR -->
  <overlaynavbar
    :title="props.title"
    :breadcrumb="props.breadcrumb"
    :background-image="props.backgroundImage"
  />
</template>

<style scoped>
/* ROOT NAVBAR */
.nav-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.75rem 2.5rem;
  height: 15vh;

  background: linear-gradient(
    95deg,
    rgba(0, 18, 61, 1) 0%,
    rgba(0, 51, 171, 1) 35%,
    rgba(6, 0, 120, 1) 100%
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(72, 164, 255, 0.85);
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.7), 0 0 22px rgba(0, 60, 200, 0.5);
}

/* LEFT: LOGO CONTAINER */
.nav-left {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.logo-text-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-glow {
  position: absolute;
  inset: -16px -26px;
  background: conic-gradient(
    from 210deg,
    rgba(0, 120, 255, 0.18),
    rgba(0, 220, 255, 0.3),
    rgba(0, 120, 255, 0.18)
  );
  filter: blur(14px);
  opacity: 0.9;
  pointer-events: none;
  z-index: 0;
}

.logo-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  background: linear-gradient(120deg, #050b1bdd, #050b1bcc);
  border: 1px solid rgba(80, 170, 255, 0.9);
  box-shadow: 0 0 20px rgba(40, 140, 255, 0.45), inset 0 0 10px rgba(0, 110, 255, 0.3);
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(90, 190, 255, 0.9));
}

.logo-text-main {
  font-size: 1.1rem;
  letter-spacing: 0.15em;

  color: #eef5ff;
  font-weight: 600;
  line-height: 1;
}

.logo-text-sub {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: rgba(158, 205, 255, 0.95);
  margin-top: 2px;
}

/* RIGHT: NAV ITEMS (desktop only) */
.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-group {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-item {
  position: relative;
  border: none;
  outline: none;
  background: transparent;
  padding: 0.45rem 0.9rem;
  font-size: 1rem;
  text-transform: uppercase;
  color: #e5f0ff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  gap: 6px;
  transition: all 0.2s ease;
}

.dropdown-arrow {
  font-size: 0.5rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0.7;
}

.nav-group:hover .dropdown-arrow {
  transform: rotate(180deg);
  opacity: 1;
}

/* Hover effects */
.nav-item:hover {
  background: radial-gradient(circle at top, rgba(40, 130, 255, 0.35), transparent 65%);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(120, 200, 255, 0.6);
}

/* DROPDOWN MENU */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  padding-top: 15px;

  /* ✅ สำคัญมาก กัน invisible overlay block */
  pointer-events: none;

  /* (ปล่อยให้ GSAP คุม autoAlpha) */
  visibility: hidden;
  opacity: 0;

  z-index: 60;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 400px;
  background: rgba(5, 11, 27, 0.95);
  border: 1px solid rgba(80, 170, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 80, 200, 0.3);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.dropdown-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.dropdown-item:last-child {
  border-bottom: none;
}

/* ✅ Font Awesome icon in dropdown */
.dropdown-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  margin-right: 10px;
  font-size: 0.85rem;
  opacity: 0.9;
}

/* ใช้กับ RouterLink */
.dropdown-link {
  display: block;
  padding: 12px 20px;
  color: #b0d0ff;
  text-decoration: none;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.dropdown-link:hover {
  background: linear-gradient(90deg, rgba(0, 60, 150, 0.4), transparent);
  color: #fff;
  padding-left: 28px;
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.8);
}

.dropdown-link:hover .dropdown-icon {
  transform: translateX(2px);
}

.dropdown-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #00d4ff;
  opacity: 0;
  transition: opacity 0.2s;
}

.dropdown-link:hover::before {
  opacity: 1;
}

/* CTA BUTTON */
.nav-cta {
  background: linear-gradient(135deg, #3a9bff, #7ce3ff);
  color: #021325;
  font-weight: 600;
  box-shadow: 0 0 22px rgba(100, 190, 255, 0.7);
}
.nav-cta:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 0 26px rgba(120, 205, 255, 0.9);
}

/* HAMBURGER (icon + Menu label) */
.nav-toggle {
  display: none; /* show on mobile only */
  border: none;
  background: rgba(5, 11, 27, 0.45);
  border: 1px solid rgba(80, 170, 255, 0.55);
  color: #e5f0ff;
  cursor: pointer;

  padding: 0.55rem 0.85rem;
  border-radius: 12px;

  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  box-shadow: 0 0 18px rgba(40, 140, 255, 0.35), inset 0 0 10px rgba(0, 110, 255, 0.18);

  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 22px rgba(120, 205, 255, 0.55), inset 0 0 12px rgba(0, 110, 255, 0.22);
}

.nav-toggle-icon {
  width: 22px;
  height: 22px;
}

.nav-toggle-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* RESPONSIVE */
@media (max-width: 992px) {
  .logo-text-sub {
    display: none;
  }
  .nav-item {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .nav-root {
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: 0.6rem 1.25rem;
  }

  .nav-right {
    display: none;
  }

  /* show hamburger on mobile */
  .nav-toggle {
    display: inline-flex;
  }
}
</style>
