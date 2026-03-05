<template>
  <div class="atm-page">
    <div class="content">
      <!-- LEFT PANEL -->
      <section class="left-panel">
        <h1 class="title">{{ title }}</h1>

        <p class="subtitle">
          {{ subtitle }}
        </p>

        <ul class="feature-list">
          <li v-for="(item, index) in features" :key="index">
            <i class="fa-solid fa-circle-exclamation"></i> {{ item }}
          </li>
        </ul>
      </section>

      <!-- RIGHT PANEL -->
      <section class="right-panel">
        <div class="slider-header">
          <span class="badge">{{ badgeLabel }}</span>

          <p>
            <!-- ✅ เปลี่ยนจาก badgeDescription เดิม เป็นข้อความที่นับจาก API -->
            {{ computedBadgeDescription }}
          </p>
        </div>

        <div class="cards-window">
          <!-- The animated column -->
          <div class="cards-column" ref="cardsColumn">
            <div
              v-for="card in loopCards"
              :key="card.id + '-' + card.loopKey"
              class="atm-card"
            >
              <div class="card-top">
                <!-- CHIP WITH LOGO -->
                <span class="chip">
                  <img
                    :src="card.logo"
                    :alt="card.holder + ' logo'"
                    class="chip-logo"
                  />
                </span>

                <span class="network">{{ card.network }}</span>
              </div>

              <div class="card-number">
                {{ card.number }}
              </div>

              <div class="card-bottom">
                <div class="holder">
                  <span class="label">CARD HOLDER</span>
                  <span class="value">{{ card.holder }}</span>
                </div>
                <div class="expiry">
                  <span class="label">VALID THRU</span>
                  <span class="value">{{ card.expiry }}</span>
                </div>
              </div>

              <div class="card-accent"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, defineProps, nextTick } from "vue";
import gsap from "gsap";

/**
 * ✅ Props for dynamic content
 */
const props = defineProps({
  title: {
    type: String,
    default: "ເງື່ອນໄຂການບໍລິການ",
  },
  subtitle: {
    type: String,
    default:
      "ລູກຄ້າທີ່ມີບັດ ATM ຂອງທະນາຄານທີ່ເປັນສະມາຊິກຂອງ LAPNet ສາມາດຖອນເງິນສົດຂ້າມທະນາຄານຜ່ານຕູ້ ATM ຂອງທະນາຄານສະມາຊິກ ໂດຍສາມາດສັງເກດໄດ້ຈາກສັນຍາລັກ LAPNet ວົງມົນສີຟ້າທີ່ຕິດຢູ່ໜ້າຕູ້ ATM.",
  },
  features: {
    type: Array,
    default: () => [
      "ເຊິ່ງການຖອນເງິນສົດຂ້າມຕູ້ເອທີເອັມນີ້ແມ່ນຈະຕ້ອງໄດ້ເສຍຄ່າທຳນຽມ 2,000 ກີບ ຕໍ່ ຄັ້ງ.",
    ],
  },
  primaryButtonLabel: {
    type: String,
    default: "Get Started",
  },
  badgeLabel: {
    type: String,
    default: "Member Cards",
  },
  // kept for backward compat (not used)
  badgeDescription: {
    type: String,
    default: "",
  },
});

/** =========================
 *  ✅ Load card logos from API (env only)
 *  - API: {VITE_API_BASE_URL}/api/members
 *  - where atmcashwithdraw = 1
 *  - idmember = 1 show on top
 * ========================= */
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

const cards = ref([]);

/** map member -> card object used by UI */
const mapMemberToCard = (m) => {
  const id = getMemberId(m);

  const rawLogo = m?.image ?? m?.image_url ?? m?.logo ?? m?.img ?? m?.photo ?? m?.path ?? m?.src ?? "";

  const network =
    m?.network ??
    m?.shortname ??
    m?.code ??
    m?.name ??
    m?.bank_name ??
    m?.title ??
    "Commercial Bank";

  return {
    id: 0, // will be overridden
    holder: "xxxxxxx xxxxxxx",
    number: `**** **** **** ${String((id || 0) % 10000).padStart(4, "0")}`,
    expiry: "08/27",
    network: String(network).trim(),
    logo: normalizeUrl(rawLogo),
  };
};

