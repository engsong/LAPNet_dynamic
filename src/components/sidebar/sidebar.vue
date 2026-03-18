<template>
  <div class="sidebar-wrapper" :class="{ 'sidebar-wrapper--active': isOpen }">
    <!-- Backdrop -->
    <div
      ref="backdropEl"
      class="sidebar-backdrop"
      :class="{ 'sidebar-backdrop--active': isOpen }"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <nav ref="sidebarEl" class="lapnet-sidebar" aria-label="Mobile navigation">
      <header class="sidebar-header">
        <div class="brand">
          <div class="brand-orb">
            <img src="/logolapnet/logolapnet.PNG" alt="LapNet Logo" />
          </div>

          <div class="brand-text">
            <span class="brand-title">LAPNet</span>
            <span class="brand-sub">Lao National Payment Network CO., LTD</span>
          </div>

          <button class="closeBtn" type="button" aria-label="Close menu" @click="closeSidebar">
            ✕
          </button>
        </div>
      </header>

      <ul class="sidebar-nav">
        <li class="sidebar-item active" @click="goTo('/'); closeSidebar()">
          <span class="sidebar-dot sidebar-dot--pulse"></span>
          <span>ໜ້າຫຼັກ</span>
        </li>

        <!-- Product -->
        <li class="sidebar-item has-children" :class="{ 'is-open': openKey === 'product' }">
          <div class="sidebar-item-main" @click="toggleMenu('product')">
            <span class="sidebar-dot"></span>
            <span class="sidebar-label">ຜະລິດຕະພັນ &amp; ການບໍລິການ</span>
            <span class="sidebar-arrow"></span>
          </div>

          <ul v-if="openKey === 'product'" class="sidebar-subnav">
            <li
              class="sidebar-subitem"
              @click.stop="goTo('/products_service/allproduct'); closeSidebar()"
            >
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-table-cells-large"></i>
              </span>
              <span>ຜະລິດຕະພັນ ແລະ ການບໍລິການ ທັງໝົດ</span>
            </li>

            <li
              class="sidebar-subitem"
              @click.stop="goTo('/products_service/atm-inquiry'); closeSidebar()"
            >
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-qrcode"></i>
              </span>
              <span>ກວດຍອດເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM</span>
            </li>

            <li
              class="sidebar-subitem"
              @click.stop="goTo('/products_service/atm-cash-withdraw'); closeSidebar()"
            >
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-money-bill-transfer"></i>
              </span>
              <span>ຖອນເງິນສົດຂ້າມທະນາຄານຜ່ານຕູ້ ATM</span>
            </li>

            <li
              class="sidebar-subitem"
              @click.stop="goTo('/products_service/atm-transfer'); closeSidebar()"
            >
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-right-left"></i>
              </span>
              <span>ໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM</span>
            </li>

            <li
              class="sidebar-subitem"
              @click.stop="goTo('/products_service/mobile-transfer'); closeSidebar()"
            >
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-mobile-screen"></i>
              </span>
              <span>ໂອນເງິນຂ້າມທະນາຄານເທິງມືຖື</span>
            </li>

            <li
              class="sidebar-subitem"
              @click.stop="goTo('/products_service/qr-payment'); closeSidebar()"
            >
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-money-bill-wave"></i>
              </span>
              <span>ຊຳລະຂ້າມທະນາຄານຜ່ານ LAPNet</span>
            </li>

            <li
              class="sidebar-subitem"
              @click.stop="goTo('/products_service/crossborder'); closeSidebar()"
            >
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-qrcode"></i>
              </span>
              <span>ຊຳລະຂ້າມແດນຜ່ານ QR CODE</span>
            </li>
          </ul>
        </li>

        <!-- Member -->
        <li class="sidebar-item has-children" :class="{ 'is-open': openKey === 'member' }">
          <div class="sidebar-item-main" @click="toggleMenu('member')">
            <span class="sidebar-dot"></span>
            <span class="sidebar-label">ສະມາຊິກ</span>
            <span class="sidebar-arrow"></span>
          </div>

          <ul v-if="openKey === 'member'" class="sidebar-subnav">
            <li class="sidebar-subitem" @click.stop="goTo('/member/membercardATM'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-credit-card"></i>
              </span>
              <span>ສະມາຊິກລະບົບບັດທະນາຄານຮ່ວມກັນ</span>
            </li>

            <li class="sidebar-subitem" @click.stop="goTo('/member/mobile_banking'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-mobile-screen-button"></i>
              </span>
              <span>ສະມາຊິກລະບົບຊຳລະຂ້າມທະນາຄານເທິງມືຖື</span>
            </li>

            <li class="sidebar-subitem" @click.stop="goTo('/member/crossborder'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-earth-asia"></i>
              </span>
              <span>ສະມາຊິກລະບົບຊຳລະຂ້າມແດນຜ່ານ QR Code</span>
            </li>
          </ul>
        </li>

        <li class="sidebar-item" @click="goTo('/bloggrid'); closeSidebar()">
          <span class="sidebar-dot"></span>
          <span>ຂ່າວສານ &amp; ກິດຈະກຳ</span>
        </li>

        <li class="sidebar-item" @click="goTo('/joinus'); closeSidebar()">
          <span class="sidebar-dot"></span>
          <span>ຮ່ວມງານກັບເຮົາ</span>
        </li>

        <!-- About us -->
        <li class="sidebar-item has-children" :class="{ 'is-open': openKey === 'contact' }">
          <div class="sidebar-item-main" @click="toggleMenu('contact')">
            <span class="sidebar-dot"></span>
            <span class="sidebar-label">ກ່ຽວກັບພວກເຮົາ</span>
            <span class="sidebar-arrow"></span>
          </div>

          <ul v-if="openKey === 'contact'" class="sidebar-subnav">
            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/vision'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-lightbulb"></i>
              </span>
              <span>ວິໄສທັດ ແລະ ພາລະກິດ</span>
            </li>

            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/role'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-list-check"></i>
              </span>
              <span>ພາລະບົດບາດ</span>
            </li>

            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/history'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-timeline"></i>
              </span>
              <span>ຄວາມເປັນມາ</span>
            </li>

            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/board_director'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-users-between-lines"></i>
              </span>
              <span>ສະພາບໍລິຫານ</span>
            </li>

            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/companystructureimage'); closeSidebar()">
              <span class="subicon" aria-hidden="true">
                <i class="fa-solid fa-sitemap"></i>
              </span>
              <span>ໂຄງຮ່າງການຈັດຕັ້ງ</span>
            </li>
          </ul>
        </li>

        <li class="sidebar-item" @click="goTo('/contactus'); closeSidebar()">
          <span class="sidebar-dot"></span>
          <span>ຕິດຕໍ່ພວກເຮົາ</span>
        </li>
      </ul>

      <footer class="sidebar-footer">
        <div class="footerRow">
          <div class="status-pill" @click="goTo('/contactus'); closeSidebar()">
            <span class="status-dot"></span>
            <div class="status-text">
              <span>Help Center</span>
              <small>Contact us</small>
            </div>
          </div>

        
        </div>
      </footer>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { defineExpose } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const openKey = ref(null)
