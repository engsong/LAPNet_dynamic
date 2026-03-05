<script setup>
import { ref, onMounted } from "vue";

import navbar from "../../components/miannavbar/main_navbar.vue";

import tagproduct from "../../components/tagproduct/tagproduct.vue";
import product3_footerlogomember from "../../components/footer/logomemberfooter/product3_footerlogomember.vue";
import cardscrolling from "./cardscrolling/cardscrolling2.vue";
import tablefee from "../../components/tablefee/tablefee.vue";
import stepwork from "./stepwork/stepwork.vue";
import hero_sectionproduct3 from "../../Views/products/product_herosection/hero_sectionproduct3.vue";
import secondfooter from "../../components/footer/mainfooter/secondfooter.vue";
import product3tech from "../techbenetfit/product3tech.vue";

// -------------------- Env-only API base (Vite) --------------------
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
  // - If base ends with "/api" and path starts with "/api/..." => drop one
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

    // Rewrite when backend returns localhost (wrong outside local machine)
    if (isLoopbackHost(u.hostname)) {
      return ASSET_BASE ? joinBaseAndPath(ASSET_BASE, fullPath) : absoluteUrl;
    }

    // Rewrite when it looks like an asset path but host does not match our env asset base
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

    // supports: [] or {data: []} or {members: []}
    const list = Array.isArray(json) ? json : json?.data || json?.members || [];
    const arr = Array.isArray(list) ? list : [];

    memberLogos.value = arr
      // where atmtransfer = 1
      .filter((m) => String(m?.atmtransfer) === "1" || m?.atmtransfer === true)
      // idmember = 1 first, then asc
      .sort((a, b) => {
        const ida = getMemberId(a);
        const idb = getMemberId(b);

        if (ida === 1 && idb !== 1) return -1;
        if (idb === 1 && ida !== 1) return 1;

        return ida - idb;
      })
      // map to component format
      .map((m) => {
        const rawSrc = m?.image ?? m?.image_url ?? m?.logo ?? m?.img ?? m?.photo ?? m?.path ?? m?.src ?? "";
        return {
          src: normalizeUrl(rawSrc),
          alt: m?.alt ?? m?.name ?? m?.bank_name ?? m?.title ?? "Member logo",
        };
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

const heroVideo = "/videos/productvdo-background.mp4";
</script>
<template>
  <navbar
    title="ຜະລິດຕະພັນ ແລະ ການບໍລິການ"
    :breadcrumb="[
      'ໜ້າຫຼັກ',
      'ຜະລິດຕະພັນ ແລະ ການບໍລິການ',
      'ໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM'
    ]"
    background-image="/overlaynav/product/navigatorcontent-bg.png"
  />

  <herosection />

  <div class="productdiscription">
    <hero_sectionproduct3 />
  </div>

  <div class="benetfix">
    <product3tech />
  </div>

  <div class="cardscrolling">
    <cardscrolling
      title="ເງື່ອນໄຂການບໍລິການ"
      :subtitle="`  ລູກຄ້າທີ່ມີບັດ ATM ຂອງທະນາຄານທີ່ເປັນສະມາຊິກຂອງ LAPNet
        ສາມາດໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM ຂອງທະນາຄານສະມາຊິກ.`"
      :features="[
        ' ຂອບເຂດການໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ເອທີເອັມ ແມ່ນສາມາດໂອນເງິນແຕ່ 1.000 ກີບ ຫາ 200.000.000 ກີບ/ຄັ້ງ. ໂດຍຈະຄິດໄລ່ຄ່າບໍລິການຕາມມູນຄ່າການໂອນດັ່ງນີ້:',
      ]"
      primary-button-label="ຜະລິດຕະພັນ ແລະ ການບໍລິການ"
      badge-label="ATM Transfer"
   
    />
  </div>

  <div class="tablefee">
    <tablefee />
  </div>

  <div class="stepwork" style="margin-top: 70px">
    <stepwork />
  </div>

  <div class="footermemberproduct1">
    <product3_footerlogomember
      :subtitle="`   ການໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ ATM ແມ່ນນຳໃຊ້ລະບົບແລັບ
            ໃນການເຊື່ອມໂຍງຕູ້ເອທີເອັມຂອງແຕ່ລະທະນາຄານທີ່ເປັນສະມາຊິກຂອງ
            ບໍລິສັດລາວ ເນເຊີນນໍເພເມັ້ນ ເນັດເວີກ ໃຫ້ສາມາດໃຊ້ຟັງຊັ່ນການໂອນເງິນ
            ຂ້າມທະນາຄານໄດ້.`"
      :features="[
        ' ຂອບເຂດການໂອນເງິນຂ້າມທະນາຄານຜ່ານຕູ້ເອທີເອັມ ແມ່ນສາມາດໂອນເງິນແຕ່ 1.000 ກີບ ຫາ 200.000.000 ກີບ/ຄັ້ງ. ',
      ]"
      :logos="memberLogos"
    />
  </div>

  <secondfooter />
</template>

<style scoped>
@media (max-width: 720px) {
}

.stepwork {
  overflow: hidden;
  width: 100%;
  height: auto;
}

.tablefee {
  width: 100%;
  height: auto;
}

.cardscrolling {
  width: 100%;
  height: auto;
}

.benetfitcontent h2 {
  font-size: var(--fs-md);
  font-weight: bold;
}

.footermemberproduct1 {
  width: 100%;
  height: auto;
}

.condition h2 {
  font-size: var(--fs-md);
  font-weight: bold;
}

.condition p {
  width: 100%;
  padding-top: 40px;
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

.atmmockup img {
  width: 80%;
  position: relative;
  z-index: 1;
  left: -100px;
  bottom: -50px;
}

.productdiscription {
  width: 100%;
  height: auto;
}
</style>
