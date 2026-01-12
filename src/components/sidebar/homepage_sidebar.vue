<template>
  <div class="sidebar-wrapper" :class="{ 'sidebar-wrapper--active': modelValue }">
    <!-- Backdrop -->
    <div
      ref="backdropEl"
      class="sidebar-backdrop"
      :class="{ 'sidebar-backdrop--active': modelValue }"
      @click="emitClose"
    />

    <!-- Sidebar -->
    <nav ref="sidebarEl" class="lapnet-sidebar" aria-label="Mobile navigation">
      <header class="sidebar-header">
        <div class="brand">
          <div class="brand-orb">
            <img :src="logoSrc" alt="logo" />
          </div>

          <div class="brand-text">
            <span class="brand-title">{{ companyName }}</span>
            <span class="brand-sub">{{ companyTagline }}</span>
          </div>

          <button class="closeBtn" type="button" aria-label="Close menu" @click="emitClose">✕</button>
        </div>
      </header>

      <ul class="sidebar-nav">
        <li class="sidebar-item active" @click="goTo('/')">
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
            <li class="sidebar-subitem" @click.stop="goTo('/products_service/atm-inquiry')">ກວດຍອດເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM</li>
            <li class="sidebar-subitem" @click.stop="goTo('/products_service/atm-cash-withdraw')">ຖອນເງິນສົດຂ້າມທະນາຄານຜ່ານຕູ້ ATM</li>
            <li class="sidebar-subitem" @click.stop="goTo('/products_service/atm-transfer')">ໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM</li>
            <li class="sidebar-subitem" @click.stop="goTo('/products_service/mobile-transfer')">ໂອນເງິນຂ້າມທະນາຄານເທິງມືຖື</li>
            <li class="sidebar-subitem" @click.stop="goTo('/products_service/qr-payment')">ຊຳລະຂ້າມທະນາຄານຜ່ານ LAPNet</li>
            <li class="sidebar-subitem" @click.stop="goTo('/products_service/crossborder')">ຊຳລະຂ້າມແດນຜ່ານ QR CODE </li>
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
            <li class="sidebar-subitem" @click.stop="goTo('/member/membercardATM')">ສະມາຊິກລະບົບບັດທະນາຄານຮ່ວມກັນ</li>
            <li class="sidebar-subitem" @click.stop="goTo('/member/mobile_banking')">ສະມາຊິກລະບົບຊຳລະຂ້າມທະນາຄານເທິງມືຖື</li>
            <li class="sidebar-subitem" @click.stop="goTo('/member/crossborder')">ສະມາຊິກລະບົບຊຳລະຂ້າມແດນຜ່ານ QR Code </li>
          </ul>
        </li>

        <li class="sidebar-item" @click="goTo('/bloggrid')">
          <span class="sidebar-dot"></span>
          <span>ຂ່າວສານ &amp; ກິດຈະກຳ</span>
        </li>

        <li class="sidebar-item" @click="goTo('/joinus')">
          <span class="sidebar-dot"></span>
          <span>ຮ່ວມງານກັບເຮົາ</span>
        </li>

        <!-- About us -->
        <li class="sidebar-item has-children" :class="{ 'is-open': openKey === 'about' }">
          <div class="sidebar-item-main" @click="toggleMenu('about')">
            <span class="sidebar-dot"></span>
            <span class="sidebar-label">ກ່ຽວກັບພວກເຮົາ</span>
            <span class="sidebar-arrow"></span>
          </div>

          <ul v-if="openKey === 'about'" class="sidebar-subnav">
            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/vision')">ວິໄສທັດ ແລະ ພາລະກິດ</li>
            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/role')">ພາລະບົດບາດ</li>
            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/history')">ຄວາມເປັນມາ</li>
            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/board_director')">ສະພາບໍລິຫານ</li>
            <li class="sidebar-subitem" @click.stop="goTo('/aboutus/companystructureimage')">ໂຄງຮ່າງການຈັດຕັ້ງ</li>
          </ul>
        </li>

        <li class="sidebar-item" @click="goTo('/contactus')">
          <span class="sidebar-dot"></span>
          <span>ຕິດຕໍ່ພວກເຮົາ</span>
        </li>
      </ul>

      <footer class="sidebar-footer">
        <!-- ✅ Separate containers (NOT merged) -->
        <div class="footerRow">
          <!-- Help Center container -->
          <div class="status-pill" @click="goTo('/contactus')">
            <span class="status-dot"></span>
            <div class="status-text">
              <span>Help Center</span>
              <small>Contact us</small>
            </div>
          </div>

          <!-- Viewer container (new) -->
          <div class="viewerContainer" ref="viewerContainerEl">
            <button
              ref="viewerBtnEl"
              class="viewerBtn"
              type="button"
              aria-label="Open visitor overlay"
              @click.stop="toggleViewer"
            >
              <i class="fa-solid fa-eye"></i>
            </button>

            <!-- ✅ Visitor overlay (glass) -->
            <div ref="viewerPopoverEl" class="viewerPopover" aria-hidden="true" @click.stop>
              <div class="viewerPopoverInner">
                <div class="viewerTop">
                  <div class="viewerTitle">Visitor</div>
                  <button class="viewerClose" type="button" aria-label="Close" @click="closeViewer">✕</button>
                </div>

                <div class="viewerRow">
                  <span class="viewerLabel">Views today</span>
                  <span class="viewerChip">{{ viewerToday }}</span>
                </div>

                <div class="viewerRow">
                  <span class="viewerLabel">Views this week</span>
                  <span class="viewerChip chipBlue">{{ viewerWeek }}</span>
                </div>

                <div class="viewerActions">
                  <button class="viewerAction" type="button" @click="refreshViewer">↻ Refresh</button>
                  <button class="viewerAction ghost" type="button" @click="closeViewer">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import gsap from "gsap";