const fetchMemberCards = async () => {
  try {
    if (!API_BASE) {
      throw new Error("Missing VITE_API_BASE_URL in .env");
    }

    const res = await fetch(MEMBERS_API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const json = await res.json();
    const list = Array.isArray(json) ? json : json?.data || json?.members || [];
    const arr = Array.isArray(list) ? list : [];

    cards.value = arr
      .filter((m) => String(m?.atmcashwithdraw) === "1" || m?.atmcashwithdraw === true)
      .sort((a, b) => {
        const ida = getMemberId(a);
        const idb = getMemberId(b);

        if (ida === 1 && idb !== 1) return -1;
        if (idb === 1 && ida !== 1) return 1;

        return ida - idb;
      })
      .map((m, index) => {
        const card = mapMemberToCard(m);
        return {
          ...card,
          id: index + 1, // No: 1..N
          no: index + 1,
          memberId: getMemberId(m),
        };
      })
      .filter((c) => !!c.logo);
  } catch (err) {
    console.error("Error loading members for cards:", err);
    cards.value = [];
  }
};

/** ✅ Count members from API (after filter) */
const memberCount = computed(() => cards.value.length);

/** ✅ Dynamic badge description */
const computedBadgeDescription = computed(() => {
  const count = memberCount.value || 0;
  return `ທະນາຄານສະມາຊິກທັງຫມົດທີເຂົ້າຮ່ວມ : ${count} ທະນາຄານ`;
});

/** duplicate to create seamless looping */
const loopCards = computed(() => [
  ...cards.value.map((c) => ({ ...c, loopKey: "a" })),
  ...cards.value.map((c) => ({ ...c, loopKey: "b" })),
]);

/** GSAP auto scroll */
const cardsColumn = ref(null);
let tween = null;
let floatTween = null;

const initAutoScroll = () => {
  const col = cardsColumn.value;
  if (!col) return;

  const halfHeight = col.scrollHeight / 2;
  if (!halfHeight || halfHeight <= 0) return;

  tween = gsap.to(col, {
    y: -halfHeight,
    duration: 40,
    ease: "none",
    repeat: -1,
  });
};

const initFloating = () => {
  if (floatTween) {
    floatTween.kill();
    floatTween = null;
  }

  floatTween = gsap.to(".atm-card", {
    y: -8,
    duration: 2.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.1,
  });
};

const destroyAnimations = () => {
  if (tween) {
    tween.kill();
    tween = null;
  }
  if (floatTween) {
    floatTween.kill();
    floatTween = null;
  }
  if (cardsColumn.value) {
    gsap.set(cardsColumn.value, { y: 0 });
  }
};

onMounted(async () => {
  await fetchMemberCards();
  await nextTick();

  destroyAnimations();
  initAutoScroll();
  initFloating();
});

onBeforeUnmount(() => {
  destroyAnimations();
});
</script>

<style scoped>
/* (CSS เดิมทั้งหมดเหมือนของคุณ) */
.atm-page {
  width: 100%;
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
  background: linear-gradient(135deg, #0b1f4a, #1155ff);
  color: #ffffff;
  padding: 1.5rem;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
}

.content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  gap: 2rem;
}

.left-panel {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  border-radius: 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.25),
    rgba(191, 219, 254, 0.15)
  );
  box-shadow: 0 20px 40px rgba(15, 76, 129, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.title {
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: var(--fs-sm);
  color: rgba(240, 248, 255, 0.85);
  margin-bottom: 1.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: var(--fs-sm);
  color: rgba(240, 248, 255, 0.9);
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.4rem;
  border-radius: 1.5rem;
  background: linear-gradient(145deg, #0f2e7b, #1d4ed8, #3b82f6);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(191, 219, 254, 0.4);
}

.slider-header {
  margin-bottom: 1.2rem;
}

.slider-header p {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(226, 239, 255, 0.8);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 1rem;
  border-radius: 999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #2563eb, #60a5ff);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.75);
}

.cards-window {
  flex: 1;
  overflow: hidden;
  position: relative;
  border-radius: 1.4rem;
  padding: 0.5rem;
  background: radial-gradient(
    circle at 0 0,
    #3b82f6 0,
    #0f265f 55%,
    #020617 100%
  );
}

.cards-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0.2rem 0.5rem;
}

.atm-card {
  position: relative;
  width: 100%;
  min-height: 200px;
  border-radius: 1.4rem;
  padding: 1.2rem 1.4rem;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(145deg, #1d4ed8, #3b82f6, #bfdbfe);
  box-shadow: 0 16px 34px rgba(15, 40, 80, 0.85);
  border: 1px solid rgba(191, 219, 254, 0.7);
  color: #f9fbff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(16px);
}

.atm-card::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(
    circle at 0% 0%,
    rgba(255, 255, 255, 0.28),
    transparent 60%
  );
  opacity: 0.9;
  pointer-events: none;
}

.card-accent {
  position: absolute;
  inset: 12% -30%;
  background: linear-gradient(
    120deg,
    rgba(191, 219, 254, 0.4),
    rgba(96, 165, 255, 0.95),
    rgba(191, 219, 254, 0.25)
  );
  filter: blur(20px);
  opacity: 0.85;
  transform: skewX(-18deg);
  pointer-events: none;
}

.card-top {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.chip {
  width: 60px;
  height: 60px;
  border-radius: 0.9rem;
  box-shadow: 0 0 0 1px rgba(15, 46, 94, 0.25),
    0 8px 16px rgba(15, 23, 42, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.chip-logo {
  width: 70%;
  height: auto;
  object-fit: contain;
}

.network {
  font-size: 0.85rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(15, 35, 80, 0.5);
  border: 1px solid rgba(219, 234, 254, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.card-number {
  position: relative;
  z-index: 1;
  font-size: 1.25rem;
  letter-spacing: 0.22em;
  margin: 1rem 0 0.7rem;
}

.card-bottom {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(239, 246, 255, 0.95);
}

.label {
  opacity: 0.8;
  display: block;
}

.value {
  font-size: 0.85rem;
  margin-top: 0.1rem;
}

@media (max-width: 960px) {
  .content {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    padding: 1.4rem;
  }

  .atm-page {
    height: auto;
    min-height: 80vh;
  }

  .cards-window {
    max-height: calc(4 * 200px + 3 * 1rem + 1.4rem);
    overflow: hidden;
    padding-right: 0.4rem;
    background: radial-gradient(
      circle at 0 0,
      #3b82f6 0,
      #0f265f 55%,
      #020617 100%
    );
  }
}

@media (max-width: 640px) {
  .atm-page {
    padding: 1rem;
  }
}
</style>
