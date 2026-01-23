<template>
  <section ref="root" class="why">
    <!-- subtle glow/noise -->
    <div class="whyBg" aria-hidden="true">
      <div class="glow g1"></div>
      <div class="glow g2"></div>
      <div class="noise"></div>
    </div>

    <div class="whyInner">
      <header class="whyHead">
        <div class="kicker">WHY CHOOSE US</div>

        <h2 class="title">
          <span class="titleStrong">{{ title }}</span>
          <span class="titleAccent">.</span>
        </h2>

        <p class="desc">{{ description }}</p>
      </header>

      <div class="stats">
        <!-- Box 1 -->
        <article
          ref="card1"
          class="card cardClickable"
          role="button"
          tabindex="0"
          @click="openOverlay('banks')"
          @keydown.enter.prevent="openOverlay('banks')"
          @keydown.space.prevent="openOverlay('banks')"
        >
          <div class="cardTop">
            <div class="iconOrb" aria-hidden="true">
              <i class="fa-solid fa-building-columns"></i>
            </div>

            <div class="meta">
              <div class="label">{{ stat1Label }}</div>
              <div class="value">
                <span ref="count1El" class="count">0</span>
                <span class="suffix">{{ stat1Suffix }}</span>
              </div>
            </div>
          </div>

          <p class="sub">{{ stat1Sub }}</p>

          <div class="ctaRow" aria-hidden="true">
            <span class="ctaText">View members</span>
            <span class="ctaDot"></span>
          </div>
        </article>

        <!-- Box 2 -->
        <article
          ref="card2"
          class="card cardAccent cardClickable"
          role="button"
          tabindex="0"
          @click="openOverlay('right')"
          @keydown.enter.prevent="openOverlay('right')"
          @keydown.space.prevent="openOverlay('right')"
        >
          <div class="cardTop">
            <div class="iconOrb" aria-hidden="true">
              <i class="fa-solid fa-wallet"></i>
            </div>

            <div class="meta">
              <div class="label">{{ stat2Label }}</div>
              <div class="value">
                <span ref="count2El" class="count">0</span>
                <span class="suffix">{{ stat2Suffix }}</span>
              </div>
            </div>
          </div>

          <p class="sub">{{ stat2Sub }}</p>

          <div class="ctaRow" aria-hidden="true">
            <span class="ctaText">View members</span>
            <span class="ctaDot"></span>
          </div>
        </article>
      </div>
    </div>

    <!-- Overlay / Modal -->
    <teleport to="body">
      <div v-if="overlayOpen" class="overlay" role="dialog" aria-modal="true" aria-label="Members Directory">
        <div ref="overlayBackdrop" class="overlayBackdrop" @click="closeOverlay()"></div>

        <div ref="overlayPanel" class="overlayPanel">
          <header class="overlayHead">
            <div class="overlayTitleWrap">
              <h3 class="overlayTitle">
                <span class="overlayTitleStrong">ສະມາຊິກທັງໝົດຂອງ LAPNet</span>
                <span class="overlayTitleAccent">.</span>
              </h3>

              <p class="overlayDesc">
                {{ banksCount }} ທະນາຄານສະມາຊິກ ແລະ {{ fintechCount }} Fintech
              </p>
            </div>

            <button class="overlayClose" type="button" @click="closeOverlay()" aria-label="Close">
              <span class="x"></span>
            </button>
          </header>

          <div class="overlayGrid">
            <!-- BANKS -->
            <section v-if="overlayType === 'banks'" class="panel panelActive">
              <div class="panelTop">
                <div class="panelLeft">
                  <div class="panelIcon" aria-hidden="true">
                    <i class="fa-solid fa-building-columns"></i>
                  </div>
                  <div>
                    <div class="panelLabel">Commercial Bank</div>
                    <div class="panelMeta">
                      {{ filteredMembers.length }}
                      <span class="muted">/ {{ totalMembers }}</span>
                      members
                    </div>
                  </div>
                </div>

                <!-- ✅ Search bar -->
                <div class="panelTools">
                  <div class="searchWrap" role="search">
                    <span class="searchIcon" aria-hidden="true">🔍</span>
                    <input
                      v-model="searchText"
                      class="searchInput"
                      type="text"
                      placeholder="Search Commercial Bank..."
                      autocomplete="off"
                    />
                    <button
                      v-if="searchText"
                      class="searchClear"
                      type="button"
                      @click="searchText = ''"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <div class="memberGrid" ref="memberGridEl" :key="'banks' + searchText">
                <!-- ✅ Loading / Error states for API -->
                <div v-if="banksLoading" class="emptyState">Loading...</div>
                <div v-else-if="banksError" class="emptyState">{{ banksError }}</div>

                <template v-else>
                  <article
                    v-for="(m, i) in filteredMembers"
                    :key="'bank' + (m.id ?? i)"
                    class="memberCard"
                    @mouseenter="onMemberEnter"
                    @mouseleave="onMemberLeave"
                  >
                    <div class="memberTop">
                      <div class="logoWrap">
                        <img v-if="m.logo" class="logoImg" :src="m.logo" :alt="m.name" loading="lazy" />
                        <div v-else class="logoFallback" aria-hidden="true">
                          {{ initials(m.name) }}
                        </div>
                      </div>

                      <!-- ✅ Hover actions -->
                      <div class="memberActions" aria-hidden="true">
                        <a
                          v-if="m.facebookUrl"
                          class="actBtn actFb"
                          :href="m.facebookUrl"
                          target="_blank"
                          rel="noopener"
                          title="Facebook"
                          aria-label="Open Facebook"
                        >
                          <i class="fa-brands fa-facebook-f"></i>
                        </a>

                        <a
                          v-if="m.websiteUrl"
                          class="actBtn actWeb"
                          :href="m.websiteUrl"
                          target="_blank"
                          rel="noopener"
                          title="Website"
                          aria-label="Open Website"
                        >
                          <i class="fa-solid fa-globe"></i>
                        </a>
                      </div>
                    </div>

                    <div class="memberName">{{ m.name }}</div>
                  </article>

                  <div v-if="!filteredMembers.length" class="emptyState">
                    ບໍ່ພົບຜົນການຄົ້ນຫາ
                  </div>
                </template>
              </div>
            </section>

            <!-- FINTECH (memberRight from API) -->
            <section v-else class="panel panelActive">
              <div class="panelTop">
                <div class="panelLeft">
                  <div class="panelIcon alt" aria-hidden="true">
                    <i class="fa-solid fa-wallet"></i>
                  </div>
                  <div>
                    <div class="panelLabel">Fintech</div>
                    <div class="panelMeta">
                      {{ filteredMembers.length }}
                      <span class="muted">/ {{ totalMembers }}</span>
                      members
                    </div>
                  </div>
                </div>

                <!-- ✅ Search bar -->
                <div class="panelTools">
                  <div class="searchWrap" role="search">
                    <span class="searchIcon" aria-hidden="true">🔍</span>
                    <input
                      v-model="searchText"
                      class="searchInput"
                      type="text"
                      placeholder="Search Fintech..."
                      autocomplete="off"
                    />
                    <button
                      v-if="searchText"
                      class="searchClear"
                      type="button"
                      @click="searchText = ''"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <div class="memberGrid" ref="memberGridEl" :key="'right' + searchText">
                <!-- ✅ Loading / Error states for API -->
                <div v-if="fintechLoading" class="emptyState">Loading...</div>
                <div v-else-if="fintechError" class="emptyState">{{ fintechError }}</div>

                <template v-else>
                  <article
                    v-for="(m, i) in filteredMembers"
                    :key="'fintech' + (m.id ?? i)"
                    class="memberCard"
                    @mouseenter="onMemberEnter"
                    @mouseleave="onMemberLeave"
                  >
                    <div class="memberTop">
                      <div class="logoWrap">
                        <img v-if="m.logo" class="logoImg" :src="m.logo" :alt="m.name" loading="lazy" />
                        <div v-else class="logoFallback" aria-hidden="true">
                          {{ initials(m.name) }}
                        </div>
                      </div>

                      <!-- ✅ Hover actions -->
                      <div class="memberActions" aria-hidden="true">
                        <a
                          v-if="m.facebookUrl"
                          class="actBtn actFb"
                          :href="m.facebookUrl"
                          target="_blank"
                          rel="noopener"
                          title="Facebook"
                          aria-label="Open Facebook"
                        >
                          <i class="fa-brands fa-facebook-f"></i>
                        </a>

                        <a
                          v-if="m.websiteUrl"
                          class="actBtn actWeb"
                          :href="m.websiteUrl"
                          target="_blank"
                          rel="noopener"
                          title="Website"
                          aria-label="Open Website"
                        >
                          <i class="fa-solid fa-globe"></i>
                        </a>
                      </div>
                    </div>

                    <div class="memberName">{{ m.name }}</div>
                  </article>

                  <div v-if="!filteredMembers.length" class="emptyState">
                    ບໍ່ພົບຜົນການຄົ້ນຫາ
                  </div>
                </template>
              </div>
            </section>
          </div>

          <footer class="overlayFooter">
            <div class="footerPill">
              <span class="pillDot" style="width: 25px; height: 25px">
                <img src="/logolapnet/fullcircle.png" alt="" style="width: 100%; height: 100%; object-fit: contain" />
              </span>
              <span class="pillText">Lao National Payment Network CO., LTD</span>
            </div>
          </footer>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue";
