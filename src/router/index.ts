import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import axios from "axios";

import product1 from "../Views/products/product1.vue";
import product2 from "../Views/products/product2.vue";
import product3 from "../Views/products/product3.vue";
import product4 from "../Views/products/product4.vue";

import membercardATM from "../Views/member/membercard/membercardATM.vue";
import membermobile_banking from "../Views/member/membercard/membermobile_banking.vue";
import membercrossborder from "../Views/member/membercard/membercrossborder.vue";
import Joinus from "../Views/joinus/joinus.vue";

import Board_director from "../Views/Aboutus/board_director/board_director.vue";
import Role from "../Views/Aboutus/role/role.vue";
import Vision from "../Views/Aboutus/vision/vision.vue";
import History from "../Views/Aboutus/history/history.vue";
import Contactus from "../Views/contact/contactus.vue";
import Operationstructure from "../Views/Aboutus/companystructure/operationstructure.vue";
import It from "../Views/Aboutus/companystructure/it.vue";
import Ceo from "../Views/Aboutus/companystructure/ceo.vue";

import Finance from "../Views/Aboutus/companystructure/finance.vue";
import Office from "../Views/Aboutus/companystructure/office.vue";
import Audit from "../Views/Aboutus/companystructure/audit.vue";

import Bloggridview from "../Views/blog/bloggrid/bloggridview.vue";
import Blogdetail from "../Views/blog/blogdetail/blogdetail.vue";

import Product6 from "../Views/products/product6.vue";
import Boarddirector_audit from "../Views/Aboutus/board_director/boarddirector_audit.vue";
import Boarddirector_policy from "../Views/Aboutus/board_director/boarddirector_policy.vue";
import Boarddirector_develop from "../Views/Aboutus/board_director/boarddirector_develop.vue";
import Boarddirector_risk from "../Views/Aboutus/board_director/boarddirector_risk.vue";
import Productqrpayment from "../Views/products/productqrpayment.vue";
import Companystructureimage from "../Views/Aboutus/companystructure/companystructureimage.vue";
import Companystructure from "../Views/Aboutus/companystructure/companystructure.vue";

import allproduct from "../Views/products/allproduct.vue";
import atmmockup from "../components/mockup/atmmockup.vue";
import testhome from "../Views/Homepage/testhome.vue";
import allbox from "../Views/Aboutus/companystructure/allbox.vue";
import testinfocomponent from "../Views/products/procomponent/testinfocomponent.vue";

/** =========================
 *  Path Masking (Base64 URL-safe)
 *  ========================= */
function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const binary = atob(b64 + pad);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return new TextDecoder().decode(bytes);
}

const TOKEN_PREFIX = "/r/";

/** =========================
 *  ✅ Visitors Tracking helpers
 *  ========================= */
function getVisitorSessionId() {
  const key = "visitor_session_id";
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    localStorage.setItem(key, sid);
  }
  return sid;
}

async function trackVisitor(page_url: string, token?: string) {
  try {
    if (token) {
      const dedupeKey = `visitor_tracked_${token}`;
      if (sessionStorage.getItem(dedupeKey)) return;
      sessionStorage.setItem(dedupeKey, "1");
    }

    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const session_id = getVisitorSessionId();

    await axios.post(`${base}/api/visitors/track`, { page_url, session_id }, { timeout: 5000 });
  } catch (e: any) {
    console.debug("visitor track failed:", e?.message || e);
  }
}


