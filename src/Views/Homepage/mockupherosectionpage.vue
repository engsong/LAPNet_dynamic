<template>
  <div class="page">
    <!-- ✅ GSAP Loading Overlay (Glow Logo) -->
    <div class="loaderOverlay" v-show="loading" ref="loaderRef" aria-busy="true" aria-live="polite">
      <div class="loaderCard">
        <div class="logoWrap">
          <div class="halo" ref="haloRef" aria-hidden="true"></div>

          <img class="loaderLogo" :src="logoSrc" alt="LAPNet" ref="loaderLogoRef" draggable="false" />
        </div>

        <div class="loaderMeta">
          <div class="loaderTitle">Lao National Payment Network CO., LTD</div>

          <div class="loaderBar" aria-hidden="true">
            <div class="loaderBarFill" ref="barFillRef"></div>
          </div>

          <div class="loaderDots" ref="dotsRef" aria-hidden="true">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Sidebar -->
    <homepage_sidebar v-model="sidebarOpen" />

    <div class="wrap">
      <!-- Top Nav -->
      <header class="topbar" ref="navRef">
        <div class="brand">
          <span class="brandDot" aria-hidden="true" style="width: 60px; height: 60px">
            <img src="/logolapnet/fullcircle.png" alt="" />
          </span>
          <span style="font-size: var(--fs-lapnet)">LAPNet</span>
        </div>

        <nav class="nav" @keydown.esc="closeMenu">
          <productDropdown />
          <memberdropdown />

          <router-link to="/bloggrid" class="navLink">ຂ່າວສານ ແລະ ກິດຈະກຳ</router-link>
          <router-link to="/joinus" class="navLink">ຮ່ວມງານກັບເຮົາ</router-link>
          <aboutusdropdown />

          <router-link to="/contactus" class="navLink">ຕິດຕໍ່ພວກເຮົາ</router-link>
        </nav>

        <div class="actions">
          <!-- ✅ hamburger: click -> open sidebar -->
          <button class="hamburger" type="button" aria-label="Open menu" @click="openSidebar">
            <i class="fa-solid fa-bars" aria-hidden="true"></i>
            <span class="hamburgerText">ເມນູ</span>
          </button>

          <!-- Facebook -->
          <a class="iconLink" href="https://www.facebook.com/laonationalpaymentnetwork" target="_blank" rel="noopener"
            aria-label="Facebook" title="Facebook">
            <i class="fa-brands fa-facebook-f"></i>
          </a>

          <!-- Email -->
          <a class="iconLink" href="http://103.27.200.222/roundcube/" target="_blank" aria-label="Email" title="Email">
            <i class="fa-solid fa-envelope"></i>
          </a>

          <!-- Login -->
          <a href="http://localhost:5173/login" target="_blank"> 
                <button class="btn btnGhost">ເຂົ້າສູ່ລະບົບ</button>

                </a>
         
       
      
        </div>
      </header>

      <!-- Hero -->
      <main class="hero">
        <div class="orbs" aria-hidden="true">
          <div class="orb orbA" ref="orbARef"></div>
          <div class="orb orbB" ref="orbBRef"></div>
          <div class="gridGlow" ref="gridRef"></div>
          <div class="sparkles" ref="sparklesRef"></div>
        </div>

        <div class="heroGrid">
          <section class="heroLeft">
            <div class="badge" ref="badgeRef">Lao National Payment Network</div>

            <h1 class="heroTitle" ref="titleRef">
              <span class="line">Anywhere <br> Anytime </span>
              <span class="line"><span class="ai"><br>Any Payment Channels</span></span>
            </h1>

            <p class="heroPara" ref="paraRef">
              ພັດທະນາລະບົບການຊໍາລະທຸລະກຳຍ່ອຍ ໃຫ້ເປັນສູນກາງການຊໍາລະຂອງບັນດາຜູ້ໃຫ້ບໍລິການຊໍາລະ ທັງພາຍໃນ ແລະ ສາກົນ, ແນໃສ່ໃຫ້ປະຊາຊົນລາວໄດ້ໃຊ້ບໍລິການຊໍາລະທີ່ສະດວກວ່ອງໄວ, ທັນສະໄໝ, ປອດໄພ ແລະ ຕົ້ນທືນຕໍ່າ.
            </p>

            <div class="ctaRow" ref="ctaRef">
              <router-link to="/products_service/allproduct">
                <button class="btn btnPrimary">ຜະລິດຕະພັນ ແລະ ການບໍລິການ ທັງໝົດ</button>
              </router-link>
              <router-link to="/contactus">
                <button class="btn btnOutline">ຕິດຕໍ່ພວກເຮົາ</button>
              </router-link>
            </div>
          </section>

          <section class="heroRight" ref="rightRef">
            <div class="mockupSlot" ref="mockupRef">

              <div class="mockupInner" :style="mockupInnerStyle">
                <atmmockup class="mockupFill" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue"