import { gsap } from "gsap";

type OverlayType = "banks" | "right";

type Member = {
  id?: number; // for ordering / future key usage
  name: string;
  logo?: string;
  facebookUrl?: string;
  websiteUrl?: string;
};

/** ✅ API shape (เพิ่ม field fintech) */
type ApiMember = {
  idmember: number | string;
  fintech?: number | string | null; // ✅ 0/1 จาก API
  BanknameLA?: string;
  BanknameEN?: string;
  LinkFB?: string | null;
  LinkWeb?: string | null;
  image_url?: string | null;
};

type Props = {
  title?: string;
  description?: string;

  stat1Value?: number; // fallback if API not ready
  stat1Label?: string;
  stat1Suffix?: string;
  stat1Sub?: string;

  stat2Value?: number;
  stat2Label?: string;
  stat2Suffix?: string;
  stat2Sub?: string;
};

const props = withDefaults(defineProps<Props>(), {
  title: "Built for real results",
  description:
    "We deliver secure, scalable experiences with modern design, clear performance, and dedicated support — helping your network grow with confidence.",

  stat1Value: 19,
  stat1Label: "Commercial Bank",
  stat1Suffix: "+",
  stat1Sub: "ທະນາຄານສະມາຊິກທີ່ເຂົ້າຮ່ວມກັບ Lao National Payment Network CO., LTD",

  stat2Value: 2,
  stat2Label: "Members",
  stat2Suffix: "+",
  stat2Sub: "2 Fintech ທີເຂົ້າຮ່ວມກັບ Lao National Payment Network CO., LTD",
});

