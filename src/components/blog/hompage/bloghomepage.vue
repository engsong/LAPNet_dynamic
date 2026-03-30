<template>
  <section class="card-section">
    <div class="card-header">
      <h2 class="card-title">ຂ່າວສານ ແລະ ກິດຈະກຳ</h2>
     
    </div>

    <!-- Render Swiper only after data is ready (fix autoplay not starting until drag) -->
    <Swiper
      v-if="images.length"
      :key="swiperKey"
      class="card-swiper"
      :modules="swiperModules"
      :slides-per-view="3"
      :space-between="20"
      :loop="images.length > 1"
      :speed="900"
      :autoplay="{
        delay: 2200,
        disableOnInteraction: false,
        pauseOnMouseEnter: false
      }"
      :navigation="{
        nextEl: nextBtn,
        prevEl: prevBtn
      }"
      :pagination="{
        el: paginationEl,
        clickable: true
      }"
      :breakpoints="{
        0: { slidesPerView: 1 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }"
      :centeredSlides="images.length > 1"
      :observer="true"
      :observeParents="true"
      :observeSlideChildren="true"
      @swiper="onSwiper"
    >
      <SwiperSlide v-for="item in images" :key="item.id">
        <div class="card" @click="goToBlogDetail(item.id)">
          <div class="card-inner">
            <div class="card-image-wrapper">
              <img class="card-image" :src="item.src" :alt="item.alt" />
            </div>

            <div class="card-info">
              <div class="card-info-top">
                <h3 class="card-item-title">{{ item.title }}</h3>
                <span class="card-date-chip">{{ item.date }}</span>
              </div>

              <button class="card-read-btn" @click.stop="goToBlogDetail(item.id)">
                <span class="card-read-label">Read more</span>
                <span class="card-read-orb"></span>
              </button>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Controls -->
    <div class="card-controls">
      <button ref="prevBtn" class="card-nav-btn card-nav-prev">
        <span class="card-nav-icon card-nav-icon-left"></span>
        <span class="card-nav-label">Prev</span>
      </button>

      <div ref="paginationEl" class="card-pagination"></div>

      <button ref="nextBtn" class="card-nav-btn card-nav-next">
        <span class="card-nav-label">Next</span>
        <span class="card-nav-icon card-nav-icon-right"></span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from "vue-router";

const router = useRouter();

/** Swiper modules (do not inline array in template) */
const swiperModules = [Autoplay, Navigation, Pagination];

/** Swiper instance + controls refs */
const swiperInstance = ref(null);
const prevBtn = ref(null);
const nextBtn = ref(null);
const paginationEl = ref(null);

/** Force re-mount swiper when data loaded (helps autoplay/navigation init) */
const swiperKey = ref(0);

/** Swiper data */
const images = ref([]);

// -------------------- Env-only API base (Vite) --------------------
// Required in .env (Vite):
//   VITE_API_BASE_URL=http://localhost:3000
function resolveEnvBaseUrl() {
  const raw = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  return raw.replace(/\/+$/, "");
}

function normalizeBaseUrl(u) {
  return String(u || "").trim().replace(/\/+$/, "");
}

function joinBaseAndPath(baseUrl, path) {
  const b = normalizeBaseUrl(baseUrl);
  const p = String(path || "");

  if (!b) return p;

  // Prevent double "/api"
  // - If base ends with "/api" and path starts with "/api/..." => drop one
  if (b.endsWith("/api") && /^\/api(\/|$)/i.test(p)) {
    return b + p.replace(/^\/api/i, "");
  }

  if (!p) return b;
  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

/** API base from env only */
const API_BASE = normalizeBaseUrl(resolveEnvBaseUrl());

/** Asset base for images/files (strip trailing /api for assets) */
const ASSET_BASE = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

/** News endpoint: /api/news */
const NEWS_API_URL = joinBaseAndPath(API_BASE, "/api/news");

/** Click -> send idnews to BlogDetail (route param id) */
const goToBlogDetail = (idnews) => {
  router.push({
    name: "BlogDetail",
    params: { id: idnews }
  });
};

// ---------- helpers ----------
const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYY = (input) => {
  if (input == null) return "";
  const s = String(input).trim();
  if (!s) return "";

  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const dd = pad2(m[1]);
    const mm = pad2(m[2]);
    const yy = String(m[3]).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;

  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
};

function isLoopbackHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0";
}

function rewriteBadAbsoluteToEnvBase(absoluteUrl) {
  try {
    const u = new URL(absoluteUrl);
    const fullPath = `${u.pathname || ""}${u.search || ""}`;

    // Rewrite when backend returns localhost (wrong outside local machine)
    if (isLoopbackHost(u.hostname) && ASSET_BASE) {
      return joinBaseAndPath(ASSET_BASE, fullPath);
    }

    return absoluteUrl;
  } catch {
    return absoluteUrl;
  }
}