import { useRouter } from "vue-router";

type Props = {
  modelValue: boolean;
  logoSrc?: string;
  companyName?: string;
  companyTagline?: string;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  logoSrc: "/logolapnet/logolapnet.PNG",
  companyName: "LAPNET",
  companyTagline: "Lao National Payment Network CO., LTD",
});

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

const router = useRouter();

const sidebarEl = ref<HTMLElement | null>(null);
const backdropEl = ref<HTMLElement | null>(null);

const openKey = ref<string | null>(null);

const toggleMenu = (key: string) => {
  openKey.value = openKey.value === key ? null : key;
};

/* ===========================
   ✅ Visitor overlay state
   =========================== */
const viewerOpen = ref(false);
const viewerToday = ref(300);
const viewerWeek = ref(300);

const viewerPopoverEl = ref<HTMLElement | null>(null);
const viewerBtnEl = ref<HTMLElement | null>(null);
const viewerContainerEl = ref<HTMLElement | null>(null);

const toggleViewer = () => {
  viewerOpen.value = !viewerOpen.value;
};
const closeViewer = () => {
  viewerOpen.value = false;
};

/* ✅ fetch visitor from API (1d / 7d -> totals.pageviews) */
const VISITOR_1D_URL = "http://localhost:3000/api/visitor/stats?range=1d";
const VISITOR_7D_URL = "http://localhost:3000/api/visitor/stats?range=7d";

const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fetchPageviews = async (url: string) => {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: any = await res.json();
  return toNumber(json?.totals?.pageviews ?? 0);
};

const loadVisitor = async () => {
  try {
    const [day, week] = await Promise.all([fetchPageviews(VISITOR_1D_URL), fetchPageviews(VISITOR_7D_URL)]);
    viewerToday.value = day;
    viewerWeek.value = week;
  } catch (e) {
    console.error("Fetch visitor failed:", e);
    // keep previous values on error
  }
};

const refreshViewer = async () => {
  await loadVisitor();
  pulseViewer();
};

const pulseViewer = () => {
  if (viewerBtnEl.value) {
    gsap.fromTo(
      viewerBtnEl.value,
      { scale: 1 },
      { scale: 1.08, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }
    );
  }
};

const initPosition = () => {
  if (!sidebarEl.value || !backdropEl.value) return;
  gsap.set(sidebarEl.value, { x: "100%" });
  gsap.set(backdropEl.value, { opacity: 0 });
};

const playOpen = () => {
  if (!sidebarEl.value || !backdropEl.value) return;

  gsap.killTweensOf([sidebarEl.value, backdropEl.value]);

  gsap.to(sidebarEl.value, { duration: 0.45, x: 0, ease: "power3.out" });
  gsap.to(backdropEl.value, { duration: 0.35, opacity: 1, ease: "power2.out" });
};

