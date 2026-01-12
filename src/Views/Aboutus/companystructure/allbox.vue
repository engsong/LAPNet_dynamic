<!-- LaoStyleOrgChart_CEO.vue -->

<template>
  <main_navbar
    title="ໂຄງຮ່າງການຈັດຕັ້ງ"
    :breadcrumb="[
      'ໜ້າຫຼັກ',
      'ກ່ຽວກັບພວກເຮົາ',
      'ໂຄງຮ່າງການຈັດຕັ້ງ',
      'ຄະນະບໍລິຫານ ພາຍໃນບໍລິສັດ',
    ]"
    background-image="/aboutus/navigatormission-bg.png"
  />
  <div class="navbarcompany">
    <cpn_navbar />
  </div>

  <div class="org-page">
    <div class="org-container" ref="root">
      <!-- TOP HEADER BAR -->
      <header class="org-header">
        <div class="org-header-left">
          <h1 class="org-title-lao">ຄະນະບໍລິຫານ ພາຍໃນບໍລິສັດ</h1>
        </div>
        <div class="org-header-right">
          <div class="org-logo-circle">
            <img src="/logolapnet/fullcircle.png" alt="LAPNet logo" />
          </div>
          <div class="org-header-en">
            LAO NATIONAL<br />
            PAYMENT NETWORK CO., LTD
          </div>
        </div>
      </header>

      <!-- ORG CHART FRAME -->
      <section class="org-frame">
        <div
          v-for="(row, rowIndex) in rowsToRender"
          :key="rowIndex"
          :class="['org-row', `org-row--${rowIndex}`]"
        >
          <article
            v-for="person in row"
            :key="person.id"
            class="org-card"
            :class="[
              { 'org-card--head': rowIndex >= 2 },
              { 'org-card--row4': !!person.isRow4 },
            ]"
          >
            <!-- AVATAR -->
            <div class="org-avatar-wrapper">
              <div class="org-avatar-ring">
                <div class="org-avatar-inner">
                  <img
                    v-if="person.photo"
                    :src="person.photo"
                    :alt="person.name || 'avatar'"
                    class="org-avatar-img"
                  />
                  <span v-else class="org-avatar-placeholder">
                    {{ getInitials(person.name) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- TEXT -->
            <div class="org-card-body">
              <h2 class="org-card-name">{{ person.name }}</h2>
              <p class="org-card-role">{{ person.role }}</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>

  <secondfooter />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { gsap } from "gsap";
import main_navbar from "../../../components/miannavbar/main_navbar.vue";
import cpn_navbar from "./navbarcompany/cpn_navbar.vue";
import secondfooter from "../../../components/footer/mainfooter/secondfooter.vue";

const root = ref(null);

/** ✅ API */
const EMP_API_ORIGIN = "http://localhost:3000";
const EMP_API_URL = "http://localhost:3000/api/emp_lapnet";

const apiEmployees = ref([]);
const loading = ref(true);
const apiError = ref(null);

/**
 * ✅ Mapping: old id (หน้าเดิม) -> api id
 * ✅ id หน้าเดิม "ห้ามเปลี่ยน"
 * ✅ FIX: Internal Audit (old id 7) -> api id 7
 */
const API_ID_BY_OLD_ID = Object.freeze({
  1: 36, // CEO
  2: 35, // COO
  3: 34, // Head of administration
  4: 28, // Head of finance
  5: 24, // Head of IT
  6: 17, // Head of operation
  7: 7,  // ✅ Internal Audit (fetch from API id: 7)
  8: 33, // Head of bc
});

/** ✅ เก็บรูปที่ fetch มาแล้ว (oldId -> objectURL หรือ dataURL) */
const photoObjectUrlByOldId = ref({});
const createdObjectUrls = new Set();

const unwrapEmployees = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.result)) return payload.result;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
};