const isOpen = ref(false)

const sidebarEl = ref(null)
const backdropEl = ref(null)

const viewerOpen = ref(false)
const viewerToday = ref(0)
const viewerWeek = ref(0)

const viewerPopoverEl = ref(null)
const viewerBtnEl = ref(null)

const toggleMenu = (key) => {
  openKey.value = openKey.value === key ? null : key
}

const toggleViewer = () => {
  viewerOpen.value = !viewerOpen.value
}

const closeViewer = () => {
  viewerOpen.value = false
}

const refreshViewer = () => {
  pulseViewer()
}

const pulseViewer = () => {
  if (!viewerBtnEl.value) return

  gsap.fromTo(
    viewerBtnEl.value,
    { scale: 1 },
    { scale: 1.08, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 }
  )
}

const initPosition = () => {
  if (!sidebarEl.value || !backdropEl.value) return

  gsap.set(sidebarEl.value, { x: '100%' })
  gsap.set(backdropEl.value, { opacity: 0 })
  isOpen.value = false
}

const openSidebar = () => {
  if (!sidebarEl.value) return

  isOpen.value = true

  gsap.to(sidebarEl.value, { duration: 0.45, x: 0, ease: 'power3.out' })

  if (backdropEl.value) {
    gsap.to(backdropEl.value, { duration: 0.35, opacity: 1, ease: 'power2.out' })
  }
}

