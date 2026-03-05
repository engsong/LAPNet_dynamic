<script setup>
import { ref, onMounted } from "vue";

import navbar from "../../components/miannavbar/main_navbar.vue";

import tagproduct from "../../components/tagproduct/tagproduct.vue";
import product4_footerlogomember from "../../components/footer/logomemberfooter/product4_footerlogomember.vue";
import product4tech from "../techbenetfit/product4tech.vue";
import logofloating from "../../components/logofloating/logofloating.vue";
import tablefee from "../../components/tablefee/tablefee.vue";
import hero_sectionproduct4 from "../../Views/products/product_herosection/hero_sectionproduct4.vue";
import secondfooter from "../../components/footer/mainfooter/secondfooter.vue";
import iconfloating from "./iconfloat/iconfloating.vue";

const heroVideo = "/videos/productvdo-background.mp4";

/** =========================
 * ✅ Load member logos from API (env only)
 * API: {VITE_API_BASE_URL}/api/members
 * Condition: mobiletransfer = 1
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
      // where mobiletransfer = 1
      .filter((m) => String(m?.mobiletransfer) === "1" || m?.mobiletransfer === true)
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
  <navbar
    title="ຜະລິດຕະພັນ ແລະ ການບໍລິການ"
    :breadcrumb="[
      'ໜ້າຫຼັກ',
      'ຜະລິດຕະພັນ ແລະ ການບໍລິການ',
      'ໂອນເງິນຂ້າມທະນາຄານເທິງມືຖື'
    ]"
    background-image="/overlaynav/product/navigatorcontent-bg.png"
  />

  <div class="productdiscription">
    <hero_sectionproduct4 />
  </div>

  <div class="benetfix">
    <product4tech />
  </div>

  <div class="condition_for_use">
    <iconfloating />
  </div>

  <div class="boxmargin" style="width: 100%; height: 15vh"></div>

  <div class="tablefee">
    <tablefee />
  </div>

  <div class="boxmargin" style="width: 100%; height: 15vh"></div>

  <div class="footermemberproduct1">
    <product4_footerlogomember
      :subtitle="`  ການໂອນເງິນຂ້າມທະນາຄານເທິງມືຖື (Fund Transfer via Mobile
            Application) ໂດຍນຳໃຊ້ລະບົບ LMPS ໃນການເຊື່ອມໂຍງຜ່ານ
            Applications ຂອງແຕ່ລະທະນາຄານທີ່ເປັນສະມາຊິກຂອງບໍລິສັດລາວ
            ເນເຊີນນໍເພເມັ້ນ ເນັດເວີກ ໃຫ້ສາມາດໃຊ້ຟັງຊັ່ນການດຳເນີນທຸລະກຳໂອນ
            ເງິນຂ້າມທະນາຄານໄດ້.`"
      :features="[
        ' ຂອບເຂດການໂອນເງິນຂ້າມທະນາຄານເທິງມືຖື ແມ່ນສາມາດໂອນເງິນແຕ່ 1.000 ກີບ ຫາ 200.000.000 ກີບ/ຄັ້ງ. ',
      ]"
      :logos="memberLogos"
    />
  </div>

  <secondfooter />
</template>

<style scoped>
.tablefee {
  width: 100%;
  height: auto;
}

@media (max-width: 720px) {
}

.tablefee {
  width: 100%;
  height: auto;
}

@media (max-width: 921px) {
  .logofloatings {
    display: none;
  }

  #titlecondition {
    width: 100%;
    height: 100%;
  }
}

@media (max-width: 1140px) {
  #redponsivetitlebox {
    font-size: 3.3rem;
    font-weight: bold;
  }
}

@media (max-width: 515) {
  #redponsivetitlebox {
    font-size: 2rem;
    font-weight: bold;
  }
}

.condition_for_use {
  width: 100%;
  height: auto;
}

.techbtn {
  width: 100%;
  height: 15%;
}

.warning p i {
  font-size: 10px;
  margin-right: 10px;
  color: rgb(0, 76, 255);
}

.warning p {
  font-weight: 500;
}

.warning {
  font-size: var(--fs-base);
  width: 100%;
  height: 15%;
}

.script {
  width: 100%;
  height: 15%;
  font-size: var(--fs-base);
}

.titlebox h1 {
  font-size: 5rem;
  font-weight: bold;
}

.titlebox {
  width: 100%;
  height: 20%;
}

.logofloatings {
  width: 45%;
  height: 90%;
}

.footermemberproduct1 {
  width: 100%;
  height: auto;
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