/** ✅ API */
const MEMBERS_API = "http://localhost:3000/api/members";
const API_BASE = "http://localhost:3000";

/** ✅ BANKS fintech=0 */
const banksFromApi = ref<Member[]>([]);
const banksLoading = ref(false);
const banksError = ref<string | null>(null);

/** ✅ FINTECH fintech=1 */
const fintechFromApi = ref<Member[]>([]);
const fintechLoading = ref(false);
const fintechError = ref<string | null>(null);

const resolveLogo = (u?: string | null) => {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  try {
    return new URL(u, API_BASE).toString();
  } catch {
    return u || undefined;
  }
};

const toFlag = (v: any): number => {
  // รองรับ 0/1, "0"/"1", true/false
  if (v === true) return 1;
  if (v === false) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** ✅ Fetch ครั้งเดียว แล้วแยกเป็น BANKS/FINTECH ตาม fintech=0/1 */
const loadMembers = async () => {
  banksLoading.value = true;
  fintechLoading.value = true;
  banksError.value = null;
  fintechError.value = null;

  try {
    const res = await fetch(MEMBERS_API, { method: "GET" });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);

    const json = await res.json();
    const arr: ApiMember[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];

    const mapped = arr
      .map((raw) => ({
        raw,
        id: Number(raw?.idmember),
        fintech: toFlag((raw as any)?.fintech),
      }))
      .filter((x) => Number.isFinite(x.id))
      .sort((a, b) => a.id - b.id);

    const banks = mapped
      .filter((x) => x.fintech === 0)
      .map(({ raw, id }) => ({
        id,
        name: String(raw.BanknameLA || raw.BanknameEN || "").trim(),
        facebookUrl: raw.LinkFB ? String(raw.LinkFB).trim() : undefined,
        websiteUrl: raw.LinkWeb ? String(raw.LinkWeb).trim() : undefined,
        logo: resolveLogo(raw.image_url),
      }))
      .filter((m) => m.name.length > 0);

    const fintech = mapped
      .filter((x) => x.fintech === 1)
      .map(({ raw, id }) => ({
        id,
        name: String(raw.BanknameEN || raw.BanknameLA || "").trim(),
        facebookUrl: raw.LinkFB ? String(raw.LinkFB).trim() : undefined,
        websiteUrl: raw.LinkWeb ? String(raw.LinkWeb).trim() : undefined,
        logo: resolveLogo(raw.image_url),
      }))
      .filter((m) => m.name.length > 0);

    banksFromApi.value = banks;
    fintechFromApi.value = fintech;
  } catch (e: any) {
    banksFromApi.value = [];
    fintechFromApi.value = [];
    const msg = e?.message ? String(e.message) : "Unknown error";
    banksError.value = `Failed to load members: ${msg}`;
    fintechError.value = `Failed to load members: ${msg}`;
  } finally {
    banksLoading.value = false;
    fintechLoading.value = false;
  }
};

