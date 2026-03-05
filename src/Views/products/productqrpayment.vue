<script setup>
import { ref, onMounted } from "vue";

import main_navbar from "../../components/miannavbar/main_navbar.vue";

import tagproduct from "../../components/tagproduct/tagproduct.vue";
import product5_footerlogomember from "../../components/footer/logomemberfooter/product5_footerlogomember.vue";
import product5tech from "../techbenetfit/product5tech.vue";
import hero_sectionproduct5 from "../../Views/products/product_herosection/hero_sectionproduct5.vue";
import secondfooter from "../../components/footer/mainfooter/secondfooter.vue";

const heroVideo = "/videos/productvdo-background.mp4";

/** =========================
 * ✅ Load member logos from API (env only)
 * API: {VITE_API_BASE_URL}/api/members
 * Condition: qrpayment = 1
 * ========================= */

// Required in .env:
//   VITE_API_BASE_URL=http://localhost:3000
function resolveEnvBaseUrl() {
  // IMPORTANT: Use direct access so Vite injects import.meta.env correctly.
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
  if (b.endsWith("/api") && /^\/api(\/|$)/i.test(p)) {
    return b + p.replace(/^\/api/i, "");
  }

  if (!p) return b;
  if (p.startsWith("/")) return b + p;
  return b + "/" + p;
}

function isLoopbackHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0";
}

function isLikelyAssetPath(pathname) {
  const p = String(pathname || "");
  return /^\/(uploads|upload|images|files|static)\b/i.test(p) || p.includes("/uploads/") || p.includes("/images/");
}

const API_BASE = normalizeBaseUrl(resolveEnvBaseUrl());
const ASSET_BASE = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;
const MEMBERS_API_URL = joinBaseAndPath(API_BASE, "/api/members");

const memberLogos = ref([]);

const ASSET_BASE_URL = (() => {
  try {
    return ASSET_BASE ? new URL(ASSET_BASE) : null;
  } catch {
    return null;
  }
})();

function rewriteBadAbsoluteToEnvBase(absoluteUrl) {
  try {
    const u = new URL(absoluteUrl);
    const fullPath = `${u.pathname || ""}${u.search || ""}`;

    // Rewrite when backend returns localhost
    if (isLoopbackHost(u.hostname)) {
      return ASSET_BASE ? joinBaseAndPath(ASSET_BASE, fullPath) : absoluteUrl;
    }

    // Rewrite when it looks like an asset path but host mismatches env base
    if (ASSET_BASE_URL && isLikelyAssetPath(u.pathname) && u.hostname !== ASSET_BASE_URL.hostname) {
      return joinBaseAndPath(ASSET_BASE, fullPath);
    }

    return absoluteUrl;
  } catch {
    return absoluteUrl;
  }
}

const normalizeUrl = (p) => {
  const s = String(p || "").trim();
  if (!s) return "";

  if (/^data:/i.test(s) || /^blob:/i.test(s)) return s;

  // Absolute URL
  if (/^https?:\/\//i.test(s)) return rewriteBadAbsoluteToEnvBase(s);

  // Absolute path
  if (s.startsWith("/")) return joinBaseAndPath(ASSET_BASE, s);

  // Relative path
  return joinBaseAndPath(ASSET_BASE, "/" + s);
};

const getMemberId = (m) => Number(m?.idmember ?? m?.id ?? m?.member_id ?? 0);

const fetchMemberLogos = async () => {
  try {
    if (!API_BASE) {
      throw new Error("Missing VITE_API_BASE_URL in .env");
    }

    const res = await fetch(MEMBERS_API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const json = await res.json();
    const list = Array.isArray(json) ? json : json?.data || json?.members || [];
    const arr = Array.isArray(list) ? list : [];

    memberLogos.value = arr
      // where qrpayment = 1
      .filter((m) => String(m?.qrpayment) === "1" || m?.qrpayment === true)
      // order by idmember asc
      .sort((a, b) => getMemberId(a) - getMemberId(b))
      // map to {src, alt}
      .map((m) => {
        const rawSrc = m?.image ?? m?.image_url ?? m?.logo ?? m?.img ?? m?.photo ?? m?.path ?? m?.src ?? "";
        const alt = m?.alt ?? m?.name ?? m?.bank_name ?? m?.title ?? "Member logo";
        return { src: normalizeUrl(rawSrc), alt };
      })
      .filter((x) => !!x.src);
  } catch (err) {
    console.error("Error loading member logos:", err);
    memberLogos.value = [];
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  fetchMemberLogos();
});
</script>
<template>
  <main_navbar
    title="ຜະລິດຕະພັນ ແລະ ການບໍລິການ"
    :breadcrumb="[
      'ໜ້າຫຼັກ',
      'ຜະລິດຕະພັນ ແລະ ການບໍລິການ',
      'ການຊໍາລະເງິນຂ້າມທະນາຄານຜ່ານ QR'
    ]"
    background-image="/overlaynav/product/navigatorcontent-bg.png"
  />

  <div class="productdiscription">
    <hero_sectionproduct5 />
  </div>

  <div class="benetfix">
    <product5tech />
  </div>

  <div class="footermemberproduct1">
    <product5_footerlogomember
      :subtitle="`   ການຊໍາລະຂ້າມທະນາຄານຜ່ານ LAPNet LAOQR ໂດຍນຳໃຊ້ລະບົບ LMPS ໃນການເຊື່ອມໂຍງຜ່ານ Applications ຂອງແຕ່ລະທະນາຄານທີ່ເປັນສະມາຊິກຂອງບໍລິສັດ LAPNet ໃຫ້ສາມາດນຳໃຊ້ຟັງຊັ່ນການດຳເນີນທຸລະກຳຊໍາລະຜ່ານ QR ຂອງທະນາຄານອື່ນໄດ້.`"
      :features="[
        '  ການຊໍາລະຂ້າມທະນາຄານຜ່ານ LAPNet LAOQR ໂດຍນຳໃຊ້ລະບົບ LMPS',
      ]"
      :logos="memberLogos"
    />
  </div>

  <secondfooter />
</template>

<style scoped>
.footermemberproduct1 {
  width: 100%;
  height: auto;
}

.condition p {
  width: 100%;
  padding-top: 40px;
  width: 80%;
  font-size: var(--fs-base);
  text-align: center;
}

.condition h1 {
  text-align: center;
  width: 100%;
  font-size: var(--fs-xxl);
  font-weight: bold;
}

.condition {
  width: 100%;
  height: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.benetfitcontent p {
  width: 100%;
  padding-top: 40px;
  width: 80%;
  font-size: var(--fs-base);
  text-align: center;
}

.benetfitcontent h1 {
  text-align: center;
  width: 100%;
  font-size: var(--fs-xxl);
  font-weight: bold;
}

.benetfitcontent {
  width: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 40%;
}

.benetfitcontainer {
  width: 80%;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  height: 100%;
}

.benetfix {
  width: 100%;
  height: auto;
}

.productdiscription {
  width: 100%;
  height: auto;
}
</style>
