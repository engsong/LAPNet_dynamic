<template>
  <main_navbar
    title="ສະພາຜູ້ບໍລິຫານ"
    :breadcrumb="['ໜ້າຫຼັກ', 'ກ່ຽວກັບພວກເຮົາ', 'ຄະນະສະພາຜູ້ບໍລິຫານ']"
    background-image="/aboutus/navigatormission-bg.png"
  />
  <div class="navbardirector">
    <bod_navbar />
  </div>

  <div class="chart-page">
    <div class="chart-wrapper">
      <h1 class="chart-title">ຄະນະສະພາບໍລິຫານ</h1>

      <p class="chart-subtitle" style="display: flex; align-items: center">
        <img
          src="/logolapnet/fullcircle.png"
          style="width: 25px; height: 25px; margin-right: 5px"
          alt=""
        />
        ຄະນະບໍລິຫານງານ Lao National Payment Network CO., LTD
      </p>

      <!-- DESKTOP LAYOUT -->
      <div class="chart-grid-desktop">
        <div
          v-for="(row, rowIndex) in cleanLayout"
          :key="'row-' + rowIndex"
          :class="[
            'chart-row',
            rowIndex === cleanLayout.length - 1 ? 'chart-row--grid' : 'chart-row--flex'
          ]"
        >
          <div
            v-for="(slot, colIndex) in row"
            :key="'cell-' + rowIndex + '-' + colIndex"
            class="chart-cell"
            :class="[
              slot.roleTag === 'president' && 'chart-cell--president',
              slot.roleTag === 'vp' && 'chart-cell--vp'
            ]"
          >
            <div
              class="member-card"
              :class="[
                slot.roleTag === 'president' && 'member-card--president',
                slot.roleTag === 'vp' && 'member-card--vp',
                (rowIndex === 0 || rowIndex === 1 || rowIndex === cleanLayout.length - 1) &&
                  'member-card--large'
              ]"
              @mouseenter="onCardEnter"
              @mouseleave="onCardLeave"
            >
              <!-- ✅ light sweep (hover only / immediate) -->
              <span class="shine" aria-hidden="true"></span>

              <!-- ✅ TOP: Bank logo + bank name (NO "bank" label) -->
              <div v-if="slot.bankName || slot.bankLogo" class="bank-header">
                <img
                  v-if="slot.bankLogo"
                  class="bank-header__logo"
                  :src="slot.bankLogo"
                  :alt="slot.bankName || 'bank'"
                />
                <div v-if="slot.bankName" class="bank-header__name">
                  {{ slot.bankName }}
                </div>
                <span class="bank-header__line" aria-hidden="true"></span>
              </div>

              <!-- ✅ BODY: avatar left (same as before) + member name/role right -->
              <div class="member-body">
                <div class="avatar-wrapper">
                  <img class="avatar-image" :src="slot.image" :alt="slot.name" />
                </div>

                <div class="member-info">
                  <div class="member-name">{{ slot.name }}</div>
                  <div class="member-role">{{ slot.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE LAYOUT (President first, VP second) -->
      <div class="chart-grid-mobile">
        <div
          v-for="(member, index) in mobileMembers"
          :key="'mobile-' + index"
          class="chart-cell mobile-cell"
        >
          <div
            class="member-card"
            :class="[
              member.roleTag === 'president' && 'member-card--president',
              member.roleTag === 'vp' && 'member-card--vp'
            ]"
            @mouseenter="onCardEnter"
            @mouseleave="onCardLeave"
          >
            <span class="shine" aria-hidden="true"></span>

            <div v-if="member.bankName || member.bankLogo" class="bank-header">
              <img
                v-if="member.bankLogo"
                class="bank-header__logo"
                :src="member.bankLogo"
                :alt="member.bankName || 'bank'"
              />
              <div v-if="member.bankName" class="bank-header__name">
                {{ member.bankName }}
              </div>
              <span class="bank-header__line" aria-hidden="true"></span>
            </div>

            <div class="member-body">
              <div class="avatar-wrapper">
                <img class="avatar-image" :src="member.image" :alt="member.name" />
              </div>

              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-role">{{ member.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- END MOBILE LAYOUT -->
    </div>
  </div>

  <div class="boxmargin" style="width: 100%; height: 15vh"></div>
  <secondfooter />
</template>

<script setup>
import { onMounted, onBeforeUnmount, nextTick, computed, ref } from "vue";
import { gsap } from "gsap";
import main_navbar from "../../../components/miannavbar/main_navbar.vue";
import bod_navbar from "../companystructure/navbarcompany/bod_navbar.vue";
import secondfooter from "../../../components/footer/mainfooter/secondfooter.vue";

onMounted(() => {
  window.scrollTo({
    top: 500,
    left: 0,
    behavior: "smooth",
  });
});

/* =========================
   DATA + FETCH + ID MAPPING
   Uses API fields: banklogo, bankname, profile, name, committee (shown in member.role)
   ========================= */

// Local slot id -> API id mapping
const apiIdByLocalId = {
  1: 27,
  2: 26,
  3: 25,
  4: 24,
  5: 23,
  6: 19,
  7: 22,
  8: 21,
  9: 20,
};

/** =========================
 * API base from Vite .env ONLY
 * Required in project root .env:
 *   VITE_API_BASE_URL=http://localhost:3000
 * ========================= */
function resolveEnvBaseUrl() {
  const raw = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  return raw.replace(/\/+$/, "");
}

function joinBaseAndPath(baseUrl, path) {
  const b = String(baseUrl || "").trim().replace(/\/+$/, "");
  const p = String(path || "");

  if (!b) return p;

  // Prevent double "/api" when base already ends with "/api" and path starts with "/api"
  if (b.endsWith("/api") && /^\/api(\/|$)/i.test(p)) {
    return b + p.replace(/^\/api/i, "");
  }

  if (!p) return b;
  if (p.startsWith("/")) return b + p;
  return b + "/" + p;
}

const API_BASE = resolveEnvBaseUrl();
const API_URL = joinBaseAndPath(API_BASE, "/api/boarddirector");

let fetchAbortController = null;

/** Build the original layout skeleton (empty data, will be filled by API) */
function buildLayoutSkeleton() {
  const emptyMember = (id, roleTag) => ({
    id,
    type: "member",
    name: "",
    role: "", // committee from API will be mapped here
    roleTag,
    image: "", // profile -> mapped here
    bankName: "",
    bankLogo: "",
  });

  return [
    [null, emptyMember(1, "president"), null, null],
    [null, emptyMember(2, "vp"), null, null],
    [emptyMember(3, "member"), emptyMember(4, "member"), null, emptyMember(5, "member")],
    [emptyMember(6, "member"), emptyMember(7, "member"), emptyMember(8, "member"), emptyMember(9, "member")],
  ];
}

const layout = ref(buildLayoutSkeleton());

function getApiOrigin() {
  try {
    if (!API_BASE) return "";
    return new URL(API_BASE).origin;
  } catch {
    return "";
  }
}

/** Convert relative media path to absolute URL (using API origin) */
function resolveMediaUrl(path) {
  if (!path || typeof path !== "string") return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (/^data:/i.test(path)) return path;

  const origin = getApiOrigin();
  if (!origin) return "";

  if (path.startsWith("/")) return `${origin}${path}`;
  return `${origin}/${path}`;
}

function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

/** Normalize API item to our UI schema */
function normalizeApiItem(item) {
  const apiId =
    item?.id ??
    item?.boarddirector_id ??
    item?.boardDirectorId ??
    item?.director_id ??
    item?.board_director_id ??
    null;

  const name = item?.name ?? item?.fullname ?? item?.full_name ?? item?.member_name ?? "";

  // committee from API -> member.role
  const committee =
    item?.committee ??
    item?.committee_name ??
    item?.committeeName ??
    item?.committee_title ??
    item?.committeeTitle ??
    item?.committee_role ??
    item?.committeeRole ??
    "";

  const roleFallback = item?.role ?? item?.position ?? item?.title ?? "";
  const role = committee || roleFallback || "";

  // profile -> slot.image
  const profile =
    item?.profile ??
    item?.profile_path ??
    item?.profile_url ??
    item?.profileImage ??
    item?.profile_image ??
    item?.avatar ??
    item?.photo ??
    item?.image ??
    "";

  const bankName = item?.bankname ?? item?.bankName ?? item?.bank_name ?? item?.organization ?? item?.company ?? "";

  const bankLogo =
    item?.banklogo ??
    item?.bankLogo ??
    item?.bank_logo ??
    item?.organization_logo ??
    item?.company_logo ??
    item?.logo ??
    "";

  return {
    apiId: apiId != null ? Number(apiId) : null,
    name,
    role,
    image: resolveMediaUrl(profile),
    bankName,
    bankLogo: resolveMediaUrl(bankLogo),
  };
}

async function loadBoardDirectorsByIdMapping() {
  try {
    if (!API_BASE) {
      console.error("[boarddirector] Missing VITE_API_BASE_URL. Put it in project root .env and restart Vite.");
      layout.value = buildLayoutSkeleton().map((row) => row.map((x) => (x && x.type === "member" ? null : x)));
      return;
    }

    if (fetchAbortController) fetchAbortController.abort();
    fetchAbortController = new AbortController();

    const res = await fetch(API_URL, { signal: fetchAbortController.signal });
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const payload = await res.json();
    const raw = pickArray(payload);
    const normalized = raw.map(normalizeApiItem);

    const byApiId = new Map();
    normalized.forEach((x) => {
      if (x.apiId != null) byApiId.set(Number(x.apiId), x);
    });

    // Clone layout to keep reactivity stable
    const next = layout.value.map((row) => row.map((slot) => (slot ? { ...slot } : null)));

    next.forEach((row) => {
      row.forEach((slot, idx) => {
        if (!slot || slot.type !== "member") return;

        const apiId = apiIdByLocalId[slot.id];
        if (!apiId) return;

        const apiItem = byApiId.get(Number(apiId));
        if (!apiItem) {
          row[idx] = null; // hide empty cell if API item missing
          return;
        }

        // Keep slot.id + slot.roleTag (layout position), replace the rest
        slot.name = apiItem.name || "";
        slot.role = apiItem.role || "";
        slot.image = apiItem.image || "";
        slot.bankName = apiItem.bankName || "";
        slot.bankLogo = apiItem.bankLogo || "";
      });
    });

    layout.value = next;
  } catch (err) {
    console.warn("[boarddirector] fetch failed:", err);
    layout.value = buildLayoutSkeleton().map((row) => row.map((x) => (x && x.type === "member" ? null : x)));
  }
}

onMounted(() => {
  loadBoardDirectorsByIdMapping();
});

const cleanLayout = computed(() => layout.value.map((row) => row.filter((slot) => slot && slot.type === "member")));

const mobileMembers = computed(() => {
  const all = [];
  layout.value.forEach((row) => row.forEach((slot) => slot && slot.type === "member" && all.push(slot)));

  const presidentIndex = all.findIndex((m) => m.roleTag === "president");
  const vpIndex = all.findIndex((m) => m.roleTag === "vp");

  const result = [];
  if (presidentIndex !== -1) result.push(all[presidentIndex]);
  if (vpIndex !== -1) result.push(all[vpIndex]);

  all.forEach((m, idx) => idx !== presidentIndex && idx !== vpIndex && result.push(m));
  return result;
});

/* =========================
   HOVER LIGHT SWEEP (GSAP) — hover only / immediate
   ========================= */
const sweepMap = new Map(); // cardEl -> timeline
const sweepSet = new Set(); // timelines for cleanup

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function getShine(cardEl) {
  return cardEl?.querySelector?.(".shine") || null;
}

function onCardEnter(e) {
  if (prefersReducedMotion()) return;

  const card = e.currentTarget;
  const shine = getShine(card);
  if (!shine) return;

  const prev = sweepMap.get(card);
  if (prev) {
    prev.kill();
    sweepSet.delete(prev);
    sweepMap.delete(card);
  }

  gsap.set(shine, { xPercent: -180, opacity: 0 });

  const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
  tl.to(shine, { opacity: 0.85, duration: 0.08, ease: "power2.out" }, 0);
  tl.to(shine, { xPercent: 180, duration: 1.05, ease: "sine.inOut" }, 0);
  tl.to(shine, { opacity: 0, duration: 0.28, ease: "power2.out" }, 0.78);

  sweepMap.set(card, tl);
  sweepSet.add(tl);
}

function onCardLeave(e) {
  const card = e.currentTarget;
  const shine = getShine(card);
  if (!shine) return;

  const prev = sweepMap.get(card);
  if (prev) {
    prev.kill();
    sweepSet.delete(prev);
    sweepMap.delete(card);
  }

  gsap.to(shine, {
    opacity: 0,
    duration: 0.12,
    ease: "power2.out",
    onComplete: () => gsap.set(shine, { xPercent: -180 }),
  });
}

onMounted(async () => {
  await nextTick();
  gsap.set(".member-card .shine", { xPercent: -180, opacity: 0 });
});

onBeforeUnmount(() => {
  if (fetchAbortController) fetchAbortController.abort();

  sweepSet.forEach((tl) => tl.kill());
  sweepSet.clear();
  sweepMap.clear();
});
</script>
<style scoped>
.navbardirector {
  width: 100%;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-page {
  min-height: 100vh;
  padding: 56px 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
  color: #f5f7ff;
  overflow-x: hidden;
}

/* main card wrapper */
.chart-wrapper {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px 36px 40px;
  box-sizing: border-box;
  border-radius: 32px;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.14), transparent 55%),
    rgba(4, 8, 36, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(20px);
}

.chart-title {
  font-size: clamp(2.2rem, 2.5vw + 1.4rem, 3.5rem);
  font-weight: 700;
  margin: 0 0 6px;
}

.chart-subtitle {
  margin: 0 0 28px;
  font-size: 14px;
  opacity: 0.85;
}

/* DESKTOP GRID WRAPPER */
.chart-grid-desktop {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Base row (animation + spacing only) */
.chart-row {
  gap: 22px;
  opacity: 0;
  transform: translateY(18px) scale(0.98);
  animation: rowIn 0.7s ease-out forwards;
}

/* last row: 4-column full-width grid */
.chart-row--grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* row 1–3: centered flex rows */
.chart-row--flex {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.chart-cell {
  display: flex;
  align-items: stretch;
  justify-content: center;
  min-height: 170px;
  flex: 0 1 400px;
  max-width: 100%;
}

/* wider VP */
.chart-row--flex .chart-cell--vp {
  flex: 0 1 480px;
}

/* widest President */
.chart-row--flex .chart-cell--president {
  flex: 0 1 500px;
}

/* MOBILE LIST (hidden by default) */
.chart-grid-mobile {
  display: none;
}

/* Member Card */
.member-card {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column; /* ✅ bank header top + body bottom */
  gap: 14px;
  padding: 18px 18px;
  border-radius: 24px;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.16), transparent 55%),
    rgba(6, 12, 52, 0.98);
  box-shadow: 0 20px 52px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;
}

/* Bigger cards */
.member-card--large {
  padding: 24px 24px;
  gap: 16px;
}

/* Glow border effect */
.member-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    95deg,
    rgba(0, 3, 41, 1) 0%,
    rgba(0, 51, 171, 1) 46%,
    rgba(157, 214, 255, 0.9) 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.7;
  pointer-events: none;
}