import gsap from "gsap"

import homepage_sidebar from "../../components/sidebar/homepage_sidebar.vue"
import atmmockup from "../../components/mockup/atmmockup.vue"
import productDropdown from "../../components/dropdown-homepage/product-dropdown.vue"
import memberdropdown from "../../components/dropdown-homepage/memberdropdown.vue"
import aboutusdropdown from "../../components/dropdown-homepage/aboutusdropdown.vue"
onMounted(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
});
/** ✅ Logo path */
const logoSrc = "/logolapnet/fullcircle.png"
const LOADING_MS = 500

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** ✅ Loader state + refs */
const loading = ref(true)
const loaderRef = ref(null)
const loaderLogoRef = ref(null)
const haloRef = ref(null)
const barFillRef = ref(null)
const dotsRef = ref(null)

let loaderLoopTweens = []

/** ✅ LOW POWER (mobile / reduce-motion) */
const isClient = typeof window !== "undefined"
const reduceMotion =
  isClient && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches

const viewportW = ref(isClient ? window.innerWidth : 1200)

const isMobile = computed(() => viewportW.value <= 980)
const lowPower = computed(() => !!(reduceMotion || isMobile.value))

/** ✅ ลดความละเอียด mockup บน mobile (ปรับได้ตามต้องการ) */
const mockupRenderScale = computed(() => {
  const w = viewportW.value
  if (w <= 520) return 0.72   // หนักมาก ลดเยอะ
  if (w <= 980) return 0.82   // mobile/tablet ลดกลาง ๆ
  return 1
})

const mockupInnerStyle = computed(() => {
  const s = mockupRenderScale.value
  const inv = 1 / s
  return {
    width: `${s * 100}%`,
    height: `${s * 100}%`,
    transform: `translate(-50%, -50%) scale(${inv})`,
  }
})

/** ✅ Keep intro tweens to kill later (กัน memory leak / crash) */
let introTL = null
let introTweens = []

function killAllGsap() {
  loaderLoopTweens.forEach((t) => t?.kill?.())
  loaderLoopTweens = []

  introTL?.kill?.()
  introTL = null

  introTweens.forEach((t) => t?.kill?.())
  introTweens = []

  gsap.killTweensOf([
    loaderRef.value,
    loaderLogoRef.value,
    haloRef.value,
    barFillRef.value,
    navRef.value,
    badgeRef.value,
    titleRef.value,
    paraRef.value,
    ctaRef.value,
    mockupRef.value,
    orbARef.value,
    orbBRef.value,
    gridRef.value,
    sparklesRef.value,
  ])
}