const banksCount = computed(() => banksFromApi.value.length || props.stat1Value);
const fintechCount = computed(() => fintechFromApi.value.length || props.stat2Value);

/** ===== Refs ===== */
const root = ref<HTMLElement | null>(null);
const card1 = ref<HTMLElement | null>(null);
const card2 = ref<HTMLElement | null>(null);

const count1El = ref<HTMLElement | null>(null);
const count2El = ref<HTMLElement | null>(null);

let io: IntersectionObserver | null = null;
let played = false;

const animateCount = (el: HTMLElement, target: number) => {
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 1.25,
    ease: "power3.out",
    onUpdate: () => {
      el.textContent = Math.floor(obj.v).toLocaleString();
    },
    onComplete: () => {
      el.textContent = Math.round(target).toLocaleString();
    },
  });
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
};

/** Overlay state */
const overlayOpen = ref(false);
const overlayType = ref<OverlayType>("banks");
const searchText = ref("");

const overlayBackdrop = ref<HTMLElement | null>(null);
const overlayPanel = ref<HTMLElement | null>(null);
const memberGridEl = ref<HTMLElement | null>(null);

let overlayTl: gsap.core.Timeline | null = null;

/** Fix overlay “layout jump” when locking scroll */
let prevBodyPaddingRight = "";
const lockScroll = () => {
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  prevBodyPaddingRight = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
};
const unlockScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = prevBodyPaddingRight;
};

const openOverlay = (type: OverlayType) => {
  overlayType.value = type;
  searchText.value = "";
  overlayOpen.value = true;
};