const resolveImage = (url) => {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";

  // Absolute URL
  if (/^https?:\/\//i.test(s)) return rewriteBadAbsoluteToEnvBase(s);

  // Server absolute path (e.g. "/uploads/..") => use ASSET_BASE
  if (s.startsWith("/")) return joinBaseAndPath(ASSET_BASE, s);

  // Relative path (e.g. "uploads/..") => use ASSET_BASE
  return joinBaseAndPath(ASSET_BASE, "/" + s);
};

const safeTime = (dt) => {
  const t = new Date(dt || 0).getTime();
  return Number.isFinite(t) ? t : 0;
};

const normalizeNews = (item) => {
  const id = item?.news_id ?? item?.idnews ?? item?.id_news ?? item?.id ?? item?._id ?? null;
  if (id == null) return null;

  const title = String(item?.header_news ?? item?.title ?? "-").trim() || "-";
  const src = resolveImage(item?.hero_img ?? item?.image ?? "");
  const dateTime =
    item?.date_time ??
    item?.datetime ??
    item?.created_at ??
    item?.createdAt ??
    item?.updated_at ??
    item?.updatedAt ??
    "";
  const date = formatDDMMYY(dateTime);

  return { id, src, alt: title, title, date, dateTime };
};

/** Re-init navigation/pagination + restart autoplay after data is ready */
const reInitSwiper = async () => {
  await nextTick();

  const swiper = swiperInstance.value;
  if (!swiper) return;

  if (prevBtn.value && nextBtn.value) {
    swiper.params.navigation = swiper.params.navigation || {};
    swiper.params.navigation.prevEl = prevBtn.value;
    swiper.params.navigation.nextEl = nextBtn.value;

    swiper.navigation?.destroy?.();
    swiper.navigation?.init?.();
    swiper.navigation?.update?.();
  }

  if (paginationEl.value) {
    swiper.params.pagination = swiper.params.pagination || {};
    swiper.params.pagination.el = paginationEl.value;

    swiper.pagination?.destroy?.();
    swiper.pagination?.init?.();
    swiper.pagination?.render?.();
    swiper.pagination?.update?.();
  }

  swiper.update();

  if (swiper.params.loop) {
    swiper.loopDestroy?.();
    swiper.loopCreate?.();
    swiper.update();
  }

  swiper.autoplay?.stop?.();
  swiper.autoplay?.start?.();
};

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
  reInitSwiper();
};

const fetchNews = async () => {
  try {
    if (!API_BASE) {
      throw new Error("Missing VITE_API_BASE_URL in .env");
    }

    const res = await fetch(NEWS_API_URL, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const json = await res.json();
    const list =
      Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.news)
            ? json.news
            : Array.isArray(json?.result)
              ? json.result
              : [];

    const mapped = list.map(normalizeNews).filter(Boolean);
    mapped.sort((a, b) => safeTime(b.dateTime) - safeTime(a.dateTime));

    images.value = mapped.slice(0, 6);

    // Force Swiper to re-mount after data load
    swiperKey.value += 1;

    await reInitSwiper();
  } catch (e) {
    console.error("Fetch news failed:", e);
    images.value = [];
  }
};

onMounted(fetchNews);

watch(
  () => images.value.length,
  async () => {
    if (!images.value.length) return;
    await reInitSwiper();
  }
);
</script>

<style scoped>
.titlelapnet {
  display: flex;
  align-items: center;
}