async function playLoaderAnim() {
  const overlay = loaderRef.value
  const logo = loaderLogoRef.value
  const halo = haloRef.value
  const bar = barFillRef.value
  if (!overlay || !logo || !halo || !bar) return

  const dots = dotsRef.value?.querySelectorAll?.(".dot") ?? []

  gsap.set(overlay, { autoAlpha: 1 })

  // ✅ lowPower: ไม่ loop / ไม่ทำงานหนัก
  if (lowPower.value) {
    gsap.set([logo, halo], { autoAlpha: 1, clearProps: "transform" })
    gsap.set(bar, { width: "100%" })
    return
  }

  gsap.set(logo, { autoAlpha: 0, scale: 0.92, y: 8 })
  gsap.set(halo, { autoAlpha: 0, scale: 0.85 })
  gsap.set(bar, { width: "0%" })

  loaderLoopTweens = [
    gsap.to(halo, { autoAlpha: 0.78, scale: 1.22, duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut" }),
    gsap.to(logo, { y: -2, duration: 1.0, yoyo: true, repeat: -1, ease: "sine.inOut" }),
    gsap.to(dots, { y: -6, duration: 0.32, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.12 }),
  ]

  await new Promise((resolve) => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: resolve })
    tl.to([logo, halo], { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.06 })
      .to(bar, { width: "100%", duration: 0.6, ease: "power2.inOut" }, "<0.05")
  })
}

async function hideLoader() {
  const overlay = loaderRef.value
  if (!overlay) {
    loading.value = false
    return
  }

  // ✅ kill loops ก่อน fade ออก (ลดโหลดบน mobile)
  loaderLoopTweens.forEach((t) => t?.kill?.())
  loaderLoopTweens = []

  await new Promise((resolve) => {
    gsap.to(overlay, { autoAlpha: 0, duration: 0.22, ease: "power2.out", onComplete: resolve })
  })

  loading.value = false
}

/** ✅ Sidebar state */
const sidebarOpen = ref(false)
function openSidebar() {
  sidebarOpen.value = true
  closeMenu()
}

/** refs */
const navRef = ref(null)
const badgeRef = ref(null)
const titleRef = ref(null)
const paraRef = ref(null)
const ctaRef = ref(null)
const mockupRef = ref(null)

const orbARef = ref(null)
const orbBRef = ref(null)
const gridRef = ref(null)
const sparklesRef = ref(null)

/** dropdown state */
const openMenu = ref(null)
const visible = reactive({ products: false, about: false, member: false })

const productsPanelRef = ref(null)
const memberPanelRef = ref(null)
const aboutPanelRef = ref(null)

const panelMap = {
  products: productsPanelRef,
  about: aboutPanelRef,
  member: memberPanelRef,
}

const canHover = isClient && window.matchMedia?.("(hover: hover)").matches

function closeMenu() {
  openMenu.value = null
}

function smartPosition(name) {
  const el = panelMap[name]?.value
  if (!el) return

  el.style.left = "0px"
  el.style.right = "auto"

  const pad = 12
  const rect = el.getBoundingClientRect()
  if (rect.right > window.innerWidth - pad) {
    el.style.left = "auto"
    el.style.right = "0px"
  }

  const rect2 = el.getBoundingClientRect()
  if (rect2.left < pad) {
    el.style.left = "0px"
    el.style.right = "auto"
  }
}

function animateIn(name) {
  const el = panelMap[name]?.value
  if (!el) return

  // ✅ lowPower: ไม่ใช้ blur/filter
  if (lowPower.value) {
    gsap.killTweensOf(el)
    gsap.set(el, { autoAlpha: 1, y: 0, scale: 1 })
    return
  }

  gsap.killTweensOf(el)
  gsap.set(el, { transformOrigin: "top center" })
  gsap.fromTo(
    el,
    { autoAlpha: 0, y: 10, scale: 0.985, filter: "blur(6px)" },
    { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.22, ease: "power3.out" }
  )
}

function animateOut(name, done) {
  const el = panelMap[name]?.value
  if (!el) return done?.()

  if (lowPower.value) {
    gsap.set(el, { autoAlpha: 0 })
    return done?.()
  }

  gsap.killTweensOf(el)
  gsap.to(el, { autoAlpha: 0, y: 10, scale: 0.985, filter: "blur(6px)", duration: 0.16, ease: "power2.in", onComplete: () => done?.() })
}