const closeOverlay = () => {
  overlayTl?.kill();
  overlayTl = null;

  overlayOpen.value = false;

  unlockScroll();
  document.removeEventListener("keydown", onKey);
};

/** ESC close */
const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape" && overlayOpen.value) closeOverlay();
};

const normalize = (s: string) => s.trim().toLowerCase();

const totalMembers = computed(() =>
  overlayType.value === "banks" ? banksFromApi.value.length : fintechFromApi.value.length
);

const filteredMembers = computed<Member[]>(() => {
  const q = normalize(searchText.value);
  const list = overlayType.value === "banks" ? banksFromApi.value : fintechFromApi.value;
  if (!q) return list;
  return list.filter((m) => normalize(m.name).includes(q));
});

const animateMembers = () => {
  const el = memberGridEl.value;
  if (!el) return;
  const cards = el.querySelectorAll(".memberCard");
  if (!cards.length) return;

  gsap.killTweensOf(cards);
  gsap.fromTo(
    cards,
    { autoAlpha: 0, y: 10 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.35,
      ease: "power3.out",
      stagger: 0.025,
      overwrite: true,
    }
  );
};

// hover actions (GSAP)
const onMemberEnter = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement | null;
  if (!card) return;

  const actions = card.querySelector(".memberActions") as HTMLElement | null;
  if (!actions) return;

  gsap.killTweensOf(actions);
  gsap.set(actions, { pointerEvents: "auto" });
  gsap.to(actions, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: 0.18,
    ease: "power3.out",
    overwrite: true,
  });
};

const onMemberLeave = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement | null;
  if (!card) return;

  const actions = card.querySelector(".memberActions") as HTMLElement | null;
  if (!actions) return;

  gsap.killTweensOf(actions);
  gsap.to(actions, {
    autoAlpha: 0,
    y: 6,
    scale: 0.98,
    duration: 0.16,
    ease: "power2.inOut",
    overwrite: true,
    onComplete: () => {
      if (actions) gsap.set(actions, { pointerEvents: "none" });
    },
  });
};

watch(overlayType, async () => {
  searchText.value = "";
  await nextTick();
  animateMembers();
});

watch(searchText, async () => {
  await nextTick();
  animateMembers();
});

watch(overlayOpen, async (isOpen) => {
  if (isOpen) {
    document.addEventListener("keydown", onKey);
    lockScroll();

    await nextTick();

    overlayTl?.kill();
    overlayTl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    const panel = overlayPanel.value;
    const back = overlayBackdrop.value;
    if (!panel || !back) return;

    const head = panel.querySelectorAll(".overlayTitle, .overlayDesc");
    const cols = panel.querySelectorAll(".panel");
    const memberCards = panel.querySelectorAll(".memberCard");

    gsap.set(back, { opacity: 0 });
    gsap.set(panel, { opacity: 0, y: 18, scale: 0.985 });
    gsap.set(head, { opacity: 0, y: 10 });
    gsap.set(cols, { opacity: 0, y: 10 });
    gsap.set(memberCards, { opacity: 0, y: 10 });

    const actions = panel.querySelectorAll(".memberActions");
    gsap.set(actions, { autoAlpha: 0, y: 6, scale: 0.98, pointerEvents: "none" });

    overlayTl
      .to(back, { opacity: 1, duration: 0.22 })
      .to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.3 }, "-=0.06")
      .to(head, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, "-=0.1")
      .to(cols, { opacity: 1, y: 0, duration: 0.35 }, "-=0.18")
      .to(memberCards, { opacity: 1, y: 0, duration: 0.32, stagger: 0.02 }, "-=0.22");
  } else {
    overlayTl?.kill();
    overlayTl = null;
    unlockScroll();
    document.removeEventListener("keydown", onKey);
  }
});

/** ✅ If API finishes after section animation, update the counts */
watch(
  () => banksFromApi.value.length,
  (len) => {
    if (!played) return;
    if (!count1El.value) return;
    if (len > 0) animateCount(count1El.value, len);
  }
);

