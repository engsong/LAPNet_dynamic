<!-- LaoStyleOrgChart_InternalAudit.vue -->

<template>
  <main_navbar
    title="ໂຄງຮ່າງການຈັດຕັ້ງ"
    :breadcrumb="[
      'ໜ້າຫຼັກ',
      'ກ່ຽວກັບພວກເຮົາ',
      'ໂຄງຮ່າງການຈັດຕັ້ງ',
      'ພະແນກກວດສອບພາຍໃນ',
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
          <h1 class="org-title-lao">ພະແນກກວດສອບພາຍໃນ</h1>
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
        <!-- ✅ ONE ROW -->
        <div class="org-row org-row--single">
          <article v-for="person in people" :key="person.id" class="org-card">
            <!-- AVATAR -->
            <div class="org-avatar-wrapper">
              <div class="org-avatar-ring">
                <div class="org-avatar-inner">
                  <img
                    v-if="person.photo"
                    :src="person.photo"
                    :alt="person.name"
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
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { gsap } from "gsap";
import main_navbar from "../../../components/miannavbar/main_navbar.vue";
import cpn_navbar from "./navbarcompany/cpn_navbar.vue";
import secondfooter from "../../../components/footer/mainfooter/secondfooter.vue";

const root = ref(null);

/** ✅ API */
const EMP_API_ORIGIN = "http://localhost:3000";
const EMP_API_URL = "http://localhost:3000/api/emp_lapnet";

/**
 * ✅ Mapping: old id -> api id
 * id 1 = api id 9
 * id 2 = api id 8
 */
const API_ID_BY_OLD_ID = Object.freeze({
  1: 9,
  2: 8,
});

/**
 * ✅ ไม่ insert ข้อมูลชื่อ/ตำแหน่ง/รูปแล้ว
 * จะดึงจาก API อย่างเดียว (คง structure: มี 2 การ์ด id=1,2)
 */
const people = ref([
  { id: 1, name: "", role: "", photo: "" },
  { id: 2, name: "", role: "", photo: "" },
]);

// initials fallback
const getInitials = (name) => (name || "").trim().slice(0, 2) || "?";

/** ✅ revoke objectURL กัน memory leak */
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
 * - data:image/...
 * - base64 => data:image/png;base64,...
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

/** ✅ fetch รูปเป็น blob แล้วสร้าง objectURL */
const fetchImageAsObjectUrl = async (url) => {
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    createdObjectUrls.add(objUrl);
    return objUrl;
  } catch {
    return "";
  }
};

const getNameFromEmp = (emp) =>
  getField(emp, ["full_name", "name", "emp_name", "employee_name", "fullname"], "");

const getRoleFromEmp = (emp) =>
  getField(emp, ["role", "position", "title", "emp_position", "employee_position"], "");