watch(openMenu, async (to, from) => {
  if (to) {
    visible[to] = true
    await nextTick()
    smartPosition(to)
    animateIn(to)
  }
  if (from) {
    animateOut(from, () => (visible[from] = false))
  }
})

function onDocPointerDown(e) {
  if (!navRef.value) return
  if (!navRef.value.contains(e.target)) closeMenu()
}

function onResize() {
  viewportW.value = window.innerWidth
  if (openMenu.value) smartPosition(openMenu.value)
}

/** ✅ Premium intro AFTER loader (atmmockup: NO BLUR) */
function runIntroPremium() {
  const lines = titleRef.value?.querySelectorAll(".line") ?? []

  const nav = navRef.value
  const badge = badgeRef.value
  const para = paraRef.value
  const cta = ctaRef.value
  const mock = mockupRef.value

  const textTargets = [badge, ...lines, para, cta].filter(Boolean)
  const allTargets = [nav, ...textTargets, mock].filter(Boolean)

  // ✅ lowPower: no blur/filter, no infinite background loops
  if (lowPower.value) {
    gsap.set(allTargets, { autoAlpha: 0, y: 12 })

    introTL = gsap.timeline({ defaults: { ease: "power3.out" } })
    introTL
      .to(nav, { autoAlpha: 1, y: 0, duration: 0.35 })
      .to(badge, { autoAlpha: 1, y: 0, duration: 0.28 }, "-=0.18")
      .to(lines, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08 }, "-=0.12")
      .to(para, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.18")
      .to(cta, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.22")
      .to(mock, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.22")

    return
  }

  // ✅ desktop/full: blur เฉพาะ text, mockup ไม่ blur
  gsap.set(allTargets, { autoAlpha: 0 })
  gsap.set(textTargets, { y: 18, filter: "blur(12px)" })
  gsap.set(nav, { y: 10, filter: "blur(6px)" })
  gsap.set(mock, { y: 22, scale: 0.98 }) // ✅ NO blur on mockup

  introTL = gsap.timeline({ defaults: { ease: "power3.out" } })
  introTL
    .to(nav, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55 })
    .to(badge, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45 }, "-=0.25")
    .to(lines, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.12 }, "-=0.15")
    .to(para, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5 }, "-=0.28")
    .to(cta, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5 }, "-=0.32")
    .to(mock, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }, "-=0.45") // ✅ NO blur animate

  // ✅ loop animations (store for kill)
  if (mock) {
    introTweens.push(
      gsap.to(mock, { y: -10, rotation: 0.6, duration: 4.8, yoyo: true, repeat: -1, ease: "sine.inOut" })
    )
  }
  introTweens.push(gsap.to(orbARef.value, { x: 18, y: -14, duration: 7.2, yoyo: true, repeat: -1, ease: "sine.inOut" }))
  introTweens.push(gsap.to(orbBRef.value, { x: -14, y: 16, duration: 8.4, yoyo: true, repeat: -1, ease: "sine.inOut" }))
  introTweens.push(gsap.to(gridRef.value, { opacity: 0.52, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" }))
  introTweens.push(gsap.to(sparklesRef.value, { backgroundPosition: "260px 0px", duration: 12, repeat: -1, ease: "none" }))
}

onMounted(async () => {
  await nextTick()
  viewportW.value = window.innerWidth

  if (lowPower.value) {
    loading.value = false
    runIntroPremium()
  } else {
    const start = performance.now()

    await playLoaderAnim()

    const elapsed = performance.now() - start
    const remain = Math.max(0, LOADING_MS - elapsed)
    if (remain) await sleep(remain)

    await hideLoader()
    runIntroPremium()
  }

  // ✅ use boolean capture so removeEventListener works reliably
  document.addEventListener("pointerdown", onDocPointerDown, true)
  window.addEventListener("resize", onResize)
})

onBeforeUnmount(() => {
  killAllGsap()
  document.removeEventListener("pointerdown", onDocPointerDown, true)
  window.removeEventListener("resize", onResize)
})
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

* {
  box-sizing: border-box;
}

/* ✅ Loader (Glow Logo) */

.loaderOverlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(900px 560px at 50% 40%, rgba(43, 109, 255, 0.22), transparent 62%),
    radial-gradient(700px 520px at 20% 60%, rgba(86, 204, 255, 0.14), transparent 58%),
    rgba(4, 8, 23, 1);
  backdrop-filter: blur(14px);
}

/* ✅ Modern Primary Button */
.btnPrimary {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.95);

  background: linear-gradient(90deg,
      rgba(0, 101, 201, 1) 35%,
      rgba(46, 138, 158, 1) 100%);

  box-shadow:
    0 14px 34px rgba(0, 101, 201, 0.25),
    0 10px 22px rgba(0, 0, 0, 0.25);

  transform: translateZ(0);
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease;
}