watch(
  () => fintechFromApi.value.length,
  (len) => {
    if (!played) return;
    if (!count2El.value) return;
    if (len > 0) animateCount(count2El.value, len);
  }
);

onMounted(() => {
  loadMembers();

  if (!root.value) return;

  gsap.set([card1.value, card2.value], { y: 18, opacity: 0 });
  gsap.set(root.value.querySelectorAll(".kicker, .title, .desc"), { y: 10, opacity: 0 });

  io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || played) return;
      played = true;

      const headingEls = root.value?.querySelectorAll(".kicker, .title, .desc") ?? [];
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(headingEls, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 }).to(
        [card1.value, card2.value],
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 },
        "-=0.2"
      );

      if (count1El.value) animateCount(count1El.value, banksCount.value);
      if (count2El.value) animateCount(count2El.value, fintechCount.value);
    },
    { threshold: 0.25 }
  );

  io.observe(root.value);
});

onBeforeUnmount(() => {
  io?.disconnect();
  io = null;
  document.removeEventListener("keydown", onKey);
  unlockScroll();
  overlayTl?.kill();
  overlayTl = null;
});
</script>

<style scoped>
/* ====== Layout ====== */
.why {
  position: relative;
  overflow: hidden;

  padding: clamp(22px, 4vw, 224px);
  color: rgba(255, 255, 255, 0.92);

  background:
    radial-gradient(900px 520px at 12% 18%, rgba(4, 29, 255, 0.16), transparent 60%),
    radial-gradient(840px 520px at 80% 34%, rgba(99, 102, 241, 0.16), transparent 62%),
    linear-gradient(180deg, #06081a 0%, #071437 45%, #0a1b46 70%, #2d2bd6 140%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.whyInner {
  position: relative;
  z-index: 1;
  max-width: 1380px;
  margin: 0 auto;
}

.whyHead {
  max-width: 1380px;
}

.kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 0.18em;
  font-weight: 700;
  opacity: 0.86;
  text-transform: uppercase;
}

.kicker::before {
  content: "";
  width: 18px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 1), rgba(99, 102, 241, 1));
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
}

.title {
  margin: 10px 0 10px;
  font-size: clamp(34px, 4.6vw, 58px);
  line-height: 1.02;
  letter-spacing: -0.02em;
  font-weight: 800;
}

.titleStrong {
  color: rgba(255, 255, 255, 0.96);
}

.titleAccent {
  background: linear-gradient(90deg, rgba(56, 189, 248, 1), rgba(99, 102, 241, 1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.desc {
  margin: 0;
  max-width: 88ch;
  font-size: 15px;
  line-height: 1.7;

  text-align: justify;
  color: rgba(255, 255, 255, 0.72);
}

/* ====== Stats Cards ====== */
.stats {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.card {
  position: relative;
  border-radius: 18px;
  padding: 16px 16px 14px;
  background: rgba(8, 12, 28, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  user-select: none;
}

.cardClickable {
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  outline: none;
}

.cardClickable:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}

.cardClickable:focus-visible {
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 3px rgba(56, 189, 248, 0.22);
}

.card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(700px 140px at 12% 0%, rgba(56, 189, 248, 0.18), transparent 70%);
  pointer-events: none;
}

.cardAccent::before {
  background: radial-gradient(700px 140px at 12% 0%, rgba(99, 102, 241, 0.22), transparent 70%);
}

.cardTop {
  display: flex;
  gap: 12px;
  align-items: center;
}

.iconOrb i {
  font-size: 1.2rem;
}

.iconOrb {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.35), transparent 45%),
    linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(99, 102, 241, 0.22));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 0 22px rgba(56, 189, 248, 0.18);
  display: grid;
  place-items: center;
}

.meta {
  display: grid;
  gap: 2px;
}

.label {
  font-size: 15px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.68);
  font-weight: 700;
}