const playClose = () => {
  if (!sidebarEl.value || !backdropEl.value) return;

  gsap.killTweensOf([sidebarEl.value, backdropEl.value]);

  gsap.to(sidebarEl.value, { duration: 0.4, x: "100%", ease: "power3.inOut" });
  gsap.to(backdropEl.value, { duration: 0.3, opacity: 0, ease: "power2.inOut" });

  openKey.value = null;
  viewerOpen.value = false; // ✅ close visitor overlay when sidebar closes
};

const emitClose = () => {
  viewerOpen.value = false; // ✅ close overlay too
  emit("update:modelValue", false);
};

const goTo = (path: string) => {
  router.push(path);
  emitClose();
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeViewer();
};

onMounted(async () => {
  initPosition();
  await nextTick();

  // ✅ load visitor once
  await loadVisitor();

  // init viewer popover hidden
  if (viewerPopoverEl.value) {
    gsap.set(viewerPopoverEl.value, {
      autoAlpha: 0,
      y: 10,
      scale: 0.98,
      pointerEvents: "none",
    });
  }

  window.addEventListener("keydown", onKeydown);

  if (props.modelValue) playOpen();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

watch(
  () => props.modelValue,
  async (v) => {
    await nextTick();
    v ? playOpen() : playClose();
  }
);

watch(
  () => viewerOpen.value,
  async (open) => {
    await nextTick();
    const el = viewerPopoverEl.value;
    if (!el) return;

    gsap.killTweensOf(el);

    if (open) {
      // ✅ refresh when open
      await loadVisitor();

      gsap.set(el, { pointerEvents: "auto" });
      gsap.to(el, { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out" });
      pulseViewer();
      el.setAttribute("aria-hidden", "false");
    } else {
      gsap.to(el, {
        autoAlpha: 0,
        y: 10,
        scale: 0.98,
        duration: 0.18,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(el, { pointerEvents: "none" });
          el.setAttribute("aria-hidden", "true");
        },
      });
    }
  }
);
</script>

<style scoped>
/* ✅ สำคัญ: ปิด pointer-events ตอนปิด sidebar */
.sidebar-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
}
.sidebar-wrapper--active {
  pointer-events: auto;
}

/* Backdrop */
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

/* Sidebar panel */
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

.brand-orb {
  width: 28px;
  height: 28px;
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
  font-weight: 700;
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
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 1px solid rgba(129, 140, 248, 0.8);
  opacity: 0.6;
  animation: sidebarPulse 2s infinite ease-out;
}
@keyframes sidebarPulse {
  0% { transform: scale(0.9); opacity: 0.9; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* Dropdown */
.has-children { display: flex; flex-direction: column; align-items: stretch; padding: 0; }
.sidebar-item-main { display:flex; align-items:center; gap:10px; padding: 9px 11px; border-radius:14px; width:100%; }
.has-children .sidebar-label { flex: 1; }

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
  content: "▾";
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

/* Footer */
.sidebar-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dashed rgba(148, 163, 184, 0.4);
  position: relative;
}

.footerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-pill {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(52, 211, 153, 0.5);
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.6);
  cursor: pointer;
  min-width: 200px;
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
  line-height: 1.1;
}
.status-text span { font-size: 0.75rem; font-weight: 500; }
.status-text small { color: #9ca3af; }

/* ✅ NEW viewer container */
.viewerContainer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Viewer button */
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
    inset 0 1px 0 rgba(255, 255, 255, 0.10);
}
.viewerBtn:hover {
  box-shadow:
    0 0 18px rgba(56, 189, 248, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* Visitor overlay popover (glass) */
.viewerPopover {
  position: absolute;
  right: 0;
  bottom: 52px;
  width: min(320px, 78vw);
  border-radius: 16px;
  overflow: hidden;
  z-index: 9999;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.848), rgba(2, 6, 23, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);

  transform-origin: bottom right;
}

.viewerPopoverInner { padding: 12px; }

.viewerTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
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
.viewerClose:hover { background: rgba(255, 255, 255, 0.10); }

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
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.92);
}

.chipBlue {
  border: 1px solid rgba(56, 189, 248, 0.28);
  background: rgba(56, 189, 248, 0.10);
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