const closeSidebar = () => {
  if (!sidebarEl.value) return

  isOpen.value = false
  viewerOpen.value = false

  gsap.to(sidebarEl.value, { duration: 0.4, x: '100%', ease: 'power3.inOut' })

  if (backdropEl.value) {
    gsap.to(backdropEl.value, { duration: 0.3, opacity: 0, ease: 'power2.inOut' })
  }
}

const toggleSidebar = () => {
  isOpen.value ? closeSidebar() : openSidebar()
}

const onKeydown = (e) => {
  if (e.key === 'Escape') closeViewer()
}

const goTo = (path) => {
  router.push(path)
}

onMounted(async () => {
  initPosition()
  window.addEventListener('resize', initPosition)
  window.addEventListener('keydown', onKeydown)

  await nextTick()

  if (viewerPopoverEl.value) {
    gsap.set(viewerPopoverEl.value, {
      autoAlpha: 0,
      y: 10,
      scale: 0.98,
      pointerEvents: 'none'
    })
    viewerPopoverEl.value.setAttribute('aria-hidden', 'true')
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', initPosition)
  window.removeEventListener('keydown', onKeydown)
})

defineExpose({
  openSidebar,
  closeSidebar,
  toggleSidebar
})

watch(
  () => viewerOpen.value,
  async (open) => {
    await nextTick()
    const el = viewerPopoverEl.value
    if (!el) return

    gsap.killTweensOf(el)

    if (open) {
      gsap.set(el, { pointerEvents: 'auto' })
      gsap.to(el, { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, ease: 'power2.out' })
      el.setAttribute('aria-hidden', 'false')
      pulseViewer()
    } else {
      gsap.to(el, {
        autoAlpha: 0,
        y: 10,
        scale: 0.98,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(el, { pointerEvents: 'none' })
          el.setAttribute('aria-hidden', 'true')
        }
      })
    }
  }
)
</script>

<style scoped>
.sidebar-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
}

.sidebar-wrapper--active {
  pointer-events: auto;
}

.sidebar-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.75), rgba(15, 23, 42, 0.95));
  opacity: 0;
  pointer-events: none;
}

.sidebar-backdrop--active {
  pointer-events: auto;
}

.lapnet-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(360px, 86vw);
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.25), transparent 55%),
    radial-gradient(circle at bottom right, rgba(79, 70, 229, 0.4), rgba(15, 23, 42, 1));
  border-left: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: -5px 0 60px rgba(15, 23, 42, 0.9);
  padding: 18px 18px 22px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(18px);
  pointer-events: auto;
}

.lapnet-sidebar::before {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 20px;
  border: 1px solid rgba(129, 140, 248, 0.5);
  pointer-events: none;
}

.sidebar-header {
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.4);
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.closeBtn {
  margin-left: auto;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 8, 18, 0.35);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
}

.closeBtn:hover {
  filter: brightness(1.08);
}

.brand-orb {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.7);
}

.brand-orb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-title {
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e5f0ff;
  font-weight: 600;
}

.brand-sub {
  font-size: 0.75rem;
  color: #9ca3af;
}

.sidebar-nav {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 14px;
  font-size: 1rem;
  color: #e5e7eb;
  cursor: pointer;
  transition: background 0.16s ease, transform 0.12s ease, box-shadow 0.16s ease;
}

