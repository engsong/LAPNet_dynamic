<script setup lang="ts">
import navbar from "../../components/miannavbar/main_navbar.vue";
import product6benetfit from "../techbenetfit/product6benetfit.vue";
import product6swiper from "../../Views/products/swipper/product6swiper.vue";
import crossborderbtn from "../../components/button/crossborderbtn.vue";
import product6tech from "../techbenetfit/product6tech.vue";
import secondfooter from "../../components/footer/mainfooter/secondfooter.vue";
import vdoproductcrossborderKH_LA from "../../components/videoproductcrossborder/vdoproductcrossborderKH_LA.vue";
import vdoproductcrossborderLA_KH from "../../components/videoproductcrossborder/vdoproductcrossborderLA_KH.vue";
import vdoproductcrossborderTH_LA from "../../components/videoproductcrossborder/vdoproductcrossborderTH_LA.vue";
import vdoproductcrossborderLA_TH from "../../components/videoproductcrossborder/vdoproductcrossborderLA_TH.vue";
import vdoproductcrossborderVN_LA from "../../components/videoproductcrossborder/vdoproductcrossborderVN_LA.vue";
import vdoproductcrossborderCN_LA from "../../components/videoproductcrossborder/vdoproductcrossborderCN_LA.vue";
import hero_sectionproduct6 from "../../Views/products/product_herosection/hero_sectionproduct6.vue";
import product6_footerlogomember from "../../components/footer/logomemberfooter/product6_footerlogomember.vue";

