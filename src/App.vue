<template>
  <router-view></router-view>

  <!-- ✅ Visitor Eye (bottom-left) + overlay panel -->
  <!--
  <teleport to="body">
    <div class="viewerWrap" ref="viewerWrapRef">
      <div class="viewerCard" :class="{ open: viewerOpen }">
        <div class="viewerGlow" aria-hidden="true"></div>

        <button
          class="viewerHeader"
          :class="{ open: viewerOpen }"
          type="button"
          @click="toggleViewer"
          :aria-expanded="viewerOpen"
          aria-label="Open visitor panel"
        >
          <div class="eyeIcon" ref="eyeIconRef" aria-hidden="true">
            <i class="fa-solid fa-eye"></i>
          </div>

          <div v-if="viewerOpen" class="headerRight">
            <div class="headerTitle">Visitor</div>
          </div>

          <div v-if="viewerOpen" class="headerCaret" aria-hidden="true">⌃</div>
        </button>

        <div class="viewerPanel" ref="viewerPanelRef" :aria-hidden="!viewerOpen">
          <div class="viewerPanelInner">
            <div class="row">
              <span class="rowLabel">Views today</span>
              <span class="rowChip">{{ viewerToday }}</span>
            </div>

            <div class="row">
              <span class="rowLabel">Views this week</span>
              <span class="rowChip chipBlue">{{ viewerWeek }}</span>
            </div>

            <div class="actions">
              <button class="btn" type="button" @click="refreshViewer">↻ Refresh</button>
              <button class="btn ghost" type="button" @click="closeViewer">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
  -->
</template>

<style scoped>
/* =========================
   Bottom-left Visitor Eye
   Glassmorphism + Modern Blue
   ========================= */
.viewerWrap {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 9999;
  pointer-events: none;
}

.viewerCard {
  pointer-events: auto;
  width: 68px; /* closed: icon only */
  border-radius: 18px;
  overflow: hidden;

  background: linear-gradient(180deg, rgba(15, 23, 42, 0.32), rgba(2, 6, 23, 0.22));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.14);

  box-shadow:
    0 16px 50px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);
  position: relative;

  transition: width 260ms ease;
}

.viewerCard.open {
  width: min(360px, calc(100vw - 32px));
}

.viewerGlow {
  position: absolute;
  inset: -60px -80px auto -80px;
  height: 160px;
  background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.35), transparent 60%);
  filter: blur(10px);
  pointer-events: none;
}

/* Header behavior:
   - closed: center icon only
   - open: icon + title(right) + caret
*/
.viewerHeader {
  width: 100%;
  min-height: 64px;
  border: 0;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.92);

  background: linear-gradient(90deg, rgba(56, 189, 248, 0.15), rgba(14, 165, 233, 0.05));

  display: grid;
  place-items: center; /* closed state */
  padding: 10px 12px;
  text-align: left;
}

.viewerHeader:hover {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.20), rgba(14, 165, 233, 0.06));
}

.viewerHeader.open {
  place-items: stretch;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
}

.eyeIcon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 18px;

  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 0 0 6px rgba(56, 189, 248, 0.10);
}

.headerRight {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.headerTitle {
  font-weight: 950;
  letter-spacing: 0.4px;
  line-height: 1.1;
  color: rgba(255, 255, 255, 0.94);
}

.headerSub {
  font-size: 12px;
  opacity: 0.72;
  color: rgba(255, 255, 255, 0.9);
}

.headerCaret {
  opacity: 0.85;
  transform: translateY(1px) rotate(0deg);
}

/* Panel is animated by GSAP */
.viewerPanel {
  border-top: 1px solid rgba(56, 189, 248, 0.22);
}

.viewerPanelInner {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 2px;
}

.rowLabel {
  font-size: 12px;
  opacity: 0.78;
  color: rgba(255, 255, 255, 0.9);
}

.rowChip {
  font-size: 12px;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.92);
}

.chipBlue {
  border: 1px solid rgba(56, 189, 248, 0.28);
  background: rgba(56, 189, 248, 0.10);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn {
  flex: 1;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(56, 189, 248, 0.22);
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(14, 165, 233, 0.06));
  cursor: pointer;
  font-weight: 950;
  color: rgba(255, 255, 255, 0.92);
}
.btn:hover {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.24), rgba(14, 165, 233, 0.08));
}
.btn.ghost {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

@media (max-width: 768px) {
  .viewerWrap {
    display: none;
  }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { gsap } from "gsap";

/* Visitor counts (static only; API fetch removed) */
const viewerToday = ref(0);
const viewerWeek = ref(0);

const viewerOpen = ref(false);

const viewerWrapRef = ref(null);
const viewerPanelRef = ref(null);
const eyeIconRef = ref(null);

function toggleViewer() {
  viewerOpen.value = !viewerOpen.value;
}

function closeViewer() {
  viewerOpen.value = false;
}

/* Refresh action (API fetch removed) */
async function refreshViewer() {
  pulseViewer();
}

function pulseViewer() {
  const wrap = viewerWrapRef.value;
  if (!wrap) return;

  gsap.fromTo(
    wrap,
    { y: 0 },
    { y: -6, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }
  );

  if (eyeIconRef.value) {
    gsap.fromTo(
      eyeIconRef.value,
      { scale: 1 },
      { scale: 1.08, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }
    );
  }
}

function onKeydown(e) {
  if (e.key === "Escape") closeViewer();
}

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);

  await nextTick();

  // Entrance animation
  if (viewerWrapRef.value) {
    gsap.from(viewerWrapRef.value, {
      y: 18,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.1,
    });
  }

  // Panel initial state
  if (viewerPanelRef.value) {
    gsap.set(viewerPanelRef.value, {
      height: 0,
      autoAlpha: 0,
      y: 8,
      pointerEvents: "none",
      overflow: "hidden",
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

watch(viewerOpen, async (open) => {
  await nextTick();
  const panel = viewerPanelRef.value;
  if (!panel) return;

  gsap.killTweensOf(panel);

  if (open) {
    gsap.set(panel, { pointerEvents: "auto" });
    gsap.fromTo(
      panel,
      { height: 0, autoAlpha: 0, y: 10 },
      { height: "auto", autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" }
    );
    pulseViewer();
  } else {
    gsap.to(panel, {
      height: 0,
      autoAlpha: 0,
      y: 8,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => gsap.set(panel, { pointerEvents: "none" }),
    });
  }
});
</script>