.sidebar-item:hover {
  background: radial-gradient(circle at 0 0, rgba(59, 130, 246, 0.4), rgba(15, 23, 42, 0.9));
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.sidebar-item.active {
  background: linear-gradient(120deg, #2563eb, #22d3ee);
  color: #f9fafb;
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.9), 0 0 40px rgba(56, 189, 248, 0.7);
}

.sidebar-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #a5b4fc, #1e293b);
  box-shadow: 0 0 8px rgba(129, 140, 248, 0.8);
}

.sidebar-dot--pulse {
  position: relative;
}

.sidebar-dot--pulse::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 1px solid rgba(129, 140, 248, 0.8);
  opacity: 0.6;
  animation: sidebarPulse 2s infinite ease-out;
}

@keyframes sidebarPulse {
  0% {
    transform: scale(0.9);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.has-children {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
}

.sidebar-item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 14px;
  width: 100%;
  cursor: pointer;
  transition: background 0.16s ease, transform 0.12s ease, box-shadow 0.16s ease;
}

.has-children .sidebar-label {
  flex: 1;
}

.sidebar-item-main:hover {
  background: radial-gradient(circle at 0 0, rgba(59, 130, 246, 0.45), rgba(15, 23, 42, 0.9));
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.45);
  transform: translateY(-1px);
}

.sidebar-arrow {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
}

.sidebar-arrow::before {
  content: '▾';
  transition: transform 0.18s ease;
  color: #e5e7eb;
}

.has-children.is-open .sidebar-arrow::before {
  transform: rotate(180deg);
}

.sidebar-subnav {
  list-style: none;
  margin: 4px 0 0;
  padding: 4px 0 4px 22px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.sidebar-subitem {
  font-size: 1rem;
  padding: 6px 8px;
  border-radius: 10px;
  color: #cbd5f5;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.35);
  backdrop-filter: blur(10px);
  transition: background 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
}

.sidebar-subitem:hover {
  background: radial-gradient(circle at 0 0, rgba(56, 189, 248, 0.4), rgba(15, 23, 42, 0.95));
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.55);
  transform: translateX(2px);
}

.subicon {
  width: 20px;
  flex: 0 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  opacity: 0.95;
}

.subicon i {
  font-size: 16px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dashed rgba(148, 163, 184, 0.4);
  position: relative;
  z-index: 1;
}

.footerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-pill {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(52, 211, 153, 0.5);
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.6);
  cursor: pointer;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #bbf7d0, #22c55e);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.9);
}

.status-text {
  display: flex;
  flex-direction: column;
  font-size: 0.7rem;
  color: #e5e7eb;
}

.status-text span {
  font-size: 0.75rem;
  font-weight: 500;
}

.status-text small {
  color: #9ca3af;
}

.viewerContainer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.viewerContainer.is-open {
  z-index: 9999;
}

.viewerBtn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  background: radial-gradient(circle at 30% 20%, rgba(56, 189, 248, 0.22), rgba(15, 23, 42, 0.6));
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow:
    0 0 14px rgba(56, 189, 248, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.viewerBtn:hover {
  box-shadow:
    0 0 18px rgba(56, 189, 248, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.viewerPopover {
  position: absolute;
  right: 0;
  bottom: 52px;
  width: min(320px, 78vw);
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.848), rgba(2, 6, 23, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
  transform-origin: bottom right;
  z-index: 9999;
}

.viewerPopoverInner {
  padding: 12px;
}

.viewerTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.viewerTitle {
  font-weight: 900;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.92);
}

.viewerClose {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.viewerClose:hover {
  background: rgba(255, 255, 255, 0.1);
}

.viewerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 2px;
}

.viewerLabel {
  font-size: 12px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
}

.viewerChip {
  font-size: 12px;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
}

.chipBlue {
  border: 1px solid rgba(56, 189, 248, 0.28);
  background: rgba(56, 189, 248, 0.1);
}

.viewerActions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.viewerAction {
  flex: 1;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(56, 189, 248, 0.22);
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(14, 165, 233, 0.06));
  cursor: pointer;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.92);
}

.viewerAction:hover {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.24), rgba(14, 165, 233, 0.08));
}

.viewerAction.ghost {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}
</style>