import { computed, ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { gsap } from "gsap";

/** =========================
 * ✅ Load member logos from API (env only)
 * API: {VITE_API_BASE_URL}/api/members
 * Condition: crossborderproduct = 1
 * ========================= */
type MemberLogo = {
  src: string;
  alt: string;
  memberId?: number;
};

// Required in .env:
//   VITE_API_BASE_URL=http://localhost:3000
function resolveEnvBaseUrl(): string {
  // IMPORTANT: Use direct access so Vite injects import.meta.env correctly.
  const raw = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  return raw.replace(/\/+$/, "");
}

function normalizeBaseUrl(u: string): string {
  return String(u || "").trim().replace(/\/+$/, "");
}

function joinBaseAndPath(baseUrl: string, path: string): string {
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

function isLoopbackHost(hostname: string) {
  const h = String(hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0";
}

function isLikelyAssetPath(pathname: string) {
  const p = String(pathname || "");
  return /^\/(uploads|upload|images|files|static)\b/i.test(p) || p.includes("/uploads/") || p.includes("/images/");
}

const API_BASE = normalizeBaseUrl(resolveEnvBaseUrl());
const ASSET_BASE = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;
const MEMBERS_API_URL = joinBaseAndPath(API_BASE, "/api/members");

const memberLogos = ref<MemberLogo[]>([]);

const ASSET_BASE_URL = (() => {
  try {
    return ASSET_BASE ? new URL(ASSET_BASE) : null;
  } catch {
    return null;
  }
})();

function rewriteBadAbsoluteToEnvBase(absoluteUrl: string) {
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

const normalizeUrl = (p: unknown) => {
  const s = String(p ?? "").trim();
  if (!s) return "";

  if (/^data:/i.test(s) || /^blob:/i.test(s)) return s;

  // Absolute URL
  if (/^https?:\/\//i.test(s)) return rewriteBadAbsoluteToEnvBase(s);

  // Absolute path
  if (s.startsWith("/")) return joinBaseAndPath(ASSET_BASE, s);

  // Relative path
  return joinBaseAndPath(ASSET_BASE, "/" + s);
};

const getMemberId = (m: any) => Number(m?.idmember ?? m?.id ?? m?.member_id ?? 0);

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
      .filter((m: any) => String(m?.crossborderproduct) === "1" || m?.crossborderproduct === true)
      .sort((a: any, b: any) => getMemberId(a) - getMemberId(b))
      .map((m: any) => {
        const rawSrc = m?.image ?? m?.image_url ?? m?.logo ?? m?.img ?? m?.photo ?? m?.path ?? m?.src ?? "";
        const alt = m?.alt ?? m?.name ?? m?.bank_name ?? m?.title ?? "Member logo";

        return {
          src: normalizeUrl(rawSrc),
          alt,
          memberId: getMemberId(m),
        };
      })
      .filter((x: MemberLogo) => !!x.src);
  } catch (err) {
    console.error("Error loading member logos (crossborderproduct):", err);
    memberLogos.value = [];
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  fetchMemberLogos();
});

/** =========================
 * ✅ Video switch by route param
 * ========================= */
const route = useRoute();
const videoBox = ref<HTMLElement | null>(null);

const pair = computed(() => (route.params.pair as string) || "kh-la");

const currentVideoComponent = computed(() => {
  switch (pair.value) {
    case "kh-la":
      return vdoproductcrossborderKH_LA;
    case "la-kh":
      return vdoproductcrossborderLA_KH;
    case "th-la":
      return vdoproductcrossborderTH_LA;
    case "la-th":
      return vdoproductcrossborderLA_TH;
    case "vn-la":
    case "la-vn":
      return vdoproductcrossborderVN_LA;
    case "cn-la":
    case "la-cn":
      return vdoproductcrossborderCN_LA;
    default:
      return vdoproductcrossborderCN_LA;
  }
});

watch(
  pair,
  () => {
    if (!videoBox.value) return;

    gsap.fromTo(
      videoBox.value,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 2.0, ease: "power3.out" }
    );
  },
  { immediate: true }
);

const globeConfig = {
  globeColor: "#071126",
  emissive: "#0b1733",
  emissiveIntensity: 0.28,
  shininess: 1.1,
  atmosphereColor: "#67e8f9",
  showAtmosphere: true,
  atmosphereAltitude: 0.17,
  polygonColor: "rgba(110,168,255,0.14)",
  ambientLight: "#b7d8ff",
  directionalLeftLight: "#6ee7ff",
  directionalTopLight: "#9f7aea",
  pointLight: "#7dd3fc",
  arcTime: 4200,
  arcLength: 0.16,
  rings: 1,
  maxRings: 4.5,
  autoRotate: true,
  autoRotateSpeed: 0.55,
};

const baseHubByPair: Record<string, GlobePoint> = {
  "kh-la": { lat: 11.5564, lng: 104.9282 },
  "la-kh": { lat: 17.9757, lng: 102.6331 },
  "th-la": { lat: 13.7563, lng: 100.5018 },
  "la-th": { lat: 17.9757, lng: 102.6331 },
  "vn-la": { lat: 21.0278, lng: 105.8342 },
  "la-vn": { lat: 17.9757, lng: 102.6331 },
  "cn-la": { lat: 25.0389, lng: 102.7183 },
  "la-cn": { lat: 17.9757, lng: 102.6331 },
};

const neonPalette = [
  "rgba(34,211,238,0.92)",
  "rgba(125,211,252,0.9)",
  "rgba(103,232,249,0.88)",
  "rgba(192,132,252,0.88)",
  "rgba(96,165,250,0.9)",
  "rgba(45,212,191,0.88)",
];

const worldTargets: GlobePoint[] = [
  { lat: 17.9757, lng: 102.6331 },
  { lat: 13.7563, lng: 100.5018 },
  { lat: 11.5564, lng: 104.9282 },
  { lat: 21.0278, lng: 105.8342 },
  { lat: 1.3521, lng: 103.8198 },
  { lat: 35.6762, lng: 139.6503 },
  { lat: 25.2048, lng: 55.2708 },
  { lat: 50.1109, lng: 8.6821 },
  { lat: 51.5072, lng: -0.1276 },
  { lat: 40.7128, lng: -74.006 },
  { lat: -33.8688, lng: 151.2093 },
  { lat: -23.5505, lng: -46.6333 },
];

const arcData = computed<GlobeArcInput[]>(() => {
  const hub = baseHubByPair[pair.value] ?? { lat: 17.9757, lng: 102.6331 };
  const forwardRoutes = worldTargets
    .filter((target) => !(target.lat === hub.lat && target.lng === hub.lng))
    .slice(0, 8)
    .map((target, index) => ({
      order: index + 1,
      startLat: hub.lat,
      startLng: hub.lng,
      endLat: target.lat,
      endLng: target.lng,
      arcAlt: 0.18 + ((index % 4) * 0.06),
      color: neonPalette[index % neonPalette.length],
    }));

  const returnRoutes = worldTargets
    .slice(2, 6)
    .map((target, index) => ({
      order: forwardRoutes.length + index + 1,
      startLat: target.lat,
      startLng: target.lng,
      endLat: hub.lat,
      endLng: hub.lng,
      arcAlt: 0.16 + ((index % 3) * 0.05),
      color: neonPalette[(index + 3) % neonPalette.length],
    }));

  return [...forwardRoutes, ...returnRoutes];
});
</script>
<template>
  <navbar
    title="ຜະລິດຕະພັນ ແລະ ການບໍລິການ"
    :breadcrumb="[
      'ໜ້າຫຼັກ',
      'ຜະລິດຕະພັນ ແລະ ການບໍລິການ',
      'ຊຳລະຂ້າມແດນໃນຮູບແບບ QR CODE ລະຫວ່າງປະເທດ'
    ]"
    background-image="/overlaynav/product/navigatorcontent-bg.png"
  />

  <div class="productdiscription">
    <hero_sectionproduct6 />
  </div>

  <div class="benetfix">
    <product6benetfit />
  </div>

  <div class="slidecontainer">
    <product6swiper :globe-config="globeConfig" :data="arcData" />
  </div>

  <div class="crossborderinfo">
    <div class="boxmargin" style="width: 100%; height: 15vh"></div>

    <div class="titlecrossborder">
      <h1 id="memberjoin">ທະນາຄານສະມາຊິກທີ່ເຂົ້າຮ່ວມ</h1>
      <crossborderbtn />
    </div>

    <div class="videocontainer">
      <div class="videocorssbordershow" ref="videoBox">
        <component :is="currentVideoComponent" :key="pair" />
      </div>
    </div>
  </div>

  <div class="descriptionforcustomer">
    <product6tech />
  </div>

  <div class="footermember">
    <!-- ✅ ส่ง logos ที่ get จาก API (crossborderproduct=1) -->
    <product6_footerlogomember :subtitle="`  ຊຳລະຂ້າມແດນຜ່ານ QR CODE ບໍລິສັດ LAPNet ໄດ້ຕໍ່ຍອດການພັດທະນາລະບົບຊຳລະຂ້າມທະນາຄານເທິງມືຖື (LMPS) ເພື່ອຂະຫຍາຍຜະລິດຕະພັນ ຊຳລະຂ້າມທະນາຄານ ໃຫ້ສາມາດຮອງຮັບການ ຊຳລະ ຄ່າສິນຄ້າ - ບໍລິການ ລະຫວ່າງປະເທດ`"
      :features="[
        'ປັດຈຸບັນ LAPNet ໄດ້ຮ່ວມໂຄງການກັບ 4 ປະເທດຄື: ປະເທດກຳປູເຈຍ, ປະເທດໄທ, ປະເທດຈີນ ແລະ ປະເທດຫວຽດນາມ. ',
      ]"
      :logos="memberLogos" />
  </div>

  <secondfooter />
</template>

<style scoped>
.footermember {
  width: 100%;
  height: auto;
}

.descriptionforcustomer {
  width: 100%;
  height: auto;
}

.videocontainer {
  width: 100%;
  height: auto;
}

@media (max-width: 518px) {
  #memberjoin {
    font-size: 2.3rem;
  }
}

.titlecrossborder h1 {
  font-size: var(--fs-hero);
  font-weight: bold;
  color: #0025b8;
  background-image: linear-gradient(45deg, #312ba4, #0d1c9c 8%, #00a6ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.titlecrossborder {
  width: 100%;
  height: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.crossborderinfo {
  width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .slidecontainer {
    display: none;
  }
}

.slidecontainer {
  width: 100%;
  height: 79vh;
}

.footermemberproduct1 {
  width: 100%;
  height: 100vh;
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
