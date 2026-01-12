<template>
  <div
    class="dropdown-wrapper"
    :class="{ open: isOpen }"
    ref="dropdown"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
  >
    <!-- Trigger -->
    <button
      class="dropdown-trigger"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @focus="handleEnter"
      @blur="handleLeave"
    >
      <span class="label" id="mainmenudropdown">ສະມາຊິກ</span>
      <i class="chevron fa-solid fa-chevron-down" aria-hidden="true"></i>
    </button>

    <!-- Dropdown Panel -->
    <div class="dropdown-panel" ref="panel" role="menu" aria-labelledby="mainmenudropdown">
      <ul class="dropdown-list">
        <li v-for="item in items" :key="item.to" class="dropdown-row" role="none">
          <router-link class="dropdown-link" :to="item.to" role="menuitem">
            <span class="icon-wrap" aria-hidden="true">
              <i :class="item.icon"></i>
            </span>
            <span class="text">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { gsap } from 'gsap'

const dropdown = ref(null)
const panel = ref(null)
const isOpen = ref(false)
let hideTimeout = null

// ✅ ทำให้เหมือนตัวก่อน: data-driven + icon alignment
const items = [
  {
    label: 'ສະມາຊິກລະບົບບັດທະນາຄານຮ່ວມກັນ',
    to: '/member/membercardATM',
    icon: 'fa-solid fa-credit-card'
  },
  {
    label: 'ສະມາຊິກລະບົບຊຳລະຂ້າມທະນາຄານເທິງມືຖື',
    to: '/member/mobile_banking',
    icon: 'fa-solid fa-mobile-screen-button'
  },
  {
    label: 'ສະມາຊິກລະບົບຊຳລະຂ້າມແດນຜ່ານ QR Code',
    to: '/member/crossborder',
    icon: 'fa-solid fa-earth-asia'
  }
]

const openDropdown = () => {
  if (isOpen.value) return
  isOpen.value = true

  const panelEl = panel.value
  if (!panelEl) return

  const rows = panelEl.querySelectorAll('.dropdown-row')

  clearTimeout(hideTimeout)
  gsap.killTweensOf(panelEl)
  gsap.killTweensOf(rows)

  gsap.fromTo(
    panelEl,
    { opacity: 0, y: -6 },
    {
      opacity: 1,
      y: 0,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: 'auto',
      onStart: () => {
        panelEl.style.pointerEvents = 'auto'
      }
    }
  )

  gsap.fromTo(
    rows,
    { opacity: 0, y: 6 },
    {
      opacity: 1,
      y: 0,
      duration: 0.22,
      ease: 'power2.out',
      stagger: 0.04,
      overwrite: 'auto'
    }
  )
}

const closeDropdown = () => {
  if (!isOpen.value) return
  isOpen.value = false

  const panelEl = panel.value
  if (!panelEl) return

  const rows = panelEl.querySelectorAll('.dropdown-row')

  gsap.killTweensOf(panelEl)
  gsap.killTweensOf(rows)

  gsap.to(panelEl, {
    opacity: 0,
    y: -6,
    duration: 0.18,
    ease: 'power2.in',
    overwrite: 'auto',
    onComplete: () => {
      panelEl.style.pointerEvents = 'none'
    }
  })

  gsap.to(rows, {
    opacity: 0,
    y: 4,
    duration: 0.16,
    ease: 'power2.in',
    overwrite: 'auto'
  })
}

const handleEnter = () => {
  clearTimeout(hideTimeout)
  openDropdown()
}

const handleLeave = () => {
  hideTimeout = setTimeout(closeDropdown, 120)
}
</script>

<style scoped>
.dropdown-wrapper {
  position: relative;
  display: inline-block;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

/* Trigger */
.dropdown-trigger {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  color: #fff;
  border-radius: 999px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.dropdown-trigger:hover {
  transform: translateY(-1px);
}
.dropdown-trigger:focus-visible {
  outline: 2px solid rgba(148, 163, 184, 0.7);
  outline-offset: 6px;
  border-radius: 999px;
}

.dropdown-trigger .label {
  text-transform: uppercase;
  font-weight: 500;
  font-size: var(--fs-xs);
  font-family: "Noto Sans Lao", sans-serif;
}

.chevron {
  font-size: 14px;
  opacity: 0.9;
  transition: transform 0.25s ease;
}
.dropdown-wrapper.open .chevron {
  transform: rotate(180deg);
}

/* Panel */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;

  width: min(450px, 92vw);
  padding: 10px;
  border-radius: 18px;
  z-index: 999;

  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.7), 0 0 0 1px rgba(15, 23, 42, 0.7);

  opacity: 0;
  pointer-events: none;
  transform: translateY(-6px);
  will-change: transform, opacity;
}

/* List */
.dropdown-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-row {
  margin: 0;
}
.dropdown-row + .dropdown-row {
  position: relative;
}
.dropdown-row + .dropdown-row::before {
  content: "";
  display: block;
  height: 1px;
  margin: 6px 6px;
  background: linear-gradient(
    to right,
    rgba(148, 163, 184, 0),
    rgba(148, 163, 184, 0.7),
    rgba(148, 163, 184, 0)
  );
}

/* Link row */
.dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 10px;
  border-radius: 12px;

  text-decoration: none;
  color: #e5e7eb;
  font-family: "Noto Sans Lao", sans-serif;
  font-size: 1rem;

  transition: background 0.15s ease, transform 0.15s ease, color 0.15s ease;
}

.icon-wrap {
  width: 24px; /* ✅ ไอคอนตรงแนวเหมือนกันทุกบรรทัด */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  opacity: 0.95;
  flex: 0 0 24px;
}

.text {
  line-height: 1.25;
  word-break: break-word;
}

.dropdown-link:hover {
  background: rgba(55, 65, 81, 0.8);
  transform: translateY(-1px);
  color: #f9fafb;
}

/* Responsive */
@media (max-width: 1350px) {
  #mainmenudropdown {
    font-size: 1rem;
  }
}
</style>