const getEmpId = (emp) => {
  const raw =
    emp?.id ??
    emp?.emp_id ??
    emp?.employee_id ??
    emp?.EMP_ID ??
    emp?.ID ??
    emp?.Id;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const getField = (obj, keys, fallback = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return fallback;
};

const isProbablyBase64 = (s) => {
  if (!s || typeof s !== "string") return false;
  const t = s.trim();
  if (t.startsWith("data:image/")) return false;
  if (t.length < 50) return false;
  return /^[A-Za-z0-9+/=]+$/.test(t);
};

/**
 * ✅ normalize รูปจาก API
 * รองรับ:
 * - data:image/...
 * - base64 string (ไม่มี prefix) => data:image/png;base64,...
 * - full url
 * - /path หรือ path => prefix ด้วย origin
 */
const normalizeApiPhoto = (path) => {
  if (!path || typeof path !== "string") return "";
  const p = path.trim();
  if (!p) return "";

  if (p.startsWith("data:image/")) return p;
  if (isProbablyBase64(p)) return `data:image/png;base64,${p}`;
  if (/^https?:\/\//i.test(p)) return p;

  if (p.startsWith("/")) return `${EMP_API_ORIGIN}${p}`;
  return `${EMP_API_ORIGIN}/${p}`;
};

const employeesById = computed(() => {
  const m = new Map();
  for (const emp of apiEmployees.value) {
    const id = getEmpId(emp);
    if (id != null) m.set(id, emp);
  }
  return m;
});

/**
 * ✅ ดึง field รูปจาก API: "imageprofile" เป็นหลัก
 */
const getRawPhotoFromEmp = (emp) => {
  return getField(
    emp,
    [
      "imageprofile", // ✅ ตัวหลัก
      "imageProfile",
      "image_profile",
      "profileImage",
      "profile_image",
      "photo",
      "photo_url",
      "avatar",
      "image",
      "img",
      "picture",
    ],
    ""
  );
};

const resolveEmpFromOldId = (oldId) => {
  // ✅ ใช้ mapping ก่อน (และเผื่อ mapping ไม่มี จะ fallback เป็น oldId)
  const apiId = API_ID_BY_OLD_ID[oldId] ?? oldId;
  if (!apiId) return null;
  return employeesById.value.get(apiId) || null;
};

/**
 * ✅ fetch รูปเป็น blob แล้วสร้าง objectURL
 * - ถ้า fetch fail จะ fallback ไปใช้ URL ตรง
 */
const fetchImageAsObjectUrl = async (url) => {
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;

  try {
    const res = await fetch(url, {
      method: "GET",
      // ถ้ารูปต้องใช้ cookie/session ให้เปิดบรรทัดนี้
      // credentials: "include",
    });
    if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    createdObjectUrls.add(objUrl);
    return objUrl;
  } catch {
    return "";
  }
};

/**
 * ✅ preload รูปให้ person.photo พร้อมใช้ใน <img :src="person.photo" />
 */
const preloadPhotos = async () => {
  const targets = [1, 2, 3, 4, 5, 6, 7, 8];

  const jobs = targets.map(async (oldId) => {
    const emp = resolveEmpFromOldId(oldId);
    if (!emp) return;

    const raw = getRawPhotoFromEmp(emp);
    const normalized = normalizeApiPhoto(raw);
    if (!normalized) return;

    // ถ้าเป็น data url/base64 ไม่ต้อง fetch
    if (normalized.startsWith("data:image/")) {
      photoObjectUrlByOldId.value[oldId] = normalized;
      return;
    }

    const objUrl = await fetchImageAsObjectUrl(normalized);
    photoObjectUrlByOldId.value[oldId] = objUrl || normalized;
  });

  await Promise.all(jobs);
};

const buildPersonFromApi = (oldId, extra = {}) => {
  const emp = resolveEmpFromOldId(oldId);

  const name = emp
    ? getField(emp, ["full_name", "name", "emp_name", "employee_name", "fullname"], "")
    : "";

  const role = emp
    ? getField(emp, ["role", "position", "title", "emp_position", "employee_position"], "")
    : "";

  // ✅ ใส่รูปที่ preload มาแล้ว (objectURL/dataURL/url)
  const photo = photoObjectUrlByOldId.value?.[oldId] || "";

  return {
    id: oldId, // ✅ keep old id
    name,
    role,
    photo,
    ...extra,
  };
};

const fetchEmployees = async () => {
  loading.value = true;
  apiError.value = null;

  try {
    const res = await fetch(EMP_API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    const json = await res.json();
    apiEmployees.value = unwrapEmployees(json);
  } catch (err) {
    apiError.value = err?.message || String(err);
    apiEmployees.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * ✅ baseRows สร้างจาก API (รูปมาจาก imageprofile ที่ fetch แล้ว)
 */
const baseRows = computed(() => {
  const row1 = [buildPersonFromApi(1)];
  const row2 = [buildPersonFromApi(2)];
  const row3 = [
    buildPersonFromApi(3),
    buildPersonFromApi(4),
    buildPersonFromApi(5),
    buildPersonFromApi(6),
    buildPersonFromApi(7), // ✅ Internal Audit (api id 7)
  ];
  const row4 = [buildPersonFromApi(8, { isRow4: true })];
  return [row1, row2, row3, row4];
});

// ✅ ตรวจโหมด 1 column (<= 640px)
const isOneColumn = ref(false);
let mq = null;

const handleMQ = (e) => {
  isOneColumn.value = !!e.matches;
};

// ✅ Mobile 1 column: ย้าย id:8 ไปอยู่ใต้ id:3 แล้วรวมเป็นแถวเดียว
const rowsToRender = computed(() => {
  if (!isOneColumn.value) return baseRows.value;

  const rows = baseRows.value;
  const r1 = rows[0] ?? [];
  const r2 = rows[1] ?? [];
  const r3 = rows[2] ? [...rows[2]] : [];
  const r4First = rows[3]?.[0];

  if (r4First && r3.length > 0) r3.splice(1, 0, r4First);
  else if (r4First) r3.push(r4First);

  return [r1, r2, r3];
});

// initials fallback (2 ตัวแรก)
const getInitials = (name) => (name || "").trim().slice(0, 2) || "?";

let gsapCtx;
let hasAnimated = false;

const runGsap = () => {
  if (hasAnimated) return;
  hasAnimated = true;

  gsapCtx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".org-container", {
      opacity: 0,
      y: 48,
      scale: 0.97,
      duration: 0.8,
    })
      .from(".org-header-left", { x: -40, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".org-header-right", { x: 40, opacity: 0, duration: 0.6 }, "-=0.5")
      .from(".org-frame", { opacity: 0, y: 24, duration: 0.7 }, "-=0.25")
      .from(".org-row", { opacity: 0, y: 40, duration: 0.7, stagger: 0.16 }, "-=0.2")
      .from(
        ".org-card",
        {
          opacity: 0,
          y: 30,
          rotateX: -18,
          transformOrigin: "50% 100%",
          duration: 0.9,
          stagger: { each: 0.08, from: "center" },
        },
        "-=0.55"
      )
      .from(
        ".org-avatar-ring",
        {
          scale: 0.5,
          opacity: 0,
          duration: 0.55,
          stagger: { each: 0.08, from: "center" },
        },
        "-=0.55"
      );
  }, root.value);
};

onMounted(async () => {
  // matchMedia
  if (typeof window !== "undefined") {
    mq = window.matchMedia("(max-width: 640px)");
    isOneColumn.value = mq.matches;

    if (mq.addEventListener) mq.addEventListener("change", handleMQ);
    else mq.addListener(handleMQ);
  }

  // ✅ load API + preload รูป (imageprofile)
  await fetchEmployees();
  await preloadPhotos();

  // ให้ DOM อัปเดตก่อน animate
  await nextTick();
  runGsap();
});

onBeforeUnmount(() => {
  if (gsapCtx) gsapCtx.revert();

  // ✅ revoke objectURL กัน memory leak
  for (const u of createdObjectUrls) {
    try {
      URL.revokeObjectURL(u);
    } catch {}
  }
  createdObjectUrls.clear();

  if (mq) {
    if (mq.removeEventListener) mq.removeEventListener("change", handleMQ);
    else mq.removeListener(handleMQ);
  }
});
</script>

<style scoped>
/* NAVBAR WRAPPER */
.navbarcompany {
  width: 100%;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  background-color: #f5f7fb;
}

/* PAGE BACKGROUND */
.org-page {
  min-height: 100vh;
  padding: 56px 24px;
  background: radial-gradient(circle at top, #dde7ff, #eef3fb 45%, #e2e8f0);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
}

/* MAIN CONTAINER */
.org-container {
  width: 100%;
  max-width: 1680px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

/* HEADER BAR */
.org-header {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background: linear-gradient(135deg, #0f2d55, #123765);
  color: #ffffff;
  padding: 26px 56px;
}

.org-header-left {
  display: flex;
  align-items: center;
}

.org-title-lao {
  margin: 0;
  font-size: 1.9rem;
  font-weight: 600;
}

.org-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.org-logo-circle {
  width: 82px;
  height: 82px;
  border-radius: 999px;
  border: 3px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(circle at 30% 0, #4f8efc, #0a2b5c);
}

.org-logo-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.org-header-en {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* FRAME AROUND NODES */
.org-frame {
  margin: 40px 56px 46px;
  padding: 70px 40px 54px;
  border-radius: 16px;
  border: 2px dashed rgba(148, 163, 184, 0.8);
  background: radial-gradient(circle at top, #f8fafc, #edf2ff 40%, #f9fafb);
  perspective: 1680px;

  --row4-card-width: 265px;
  --row4-card-padding: 56px 28px 22px;
  --row4-avatar-size: 112px;
  --row4-avatar-padding: 9px;
  --row4-name-size: 1rem;
  --row4-role-size: 1rem;
}

/* ROWS */
.org-row {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 22px;
  margin-bottom: 70px;
}

/* ✅ Row 4 desktop ให้ชิดซ้าย */
.org-row--3 {
  justify-content: flex-start;
  margin-bottom: 0;
}

/* CARD */
.org-card {
  position: relative;
  width: 420px;
  max-width: 90%;
  background: radial-gradient(circle at top, #123765, #061429);
  border-radius: 20px;
  padding: 60px 40px 28px;
  color: #ffffff;
  text-align: center;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.45);
  transform-style: preserve-3d;
  border: 1px solid rgba(148, 163, 184, 0.45);
  overflow: visible;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.35s ease-out;
}

.org-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.35s ease-out;
}

/* hover */
.org-card:hover {
  transform: translateY(-12px) rotateX(6deg) rotateY(-3deg) scale(1.02);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.65);
  background: radial-gradient(circle at top, #1a4174, #050c1a);
}

.org-card:hover::before {
  opacity: 1;
}

/* ✅ Heads style */
.org-card--head {
  width: 320px;
  margin-top: 30px;
  padding: 56px 28px 22px;
  background: #123765 !important;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.42);
}

.org-card--head:hover {
  background: #123765 !important;
  transform: translateY(-10px) rotateX(5deg) rotateY(-2deg) scale(1.015);
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.6);
}

/* ✅ Row4 override */
.org-card--row4 {
  width: var(--row4-card-width, 300px);
  padding: var(--row4-card-padding, 56px 28px 22px);
  margin-top: 40px;
}

.org-card--row4 .org-avatar-ring {
  width: var(--row4-avatar-size, 112px);
  height: var(--row4-avatar-size, 112px);
  padding: var(--row4-avatar-padding, 9px);
}

.org-card--row4 .org-card-name {
  font-size: var(--row4-name-size, 1rem);
}
.org-card--row4 .org-card-role {
  font-size: var(--row4-role-size, 1rem);
}

/* AVATAR */
.org-avatar-wrapper {
  position: absolute;
  top: -56px;
  left: 50%;
  transform: translateX(-50%);
}

.org-avatar-ring {
  width: 132px;
  height: 132px;
  border-radius: 999px;
  padding: 10px;
  background: #123765;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.55);
}

.org-card--head .org-avatar-ring {
  width: 112px;
  height: 112px;
  padding: 9px;
}

.org-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.org-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.org-avatar-placeholder {
  font-size: 1.4rem;
  font-weight: 600;
  color: #e5edff;
}

/* TEXT */
.org-card-name {
  margin: 18px 0 6px;
  font-size: var(--fs-md);
  font-weight: 600;
}

.org-card-role {
  margin: 0;
  font-size: 0.92rem;
  opacity: 0.94;
}

.org-card--head .org-card-name {
  font-size: 1.02rem;
}
.org-card--head .org-card-role {
  font-size: 0.88rem;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .org-row--2 {
    flex-wrap: wrap;
    gap: 28px;
  }

  .org-row--3 {
    justify-content: center;
  }
}

@media (max-width: 900px) {
  .org-frame {
    margin: 28px 24px 32px;
    padding: 56px 20px 42px;
    --row4-card-width: 320px;
  }

  .org-row {
    flex-wrap: wrap;
    margin-bottom: 50px;
  }

  .org-row--3 {
    justify-content: center;
    margin-bottom: 0;
  }

  .org-card {
    margin-top: 80px;
    width: 360px;
  }

  .org-card--head {
    width: 320px;
  }

  .org-card--row4 {
    width: var(--row4-card-width, 320px);
    padding: var(--row4-card-padding, 56px 28px 22px);
  }
}

@media (max-width: 640px) {
  .org-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 22px 24px;
  }

  .org-header-en {
    font-size: 13px;
  }

  .org-logo-circle {
    width: 60px;
    height: 60px;
  }

  .org-card {
    width: 100%;
    max-width: 340px;
    padding-inline: 24px;
    margin-top: 80px;
  }

  .org-card--head {
    max-width: 340px;
  }

  .org-frame {
    margin: 22px 16px 30px;
    padding: 50px 16px 34px;
    --row4-card-width: 100%;
  }
}
</style>