/* subtle “shine” */
.btnPrimary::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background: radial-gradient(120px 60px at 25% 20%,
      rgba(255, 255, 255, 0.22),
      transparent 65%);
  opacity: 0.85;
  pointer-events: none;
}

.btnPrimary:hover {
  transform: translateY(-1px);
  filter: brightness(1.05) saturate(1.05);
  box-shadow:
    0 18px 44px rgba(0, 101, 201, 0.32),
    0 14px 26px rgba(0, 0, 0, 0.28);
}

.btnPrimary:active {
  transform: translateY(0px) scale(0.99);
  filter: brightness(0.98);
}

.btnPrimary:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(86, 204, 255, 0.28),
    0 18px 44px rgba(0, 101, 201, 0.28);
}

.btnPrimary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.loaderCard {
  width: min(520px, 92vw);
  padding: 26px 22px 20px;
  border-radius: 22px;
  border: 1px solid rgba(110, 165, 255, 0.22);
  background: rgba(5, 10, 30, 0.38);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.55);
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 18px;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.loaderCard::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: radial-gradient(600px 180px at 30% 10%, rgba(86, 204, 255, 0.16), transparent 65%);
  pointer-events: none;
}


.logoWrap {
  position: relative;
  width: 150px;
  height: 150px;
  display: grid;
  place-items: center;
}

.halo {
  position: absolute;
  inset: -18px;
  border-radius: 999px;
  background: radial-gradient(circle at 50% 50%, rgba(86, 204, 255, 0.22) 0%, rgba(43, 109, 255, 0.12) 35%, transparent 70%);
  filter: blur(10px);
  mix-blend-mode: screen;
  pointer-events: none;
}

.loaderLogo {
  width: 86px;
  height: 86px;
  object-fit: contain;
  filter: drop-shadow(0 0 22px rgba(43, 109, 255, 0.28)) drop-shadow(0 0 40px rgba(86, 204, 255, 0.12));
  user-select: none;
}

.loaderMeta {
  position: relative;
  z-index: 1;
}

.loaderTitle {
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  margin-bottom: 12px;
}

.loaderBar {
  height: 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.loaderBarFill {
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(43, 109, 255, 0.95), rgba(86, 204, 255, 0.35));
  box-shadow: 0 12px 28px rgba(43, 109, 255, 0.22);
}

.loaderDots {
  display: inline-flex;
  gap: 8px;
  margin-top: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(86, 204, 255, 0.75);
  box-shadow: 0 0 16px rgba(86, 204, 255, 0.2);
}

/* Dark Blue Theme */
.page {
  --bg: #040817;
  --text: rgba(255, 255, 255, 0.92);
  --muted: rgba(255, 255, 255, 0.68);
  --stroke: rgba(255, 255, 255, 0.1);
  --stroke2: rgba(110, 165, 255, 0.28);
  --blue: #2b6dff;
  --cyan: #56ccff;
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.62);

  min-height: 100vh;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: var(--text);
  overflow-x: hidden;

  background: radial-gradient(1200px 720px at 50% 46%, rgba(0, 30, 96, 0.22), transparent 62%),
    radial-gradient(900px 560px at 18% 58%, rgba(86, 204, 255, 0.14), transparent 58%),
    radial-gradient(900px 560px at 82% 38%, rgba(43, 109, 255, 0.14), transparent 58%),
    radial-gradient(1200px 900px at 50% 120%, rgba(0, 33, 134, 0.35), transparent 60%), var(--bg);
}