const routes: RouteRecordRaw[] = [
  {
    path: "/t",
    name: "t",
    component: testinfocomponent,
  },
  {
    path: "/",
    name: "home",
    component: testhome,
  },

  {
    path: "/mockup",
    name: "atmmockup",
    component: atmmockup,
  },

  {
    path: "/products_service/allproduct",
    name: "allproduct",
    component: allproduct,
  },
  {
    path: "/products_service/atm-inquiry",
    name: "atm-inquiry",
    component: product1,
  },
  {
    path: "/products_service/atm-cash-withdraw",
    name: "atm-cash-withdraw",
    component: product2,
  },
  {
    path: "/products_service/atm-transfer",
    name: "atm-transfer",
    component: product3,
  },
  {
    path: "/products_service/mobile-transfer",
    name: "mobile-transfer",
    component: product4,
  },

  {
    path: "/products_service/qr-payment",
    name: "qrpayment",
    component: Productqrpayment,
  },

  // Crossborder overview
  {
    path: "/products_service/crossborder",
    name: "crossborder-overview",
    component: Product6,
  },

  // Crossborder detail by pair
  {
    path: "/products_service/crossborder/:pair(kh-la|la-kh|th-la|la-th|vn-la|la-vn|ch-la|la-ch)",
    name: "crossborder-product",
    component: Product6,
  },

  // ############################### member path #####################################
  {
    path: "/member/membercardATM",
    name: "membercardATM",
    component: membercardATM,
  },
  {
    path: "/member/mobile_banking",
    name: "mobile_banking",
    component: membermobile_banking,
  },
  {
    path: "/member/crossborder",
    name: "crossborder",
    component: membercrossborder,
  },

  // ######################### Joinus ##########################
  {
    path: "/joinus",
    name: "joinus",
    component: Joinus,
  },

  // ######################### Blog and news ##########################
  {
    path: "/bloggrid",
    name: "BlogGrid",
    component: Bloggridview,
  },
  {
    path: "/blogdetail/:id",
    name: "BlogDetail",
    component: Blogdetail,
    props: true,
  },

  // ######################### About us  ##########################
  {
    path: "/aboutus/companystructure",
    name: "companystructure",
    component: Companystructure,
  },

  {
    path: "/aboutus/companystructureimage",
    name: "companystructureimage",
    component: Companystructureimage,
  },

  {
    path: "/company/lapnet",
    name: "lapnet",
    component: allbox,
  },
  {
    path: "/company/operation",
    name: "operation",
    component: Operationstructure,
  },
  {
    path: "/company/it",
    name: "it",
    component: It,
  },
  {
    path: "/company/ceo-cfo",
    name: "ceo",
    component: Ceo,
  },
  {
    path: "/company/finance",
    name: "finance",
    component: Finance,
  },
  {
    path: "/company/office",
    name: "office",
    component: Office,
  },
  {
    path: "/company/audit",
    name: "audit",
    component: Audit,
  },

  // ########################### Board director ###########################
  {
    path: "/aboutus/board_director",
    name: "board_director",
    component: Board_director,
  },
  {
    path: "/board_of_director/audit_committee",
    name: "board_directoraudit",
    component: Boarddirector_audit,
  },
  {
    path: "/board_of_director/policy_research_committee",
    name: "board_directorpolicy",
    component: Boarddirector_policy,
  },
  {
    path: "/board_of_director/develop_committee",
    name: "board_directordevelop",
    component: Boarddirector_develop,
  },
  {
    path: "/board_of_director/riskmanagemen_committee",
    name: "board_directorrisk",
    component: Boarddirector_risk,
  },

  {
    path: "/aboutus/role",
    name: "role",
    component: Role,
  },
  {
    path: "/aboutus/vision",
    name: "vision",
    component: Vision,
  },
  {
    path: "/aboutus/history",
    name: "history",
    component: History,
  },

  // ######################### Contact us  ##########################
  {
    path: "/contactus",
    name: "contactus",
    component: Contactus,
  },



  /** ✅ Masked route: /r/<token> (ต้องอยู่ก่อน catch-all) */
  {
    path: "/r/:token(.*)",
    name: "masked",
    component: testhome, // ใช้ตัวไหนก็ได้ เพราะจะ redirect ใน beforeEach
    meta: { noMask: true }, // กัน afterEach มาทับซ้ำ
  },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  // Hash mode: ไม่ต้องตั้ง server rewrite
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

/** ✅ เปิดลิงก์แบบ #/r/<token> -> decode -> ไป path จริง + ✅ ยิง visitors API */
router.beforeEach(async (to) => {
  if (to.path.startsWith(TOKEN_PREFIX) && typeof to.params.token === "string") {
    const token = to.params.token;

    // ✅ ยิง visitors ตอนเข้าลิงก์ /r/<token>
    await trackVisitor(window.location.href, token);

    try {
      const realFullPath = base64UrlDecode(token);
      return { path: realFullPath, replace: true };
    } catch {
      return { path: "/", replace: true };
    }
  }
});


/** ✅ เข้า route จริงแล้ว -> เปลี่ยน address bar เป็น #/r/<token> (ไม่ trigger navigation) */
router.afterEach((to) => {
  if ((to.meta as any)?.noMask) return;

  // กัน loop: ถ้า address bar เป็น #/r/... อยู่แล้วก็ไม่ต้อง replace ซ้ำ
  if (window.location.hash.startsWith(`#${TOKEN_PREFIX}`)) return;

  const token = base64UrlEncode(to.fullPath);
  const maskedHash = `#${TOKEN_PREFIX}${token}`;

  // ทำให้ URL เปลี่ยน แต่ไม่ทำให้ router วิ่งใหม่
  const newUrl = `${window.location.pathname}${window.location.search}${maskedHash}`;
  window.history.replaceState(window.history.state, "", newUrl);
});

// router/index.ts
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function trackPageView(fullPath: string) {
  window.gtag?.("event", "page_view", {
    page_path: fullPath,
    // คุณใช้ hash router → ทำ URL ให้เป็นแบบจริงในรายงาน (ไม่ใช่ /r/token)
    page_location: `${window.location.origin}/#${fullPath}`,
    page_title: document.title,
  });
}

// ยิงทุกครั้งที่เปลี่ยนหน้า
router.afterEach((to) => {
  trackPageView(to.fullPath);
});

// กันบางที initial load ไม่ยิง (เผื่อไว้)
router.isReady().then(() => {
  trackPageView(router.currentRoute.value.fullPath);
});

router.isReady().then(() => {
  // ถ้าเปิดมาด้วย #/r/<token> ให้ยิงอีกชั้น (กันหลุด)
  const h = window.location.hash || "";
  if (h.startsWith(`#${TOKEN_PREFIX}`)) {
    const token = h.slice(`#${TOKEN_PREFIX}`.length);
    trackVisitor(window.location.href, token);
  }
});


export default router;