/* ✅ Premium light sweep (GSAP animates xPercent + opacity) */
.member-card .shine {
  position: absolute;
  top: -85%;
  left: -55%;
  width: 78%;
  height: 280%;
  pointer-events: none;
  opacity: 0;

  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.06) 28%,
    rgba(255, 255, 255, 0.46) 50%,
    rgba(255, 255, 255, 0.06) 72%,
    rgba(255, 255, 255, 0) 100%
  );

  filter: blur(8px);
  mix-blend-mode: screen;
  transform: skewX(-18deg);
  will-change: transform, opacity;
}

/* Hover interaction */
.member-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75);
}

.member-card--president {
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.2), transparent 55%),
    rgba(8, 20, 90, 0.98);
}

.member-card--vp {
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 55%),
    rgba(6, 16, 70, 0.98);
}

/* ✅ TOP bank header (logo + name balanced) */
.bank-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.bank-header__logo {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(2, 6, 23, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.18), 0 0 22px rgba(37, 99, 235, 0.14);
}

.bank-header__name {
  min-width: 0;
  font-size: 1.02rem; /* ✅ balance with 34px logo */
  font-weight: 700;

  letter-spacing: 0.01em;
  color: rgba(226, 232, 240, 0.94);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bank-header__line {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 1px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(157, 214, 255, 0.65) 18%,
    rgba(0, 120, 255, 0.85) 50%,
    rgba(157, 214, 255, 0.55) 82%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0.95;
}

/* ✅ BODY (avatar left like before) */
.member-body {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar-wrapper {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 999px;
  padding: 4px;
  background: linear-gradient(135deg, rgba(157, 214, 255, 1), rgba(0, 51, 171, 1));
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-card--large .avatar-wrapper {
  width: 104px;
  height: 104px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  background: #020617;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.member-name {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-word;
}

.member-role {
  font-size: 1rem;
  text-transform: uppercase;
  opacity: 0.85;
  line-height: 1.25;
}

/* Animations */
@keyframes rowIn {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .chart-row {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .member-card {
    transition: none;
  }
}

/* MEDIUM SCREENS */
@media (max-width: 1200px) {
  .chart-wrapper {
    padding: 28px 22px 32px;
  }

  .chart-row--flex .chart-cell,
  .chart-row--flex .chart-cell--vp,
  .chart-row--flex .chart-cell--president {
    flex: 1 1 100%;
    max-width: 600px;
  }

  .chart-row--grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* RESPONSIVE – mobile (1 column) */
@media (max-width: 900px) {
  .chart-page {
    padding: 40px 12px;
  }

  .chart-wrapper {
    padding: 22px 14px 26px;
    max-width: 100%;
    border-radius: 26px;
  }

  .chart-title {
    text-align: center;
  }

  .chart-subtitle {
    text-align: center;
    justify-content: center;
    gap: 6px;
  }

  .chart-grid-desktop {
    display: none;
  }

  .chart-grid-mobile {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 18px;
  }

  .chart-grid-mobile .chart-cell {
    width: 100%;
    max-width: 100%;
    min-height: auto;
    flex: initial;
    justify-content: stretch;
    align-items: stretch;
  }

  .member-card {
    padding: 14px 14px;
    border-radius: 18px;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);
    gap: 12px;
  }

  .member-body {
    gap: 12px;
  }

  .avatar-wrapper {
    width: 60px;
    height: 60px;
    padding: 3px;
  }

  .member-name {
    font-size: 15px;
  }

  .member-role {
    font-size: 0.88rem;
  }

  .bank-header {
    padding: 10px 10px 12px;
    border-radius: 16px;
  }
  .bank-header__logo {
    width: 26px;
    height: 26px;
  }
  .bank-header__name {
    font-size: 0.9rem;
  }

  .member-card:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.65);
  }
}

@media (max-width: 600px) {
  .chart-wrapper {
    padding: 18px 12px 22px;
    border-radius: 22px;
  }

  .chart-title {
    font-size: clamp(1.55rem, 4.5vw + 0.9rem, 2.2rem);
  }

  .chart-subtitle {
    font-size: 13px;
    margin-bottom: 18px;
  }
}

@media (max-width: 420px) {
  .bank-header__name {
    font-size: 0.82rem;
  }
}

/* ถ้าเครื่องไม่มี hover จริงๆ ให้ไม่ต้องยกการ์ด */
@media (hover: none) and (pointer: coarse) {
  .member-card:hover {
    transform: none;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);
  }
}
</style>