.wrap {
  width: min(1380px, 92vw);
  margin: 0 auto;
  padding: 26px 0 60px;
}

/* Nav */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 10px 0;
  position: relative;
  z-index: 999;
  overflow: visible;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.12em;
  font-weight: 700;
  font-size: 13px;
  user-select: none;
}

.brandDot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--cyan), var(--blue));
  box-shadow: 0 0 0 6px rgba(43, 109, 255, 0.16);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  width: 65%;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(5, 10, 30, 0.28);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 999;
  overflow: visible;
}

.navLink {
  color: #fff;
  text-decoration: none;
  font-size: var(--fs-xs);
  font-weight: 500;
}

.btn {

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 11px 16px;
  font-weight: 600;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: transform 0.18s ease, background 0.18s ease;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.iconLink {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  text-decoration: none;
}

.hamburger {
  min-width: 92px;
  height: 42px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  display: none;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

/* Hero */
.hero {
  position: relative;
  margin-top: 18px;
  padding: 44px 10px 0;
  z-index: 1;
}

.heroGrid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 28px;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(5, 10, 30, 0.22);
  backdrop-filter: blur(10px);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.heroTitle {
  margin: 16px 0 10px;
  font-size: clamp(42px, 5.1vw, 51px);
  line-height: 1.03;
  letter-spacing: -0.03em;
  font-weight: 600;
}

.ai {
  background: linear-gradient(135deg, rgba(86, 204, 255, 1), rgba(43, 109, 255, 1));
  -webkit-background-clip: text;

  background-clip: text;
  color: transparent;
  width: 100%;
  font-size: clamp(42px, 5.1vw, 50px);
  text-shadow: 0 0 40px rgba(43, 109, 255, 0.22);
}

.heroPara {
  margin: 0;
  max-width: 550px;
  font-size: 14.5px;
  text-align: justify;
    hyphens: auto;     

  line-height: 1.75;
  color: rgba(255, 255, 255, 0.72);
}

.ctaRow {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

/* ✅ mockup: NO BLUR (ทั้ง desktop+mobile) */
.mockupSlot {
  width: 100%;
  display: flex;
  align-items: center;

  justify-content: center;

  height: 720px;
  border-radius: 26px;

  opacity: 0;
  transform: translateY(22px) scale(0.98);
  will-change: transform, opacity;

  position: relative;
  overflow: hidden;
}

/* ✅ render smaller on mobile via inline style, then scale up */
.mockupInner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  will-change: transform;
}

.mockupFill {
  width: 100%;
  height: 100%;
  display: block;
}

/* background ornaments */
.orbs {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 999px;
  filter: blur(28px);
  opacity: 0.55;
}

.gridGlow {
  position: absolute;
  inset: 0;
  opacity: 0.38;
}

.sparkles {
  position: absolute;
  inset: 0;
  opacity: 0.3;
}

/* responsive */
@media (max-width: 980px) {
  .nav {
    display: none;
  }

  .hamburger {
    display: inline-flex;
  }

  .heroGrid {
    grid-template-columns: 1fr;
  }

  .mockupSlot {
    height: 420px;
  }

  .sparkles {
    display: none;
    /* ✅ ตัดของหนักบนมือถือ */
  }
}

@media (max-width: 520px) {
  .ctaRow {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }

  .mockupSlot {
    height: 340px;
  }
}

@media (max-width: 533px) {
  .iconLink {
    display: none;
  }
}

@media (max-width: 424px) {
  .btnGhost {
    display: none;
  }

}

/* ✅ fallback: ถ้าไม่รองรับ backdrop-filter ให้ปิด blur */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {

  .loaderOverlay,
  .nav,
  .badge,
  .btn,
  .iconLink,
  .hamburger {
    backdrop-filter: none !important;
  }
}
</style>