const getRawPhotoFromEmp = (emp) =>
  getField(
    emp,
    [
      "imageprofile", // ✅ ใช้ field นี้เป็นหลัก
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

const applyPersonFromEmp = async (person, emp) => {
  if (!person || !emp) return;

  // ✅ map name/role จาก API
  person.name = getNameFromEmp(emp) || "";
  person.role = getRoleFromEmp(emp) || "";

  // ✅ map photo จาก API
  const raw = getRawPhotoFromEmp(emp);
  const normalized = normalizeApiPhoto(raw);
  if (!normalized) {
    person.photo = "";
    return;
  }

  if (normalized.startsWith("data:image/")) {
    person.photo = normalized;
    return;
  }

  const objUrl = await fetchImageAsObjectUrl(normalized);
  person.photo = objUrl || normalized;
};

let gsapCtx;

const runGsap = () => {
  gsapCtx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    tl.from(".org-container", {
      opacity: 0,
      y: 48,
      scale: 0.97,
      duration: 0.8,
    })
      .from(".org-header-left", { x: -40, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".org-header-right", { x: 40, opacity: 0, duration: 0.6 }, "-=0.5")
      .from(".org-frame", { opacity: 0, y: 24, duration: 0.7 }, "-=0.25")
      .from(".org-row", { opacity: 0, y: 40, duration: 0.7 }, "-=0.2")
      .from(
        ".org-card",
        {
          opacity: 0,
          y: 30,
          rotateX: -14,
          transformOrigin: "50% 100%",
          duration: 0.8,
          stagger: { each: 0.12, from: "center" },
        },
        "-=0.45"
      )
      .from(
        ".org-avatar-ring",
        {
          scale: 0.5,
          opacity: 0,
          duration: 0.55,
          stagger: { each: 0.12, from: "center" },
        },
        "-=0.55"
      );

    // glow pulse
    gsap.to(".org-card", {
      boxShadow: "0 22px 48px rgba(15, 23, 42, 0.45)",
      duration: 3.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, root.value);
};

onMounted(async () => {
  // ✅ fetch API แล้ว map ตาม mapping ที่กำหนด
  try {
    const res = await fetch(EMP_API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const list = unwrapEmployees(json);

    const mapByApiId = new Map();
    for (const emp of list) {
      const id = getEmpId(emp);
      if (id != null) mapByApiId.set(id, emp);
    }

    // id 1 -> api 9, id 2 -> api 8
    await Promise.all(
      people.value.map((p) => {
        const apiId = API_ID_BY_OLD_ID[p.id];
        const emp = apiId ? mapByApiId.get(apiId) : null;
        return applyPersonFromEmp(p, emp);
      })
    );
  } catch {
    // ถ้า API ล่ม/ผิดพลาด -> คน/ตำแหน่ง/รูป จะเป็นค่าว่าง (ไม่ insert ข้อมูลเดิม)
  }

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
});
</script>

<style scoped>
.navbarcompany {
  width: 100%;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  background-color: #f5f7fb;
}

.org-page {
  min-height: 100vh;
  padding: 56px 24px;
  background: radial-gradient(circle at top, #dde7ff, #eef3fb 45%, #e2e8f0);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
}

.org-container {
  width: 100%;
  max-width: 1380px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

/* HEADER */
.org-header {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background: linear-gradient(135deg, #0f2d55, #123765);
  color: #ffffff;
  padding: 26px 44px;
}

.org-header-left {
  display: flex;
  align-items: center;
}

.org-title-lao {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.org-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.org-logo-circle {
  width: 80px;
  height: 80px;
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

/* FRAME */
.org-frame {
  margin: 34px 44px 42px;
  padding: 60px 32px 46px;
  border-radius: 12px;
  border: 2px dashed rgba(148, 163, 184, 0.8);
  background: radial-gradient(circle at top, #f8fafc, #edf2ff 40%, #f9fafb);
  perspective: 1200px;
}

/* ✅ ONE ROW */
.org-row {
  display: flex;
  justify-content: center;
  gap: 42px;
}

.org-row--single {
  margin-bottom: 0;
  flex-wrap: nowrap;
}

/* CARD */
.org-card {
  position: relative;
  width: 360px;
  background: #123765;
  border-radius: 16px;
  padding: 54px 34px 24px;
  color: #ffffff;
  text-align: center;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.42);
  transform-style: preserve-3d;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.org-card:hover {
  transform: translateY(-8px) rotateX(3deg);
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.48);
}

/* AVATAR */
.org-avatar-wrapper {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
}

.org-avatar-ring {
  width: 122px;
  height: 122px;
  border-radius: 999px;
  padding: 9px;
  background: #123765;
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
  margin: 12px 0 6px;
  font-size: var(--fs-base);
  font-weight: 600;
  padding-top: 20px;
}

.org-card-role {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.94;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .org-frame {
    margin: 26px 24px 32px;
    padding: 52px 20px 38px;
  }

  /* ✅ บนจอเล็กให้ wrap เป็น 1 คอลัมน์อัตโนมัติ (ยังถือว่าเป็น row เดียว) */
  .org-row--single {
    flex-wrap: wrap;
    gap: 34px;
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
    margin-top: 50px;
    max-width: 320px;
  }

  .org-frame {
    margin: 22px 16px 30px;
    padding: 48px 16px 34px;
  }
}
</style>