/* === WRAPPER === */
.card-section {
  max-width: 100%;
  margin: 0 auto;
  padding: 2.8rem 1.6rem 3.2rem;
  border-radius: 1.6rem;
  background: radial-gradient(circle at top left, #1e3a8a 0%, #020617 55%),
    radial-gradient(circle at bottom right, #0ea5e9 0%, transparent 60%);
  border: 1px solid rgba(59, 130, 246, 0.7);
  box-shadow: 0 0 40px rgba(37, 99, 235, 0.75), 0 0 90px rgba(59, 130, 246, 0.55);
  overflow: hidden;
  height: 90vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1.9rem;
}

.card-title {
  font-size: clamp(3.5rem, 5vh, 5rem);
  color: #e5f0ff;
  font-weight: 600;
}

.card-subtitle {
  font-size: 0.86rem;
  color: #bfdbfe;
  opacity: 0.9;
}

.card-swiper {
  padding-bottom: 0.6rem;
}

/* === SLIDE: center slide = active === */
.swiper-slide {
  opacity: 0.35;
  transform: scale(0.94);
  transition: transform 0.6s ease-out, opacity 0.6s ease-out;
}

.swiper-slide-active {
  opacity: 1;
  transform: scale(1);
}

/* === CARD === */
.card {
  padding: 1px;
  height: 60vh;
  border-radius: 1.1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(56, 189, 248, 0.9));
  overflow: hidden;
}

.card-inner {
  position: relative;
  border-radius: 1rem;
  height: 100%;
  background: radial-gradient(circle at top, #020617, #020617 60%, #0b1120 100%);
  padding: 0.9rem;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.9), 0 0 24px rgba(59, 130, 246, 0.45);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow: hidden;
}

.card-inner::before {
  content: "";
  position: absolute;
  inset: -30%;
  background: radial-gradient(circle at 0 0, rgba(191, 219, 254, 0.22), transparent 55%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-out;
}

.card-inner:hover::before {
  opacity: 1;
}

.card-image-wrapper {
  position: relative;
  border-radius: 0.85rem;
  overflow: hidden;
  background: #020617;
  flex: 1.2;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  transform-origin: center center;
  transition: transform 0.9s ease-out, filter 0.6s ease-out;
}

.card-inner:hover .card-image {
  transform: scale(1.12);
  filter: saturate(1.05) contrast(1.05) hue-rotate(-6deg);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-top: 0.5rem;
}

.card-info-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-item-title {
  font-size: 1.2rem;
  color: #e0f2fe;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.card-date-chip {
  flex-shrink: 0;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.8), rgba(15, 23, 42, 1));
  border: 1px solid rgba(191, 219, 254, 0.9);
  color: #dbeafe;
}

.card-read-btn {
  margin-top: 0.15rem;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(191, 219, 254, 0.95);
  background: radial-gradient(circle at top, rgba(37, 99, 235, 0.9), rgba(15, 23, 42, 0.98));
  color: #e0f2fe;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.8), 0 0 26px rgba(56, 189, 248, 0.6);
  position: relative;
  overflow: hidden;
  transition: background 180ms ease-out, transform 180ms ease-out, box-shadow 180ms ease-out,
    border-color 180ms ease-out;
}

.card-read-orb {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: radial-gradient(circle, #facc15, #f97316);
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.95), 0 0 22px rgba(249, 115, 22, 0.75);
}

.card-read-label {
  position: relative;
  z-index: 1;
}

.card-read-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 0 0, rgba(239, 246, 255, 0.18), transparent 60%);
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.card-read-btn:hover {
  transform: translateY(-1px);
  border-color: #e0f2fe;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 1), rgba(15, 23, 42, 0.98));
  box-shadow: 0 0 22px rgba(96, 165, 250, 0.95), 0 0 40px rgba(56, 189, 248, 0.7);
}

.card-read-btn:hover::before {
  opacity: 1;
}

/* === CONTROLS === */
.card-controls {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.35rem;
}

.card-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.05rem;
  border-radius: 999px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.95), rgba(15, 23, 42, 0.98));
  color: #e0f2fe;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.8), 0 0 36px rgba(56, 189, 248, 0.5);
  transition: background 180ms ease-out, transform 180ms ease-out, box-shadow 180ms ease-out,
    border-color 180ms ease-out;
}

.card-nav-btn:hover {
  transform: translateY(-1px);
  background: radial-gradient(circle at top, rgba(96, 165, 250, 1), rgba(15, 23, 42, 0.98));
  border-color: #e0f2fe;
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.95), 0 0 48px rgba(56, 189, 248, 0.6);
}

.card-nav-label {
  font-size: 0.7rem;
}

.card-nav-icon {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-nav-icon::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 1px;
  border-style: solid;
  border-width: 0 2px 2px 0;
  border-color: #e0f2fe;
  display: block;
}

.card-nav-icon-left::before {
  transform: rotate(135deg) translateX(1px);
}

.card-nav-icon-right::before {
  transform: rotate(-45deg) translateX(-1px);
}

/* Pagination */
.card-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.card-pagination :deep(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.7);
  opacity: 1;
  margin: 0 3px;
  transition: width 180ms ease-out, background 180ms ease-out, transform 180ms ease-out;
}

.card-pagination :deep(.swiper-pagination-bullet-active) {
  width: 20px;
  background: linear-gradient(90deg, #3b82f6, #0ea5e9);
  transform: translateY(-1px);
}

/* === RESPONSIVE === */
@media (max-width: 640px) {
  .card-section {
    padding: 2.2rem 1.1rem 2.6rem;
    border-radius: 1.35rem;
    height: auto;
  }

  .card {
    height: 360px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-controls {
    flex-direction: row;
    gap: 0.75rem;
    flex-wrap: nowrap;
  }

  .card-pagination {
    min-width: auto;
    flex: 1;
  }

  .card-nav-btn {
    padding: 0.5rem 0.85rem;
    gap: 0.35rem;
  }

  .card-nav-label {
    display: none;
  }
}
</style>