.value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.count {
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.suffix {
  font-weight: 900;
  font-size: 18px;
  opacity: 0.9;
  background: linear-gradient(90deg, rgba(56, 189, 248, 1), rgba(99, 102, 241, 1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sub {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.ctaRow {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  opacity: 0.9;
}

.ctaText {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.78);
}

.ctaDot {
  width: 26px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 1), rgba(99, 102, 241, 1));
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.22);
}

/* ====== Overlay / Modal (Fit screen) ====== */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 14px;
}

.overlayBackdrop {
  position: absolute;
  inset: 0;
  background: rgba(2, 4, 12, 0.72);
  backdrop-filter: blur(10px);
}

/* ✅ Fits viewport + fixes mobile “vh jump” */
.overlayPanel {
  position: relative;
  z-index: 1;

  width: min(980px, calc(100vw - 28px));
  height: min(820px, calc(100vh - 28px));
  max-height: calc(100vh - 28px);

  border-radius: 22px;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  background:
    radial-gradient(900px 400px at 10% 0%, rgba(56, 189, 248, 0.12), transparent 55%),
    radial-gradient(900px 400px at 90% 0%, rgba(99, 102, 241, 0.12), transparent 60%),
    rgba(10, 14, 30, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 30px 120px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ✅ Prefer dvh on modern mobile browsers */
@supports (height: 100dvh) {
  .overlayPanel {
    height: min(820px, calc(100dvh - 28px));
    max-height: calc(100dvh - 28px);
  }
}

.overlayHead {
  padding: 16px 16px 10px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
}

.overlayTitle {
  margin: 0 0 8px;
  font-size: clamp(22px, 3vw, 32px);
  line-height: 1.06;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.overlayTitleStrong {
  color: rgba(255, 255, 255, 0.95);
}

.overlayTitleAccent {
  background: linear-gradient(90deg, rgba(56, 189, 248, 1), rgba(99, 102, 241, 1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.overlayDesc {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-size: 14px;
  max-width: 74ch;
}

.overlayClose {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
  flex: 0 0 auto;
}

.overlayClose:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.22);
}

.x {
  width: 16px;
  height: 16px;
  position: relative;
}

.x::before,
.x::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 16px;
  height: 2px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.85);
}

.x::before {
  transform: rotate(45deg);
}

.x::after {
  transform: rotate(-45deg);
}

/* ✅ Scroll area inside modal */
.overlayGrid {
  padding: 6px 16px 12px;
  flex: 1 1 auto;
  overflow: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.panel {
  border-radius: 18px;
  padding: 14px;
  background: rgba(4, 8, 22, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.panelActive {
  border-color: rgba(56, 189, 248, 0.22);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.panelTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.panelLeft {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.panelIcon {
  width: 34px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.35), transparent 50%),
    linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(99, 102, 241, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.16);
  flex: 0 0 auto;
}

.panelIcon.alt {
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.35), transparent 50%),
    linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(56, 189, 248, 0.18));
}

.panelIcon i {
  font-size: 1.2rem;
  color: #fff;
}

.panelLabel {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
}

.panelMeta {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.62);
}

.panelMeta .muted {
  opacity: 0.85;
}

/* ✅ Search */
.panelTools {
  flex: 0 0 auto;
}

.searchWrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  min-width: min(320px, 44vw);
}

.searchIcon {
  font-size: 0.95rem;
  opacity: 0.85;
}

.searchInput {
  border: none;
  outline: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  width: 100%;
  font-size: 0.92rem;
}

.searchInput::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.searchClear {
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  transition: transform 160ms ease, background 160ms ease;
}

.searchClear:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.12);
}

/* ====== Member Cards ====== */
.memberGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.memberCard {
  position: relative;
  border-radius: 16px;
  padding: 12px;
  background:
    radial-gradient(700px 160px at 12% 0%, rgba(56, 189, 248, 0.14), transparent 70%),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.panelActive .memberCard {
  background:
    radial-gradient(700px 160px at 12% 0%, rgba(99, 102, 241, 0.18), transparent 70%),
    rgba(255, 255, 255, 0.04);
}

.memberCard:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.055);
}

.memberTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.logoWrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 22px rgba(56, 189, 248, 0.1);
  overflow: hidden;
  flex: 0 0 auto;
}

.logoImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.3));
}

.logoFallback {
  font-weight: 900;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.memberName {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.2;
}

/* ✅ Hover icons */
.memberActions {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 2px;
  opacity: 0;
  transform: translateY(6px) scale(0.98);
  pointer-events: none;
}

.actBtn {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.actBtn i {
  font-size: 0.95rem;
}

.actBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
}

.actFb {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.16));
}

.actWeb {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(94, 234, 212, 0.14));
}

.emptyState {
  grid-column: 1 / -1;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.92rem;
}

/* Footer fixed */
.overlayFooter {
  padding: 12px 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 14, 30, 0.35);
  backdrop-filter: blur(8px);
}

.footerPill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pillDot {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 1), rgba(99, 102, 241, 1));
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.22);
  overflow: hidden;
  display: grid;
  place-items: center;
}

.pillText {
  font-size: 13px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.74);
}

/* ====== Background details ====== */
.whyBg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.glow {
  position: absolute;
  width: 720px;
  height: 520px;
  filter: blur(70px);
  opacity: 0.42;
  border-radius: 999px;
}

.g1 {
  left: -220px;
  top: -240px;
  background: rgba(56, 189, 248, 0.35);
}

.g2 {
  right: -240px;
  bottom: -260px;
  background: rgba(99, 102, 241, 0.35);
}

.noise {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  mix-blend-mode: overlay;
}


@media (max-width: 984px) {
  .kicker::before,
  .card::before,
  .cardAccent::before,
  .ctaDot {
    content: none !important;
    display: none !important;
  }

  .card,
  .overlayBackdrop,
  .overlayPanel,
  .overlayFooter,
  .footerPill {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .whyBg,
  .whyBg .glow,
  .whyBg .noise {
    display: none !important;
  }

  .why {
    background: #071437 !important;
    box-shadow: none !important;
  }

  .card,
  .overlayPanel {
    box-shadow: none !important;
    background: rgba(8, 12, 28, 0.78) !important;
  }

  .card,
  .overlayPanel,
  .overlayBackdrop {
    transform: none !important;
    will-change: auto !important;
  }
}
/* ====== Responsive ====== */
@media (max-width: 960px) {
  .memberGrid {
    grid-template-columns: 1fr;
  }

  .searchWrap {
    min-width: min(320px, 58vw);
  }
}

@media (max-width: 860px) {
  .stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .overlayHead {
    flex-direction: column;
    align-items: flex-start;
  }

  .overlayClose {
    position: absolute;
    right: 12px;
    top: 12px;
  }

  .panelTop {
    flex-direction: column;
    align-items: stretch;
  }

  .searchWrap {
    width: 100%;
    min-width: 0;
  }
}

/* ✅ REMOVE ALL line/glow/blur effects when screen <= 984px */
@media (max-width: 984px) {
  .kicker::before,
  .card::before,
  .cardAccent::before,
  .ctaDot {
    content: none !important;
    display: none !important;
  }

  .card,
  .overlayBackdrop,
  .overlayPanel,
  .overlayFooter,
  .footerPill {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .whyBg,
  .whyBg .glow,
  .whyBg .noise {
    display: none !important;
  }

  .why {
    background: #071437 !important;
    box-shadow: none !important;
  }

  .card,
  .overlayPanel {
    box-shadow: none !important;
    background: rgba(8, 12, 28, 0.78) !important;
  }

  .card,
  .overlayPanel,
  .overlayBackdrop {
    transform: none !important;
    will-change: auto !important;
  }
}
</style>
