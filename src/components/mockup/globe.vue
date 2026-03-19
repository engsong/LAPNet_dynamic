<template>
  <div ref="wrap" class="globeWrap">
    <canvas ref="canvas" class="globeCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as THREE from "three";
import gsap from "gsap";

type Endpoint = {
  idmember?: number; // ✅ keep idmember for sorting / debugging
  name?: string;
  logo: string;
  lat?: number;
  lon?: number;
};

type ProductPair = {
  id: string;
  label?: string;
  from: Endpoint;
  to: Endpoint;
  color?: string;
};

// -------------------- Env-only API base (Vite) --------------------
// Required in .env (Vite):
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
  // - If base ends with "/api" and path starts with "/api/..." => drop one
  if (b.endsWith("/api") && /^\/api(\/|$)/i.test(p)) {
    return b + p.replace(/^\/api/i, "");
  }

  // Normal join
  if (!p) return b;
  if (p.startsWith("/")) return b + p;
  return b + "/" + p;
}

const API_BASE = resolveEnvBaseUrl();

// Asset base for images/files (strip trailing "/api" if env includes it)
const ASSET_BASE = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

// ✅ API endpoint: /api/members (from env base only)
const MEMBERS_API_URL = joinBaseAndPath(API_BASE, "/api/members");


// ✅ fallback nodes (match 22)
const DEFAULT_NODES: Endpoint[] = Array.from({ length: 22 }).map((_, i) => ({
  idmember: i + 1,
  name: `Logo ${i + 1}`,
  logo: `/logos/logo-${String(i + 1).padStart(2, "0")}.png`,
}));

const props = withDefaults(
  defineProps<{
    pairs?: ProductPair[];
    nodes?: Endpoint[];

    hubLogo?: string;
    hubName?: string;
    hubLat?: number;
    hubLon?: number;

    autoDistribute?: boolean;
    minSeparationDeg?: number;
    minNodeToHubDeg?: number;

    focusLat?: number;
    focusLon?: number;

    landMaskUrl?: string;

    dotPulseSpeed?: number;

    inboundSeconds?: number;
    outboundSeconds?: number;
    inboundBatchMin?: number;
    inboundBatchMax?: number;
    inboundStaggerSeconds?: number;
    outboundDelaySeconds?: number;
    outboundStaggerSeconds?: number;
    batchPauseSeconds?: number;

    flowTrailCount?: number;
    flowTrailSpacing?: number;
    activeLineOpacity?: number;
    baseLineOpacity?: number;

    nodePinScale?: number;
    hubPinScale?: number;

    showStars?: boolean;

    startWithHubFront?: boolean;
    startLat?: number;
    startLon?: number;

    hubFrontLift?: number;
    hubRenderOrder?: number;

    /** ✅ how many member logos to show (set 22 by default) */
    memberLimit?: number;
  }>(),
  {
    pairs: () => [],
    nodes: undefined,

    hubLogo: "/logos/lapnet.png",
    hubName: "Lapnet",
    hubLat: 18.0,
    hubLon: 103.0,

    autoDistribute: true,
    minSeparationDeg: 26,
    minNodeToHubDeg: 40,

    focusLat: 18.0,
    focusLon: 103.0,



    dotPulseSpeed: 0.6,

    inboundSeconds: 3.8,
    outboundSeconds: 3.2,
    inboundBatchMin: 3,
    inboundBatchMax: 4,
    inboundStaggerSeconds: 0.18,
    outboundDelaySeconds: 0.1,
    outboundStaggerSeconds: 0.1,
    batchPauseSeconds: 0.35,

    flowTrailCount: 7,
    flowTrailSpacing: 0.06,
    activeLineOpacity: 0.9,
    baseLineOpacity: 0.28,

    nodePinScale: 0.14,
    hubPinScale: 0.40,

    showStars: false,

    startWithHubFront: true,
    startLat: undefined,
    startLon: undefined,

    hubFrontLift: 0.14,
    hubRenderOrder: 50,

    // ✅ you want all 22 logos
    memberLimit: 22,
  }
);

const canvas = ref<HTMLCanvasElement | null>(null);
const wrap = ref<HTMLDivElement | null>(null);

/** ✅ LOW POWER / MOBILE MODE */
const isClient = typeof window !== "undefined";
const reduceMotion =
  isClient && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const isMobile =
  isClient &&
  (window.matchMedia?.("(max-width: 980px)")?.matches ||
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
const lowPower = !!(reduceMotion || isMobile);

/** ✅ Keep GSAP tweens to kill on unmount */
let gsapTweens: gsap.core.Tween[] = [];

const hub = computed(() => ({
  name: props.hubName,
  logo: props.hubLogo!,
  lat: props.hubLat!,
  lon: props.hubLon!,
}));

/** ✅ nodes from members API */
const membersNodes = ref<Endpoint[] | null>(null);

const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const pickMemberId = (item: any) => {
  return (
    toNumber(item?.idmember) ??
    toNumber(item?.idMember) ??
    toNumber(item?.memberid) ??
    toNumber(item?.memberId) ??
    toNumber(item?.id) ??
    toNumber(item?._id) ??
    null
  );
};

// ✅ better name mapping for your API (members table)
const pickMemberName = (item: any, id: number | null) => {
  const s = String(
    item?.BanknameLA ??
      item?.BanknameEN ??
      item?.bank_name ??
      item?.name ??
      item?.title ??
      item?.label ??
      ""
  ).trim();
  if (s) return s;
  return id != null ? `Member ${id}` : "Member";
};

const extractImageString = (img: any): string => {
  if (!img) return "";
  if (typeof img === "string") return img;

  // array -> take first
  if (Array.isArray(img)) {
    for (const it of img) {
      const s = extractImageString(it);
      if (s) return s;
    }
    return "";
  }

  // object -> try common keys
  const candidates = [
    img?.url,
    img?.path,
    img?.src,
    img?.image,
    img?.file,
    img?.filePath,
    img?.filename,
    img?.name,
    img?.download_url,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
  }

  if (img?.data) return extractImageString(img.data);

  return "";
};

// -------------------- Image URL normalization helpers --------------------
function isLoopbackHost(hostname: string) {
  const h = String(hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0";
}

function isLikelyAssetPath(pathname: string) {
  const p = String(pathname || "");
  // Expand patterns a bit (uploads/images/files/static)
  return (
    /^\/(uploads|upload|images|files|static)\b/i.test(p) ||
    p.includes("/uploads/") ||
    p.includes("/images/") ||
    p.includes("/files/")
  );
}

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

    // Keep path + query (important)
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

const resolveImage = (img: any) => {
  const s = extractImageString(img).trim();
  if (!s) return "";

  // Data URL
  if (/^data:image\//i.test(s)) return s;

  // Absolute URL
  if (/^https?:\/\//i.test(s)) {
    // Fix "localhost" or wrong-host absolute URLs returned by backend
    return rewriteBadAbsoluteToEnvBase(s);
  }

  // Absolute path from server (e.g. "/uploads/..") => use ASSET_BASE
  if (s.startsWith("/")) return joinBaseAndPath(ASSET_BASE, s);

  // Relative path (e.g. "uploads/..") => use ASSET_BASE
  return joinBaseAndPath(ASSET_BASE, "/" + s);
};

const fallbackLogoById = (id: number) => {
  return `/logos/logo-${String(id).padStart(2, "0")}.png`;
};

// ✅ IMPORTANT: prefer "image" (relative) over "image_url" (can be wrong like localhost)
const pickMemberImage = (item: any) => {
  return (
    item?.image ?? // ✅ correct server-relative path from your JSON sample
    item?.image_url ?? // may be wrong (localhost), but resolveImage() rewrites it if needed
    item?.Image_url ??
    item?.imageUrl ??
    item?.logo ??
    item?.logo_img ??
    item?.member_logo ??
    item?.img ??
    item?.photo ??
    ""
  );
};

const normalizeMemberToNode = (item: any) => {
  const id = pickMemberId(item);
  if (id == null) return null;

  const name = pickMemberName(item, id);

  const logoResolved = resolveImage(pickMemberImage(item));
  const logo = logoResolved || fallbackLogoById(id);

  return {
    idmember: id,
    name,
    logo,
  } satisfies Endpoint;
};

async function fetchJson(url: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const ct = String(res.headers.get("content-type") || "").toLowerCase();

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error (${res.status}) ${res.url}\n${text.slice(0, 200)}`);
  }

  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    const head = text.slice(0, 140).replace(/\s+/g, " ");
    throw new Error(
      `Non-JSON response (${res.status}) from ${res.url}\ncontent-type=${ct || "unknown"}\nhead=${head}`
    );
  }

  return res.json();
}

async function loadMembersNodes() {
  try {
    if (!API_BASE) {
      throw new Error(
        "[Globe] Missing VITE_API_BASE_URL. Put it in project root .env and restart Vite."
      );
    }

    console.log("[Globe] API_BASE =", API_BASE);
    console.log("[Globe] MEMBERS_API_URL =", MEMBERS_API_URL);

    const json: any = await fetchJson(MEMBERS_API_URL);

    const list =
      Array.isArray(json) ? json :
      Array.isArray(json?.data) ? json.data :
      Array.isArray(json?.members) ? json.members :
      Array.isArray(json?.result) ? json.result :
      [];

    const mapped = (list as any[])
      .map(normalizeMemberToNode)
      .filter(Boolean) as Endpoint[];

    mapped.sort((a, b) => (a.idmember ?? 0) - (b.idmember ?? 0));

    const limitRaw = props.memberLimit ?? 22;
    const limit = limitRaw <= 0 ? mapped.length : limitRaw;
    membersNodes.value = mapped.slice(0, Math.max(1, limit));
  } catch (e) {
    console.error("Load members nodes failed:", e);
    membersNodes.value = null;
  }
}

const nodes = computed<Endpoint[]>(() => {
  // ✅ if you pass nodes manually, use those
  if (props.nodes && props.nodes.length > 0) return props.nodes;

  // ✅ if pairs are provided, derive nodes from pairs
  const ps = props.pairs ?? [];
  if (ps.length > 0) {
    const map = new Map<string, Endpoint>();
    for (const p of ps) {
      if (p.from?.logo) map.set(p.from.logo, p.from);
      if (p.to?.logo) map.set(p.to.logo, p.to);
    }
    if (hub.value.logo) map.delete(hub.value.logo);
    return Array.from(map.values()).slice(0, 50);
  }

  // ✅ default: from API members (ALL 22)
  if (membersNodes.value && membersNodes.value.length > 0) return membersNodes.value;

  // ✅ fallback
  return DEFAULT_NODES;
});

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

let raf = 0;
let ro: ResizeObserver | null = null;
const disposers: Array<() => void> = [];

const CFG = {
  radius: 1.22,
  dots: lowPower ? 1600 : 4200,
  dotColor: "#C4B5FD",
  arcColor: "#A78BFA",
};

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function easeInOutCubic(x: number) {
  const t = clamp(x, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function angleBetween(a: THREE.Vector3, b: THREE.Vector3) {
  const d = clamp(a.clone().normalize().dot(b.clone().normalize()), -1, 1);
  return Math.acos(d);
}

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function vec3ToUV(p: THREE.Vector3) {
  const n = p.clone().normalize();
  const u = 0.5 + Math.atan2(n.z, n.x) / (2 * Math.PI);
  const v = 0.5 - Math.asin(n.y) / Math.PI;
  return { u, v };
}

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const x = Math.cos(theta) * rr;
    const z = Math.sin(theta) * rr;
    pts.push(new THREE.Vector3(x, y, z).multiplyScalar(r));
  }
  return pts;
}

async function loadLandMaskSampler(url: string) {
  try {
    const img = new Image();
    img.src = url;

    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("mask load failed"));
    });

    const MAX = 1024;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));

    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));

    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no ctx");

    ctx.drawImage(img, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;

    return (u: number, v: number) => {
      const x = Math.min(c.width - 1, Math.max(0, Math.floor(u * c.width)));
      const y = Math.min(c.height - 1, Math.max(0, Math.floor(v * c.height)));
      const idx = (y * c.width + x) * 4;
      const rr = data[idx] ?? 0;
      const gg = data[idx + 1] ?? 0;
      const bb = data[idx + 2] ?? 0;
      return (rr + gg + bb) / 3 > 60;
    };
  } catch {
    return null;
  }
}

function pickSpreadPoints(count: number, candidates: THREE.Vector3[], minAngleRad: number) {
  if (candidates.length === 0) return [];

  let pool = candidates;
  if (lowPower && pool.length > 800) {
    const tmp: THREE.Vector3[] = [];
    for (let i = 0; i < 800; i++) tmp.push(pool[(Math.random() * pool.length) | 0]!);
    pool = tmp;
  }

  let best: THREE.Vector3[] = [];
  let bestMin = -1;

  const tries = lowPower ? 4 : 10;
  for (let t = 0; t < tries; t++) {
    const chosen: THREE.Vector3[] = [];
    chosen.push(pool[Math.floor(Math.random() * pool.length)]!);

    while (chosen.length < count) {
      let bestCand: THREE.Vector3 | null = null;
      let bestScore = -1;

      for (const c of pool) {
        let minD = Infinity;
        for (const s of chosen) minD = Math.min(minD, angleBetween(c, s));
        if (minD > bestScore) {
          bestScore = minD;
          bestCand = c;
        }
      }
      if (!bestCand) break;
      chosen.push(bestCand);
    }

    let minPair = Infinity;
    for (let i = 0; i < chosen.length; i++) {
      for (let j = i + 1; j < chosen.length; j++) {
        minPair = Math.min(minPair, angleBetween(chosen[i]!, chosen[j]!));
      }
    }

    if (minPair > bestMin) {
      bestMin = minPair;
      best = chosen;
    }
    if (bestMin >= minAngleRad) break;
  }

  return best.slice(0, count);
}

function makeCircleTexture(size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("no ctx");

  ctx.clearRect(0, 0, size, size);
  const r = size * 0.34;
  const cx = size / 2;
  const cy = size / 2;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fill();

  ctx.globalCompositeOperation = "destination-in";
  const g = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function makeDotGlobe(points: THREE.Vector3[]) {
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(points.length * 3);
  const seed = new Float32Array(points.length);
  const scale = new Float32Array(points.length);

  for (let i = 0; i < points.length; i++) {
    pos[i * 3 + 0] = points[i]!.x;
    pos[i * 3 + 1] = points[i]!.y;
    pos[i * 3 + 2] = points[i]!.z;
    seed[i] = Math.random();
    scale[i] = 0.65 + Math.random() * 1.4;
  }

  geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geom.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geom.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uPulseSpeed: { value: props.dotPulseSpeed },
      uColor: { value: new THREE.Color(CFG.dotColor) },
      uSize: { value: lowPower ? 12.0 : 18.0 },
    },
    vertexShader: `
      precision mediump float;
      uniform float uTime;
      uniform float uPulseSpeed;
      uniform float uSize;

      attribute float aSeed;
      attribute float aScale;

      varying float vAlpha;

      void main() {
        vec3 p = position;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);

        vec3 n = normalize((modelMatrix * vec4(p, 0.0)).xyz);
        vec3 v = normalize(cameraPosition - (modelMatrix * vec4(p, 1.0)).xyz);
        float fwd = dot(n, v);
        float frontFade = smoothstep(-0.15, 0.55, fwd);

        float basePulse = 0.72 + 0.28 * sin(uTime * uPulseSpeed + aSeed * 6.2831);

        float twFreq = 0.65 + 2.75 * fract(aSeed * 17.0);
        float tw = 0.5 + 0.5 * sin(uTime * twFreq + aSeed * 19.7);
        float spark = smoothstep(0.92, 1.0, tw);

        float twinkleGain = (0.78 + 0.22 * tw) + (0.45 * spark);
        vAlpha = basePulse * twinkleGain * frontFade;

        float sizeBoost = 0.92 + 0.10 * tw + 0.12 * spark;
        float size = uSize * aScale * sizeBoost * (1.0 / max(0.001, -mv.z));

        gl_PointSize = clamp(size, 1.0, 64.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform vec3 uColor;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float circle = smoothstep(0.5, 0.18, d);
        float core = smoothstep(0.18, 0.0, d);
        float a = circle * vAlpha * (0.90 + 0.10 * core);
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });

  const pts = new THREE.Points(geom, mat);

  disposers.push(() => {
    geom.dispose();
    mat.dispose();
  });

  return { pts, mat };
}

function makeStarfield(count = 1200, radius = 18) {
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const rr = radius * (0.7 + Math.random() * 0.3);

    p[i * 3 + 0] = rr * Math.sin(phi) * Math.cos(theta);
    p[i * 3 + 1] = rr * Math.cos(phi);
    p[i * 3 + 2] = rr * Math.sin(phi) * Math.sin(theta);
  }

  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({
    size: 0.02,
    opacity: 0.6,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const s = new THREE.Points(g, m);
  disposers.push(() => {
    g.dispose();
    m.dispose();
  });
  return s;
}

function makeLogoPin(
  worldPos: THREE.Vector3,
  normal: THREE.Vector3,
  logoTex: THREE.Texture | undefined,
  size = 0.2,
  lift = 0.07,
  renderOrder = 0
) {
  const group = new THREE.Group();

  if (logoTex) {
    const mat = new THREE.SpriteMaterial({
      map: logoTex,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      alphaTest: 0.35,
      blending: THREE.NormalBlending,
    });

    const spr = new THREE.Sprite(mat);
    spr.scale.set(size, size, 1);
    spr.position.copy(normal.clone().multiplyScalar(lift));
    spr.renderOrder = renderOrder;

    group.add(spr);
    disposers.push(() => mat.dispose());
  }

  group.position.copy(worldPos.clone().add(normal.clone().multiplyScalar(0.02)));
  group.renderOrder = renderOrder;
  return group;
}

function makeHubMarker(
  worldPos: THREE.Vector3,
  normal: THREE.Vector3,
  circleTex: THREE.Texture,
  renderOrder = 0
) {
  const mat = new THREE.SpriteMaterial({
    map: circleTex,
    color: new THREE.Color("#ffffff"),
    transparent: true,
    opacity: 0.95,
    blending: THREE.NormalBlending,
    depthWrite: false,
    alphaTest: 0.15,
  });

  const spr = new THREE.Sprite(mat);
  spr.scale.set(0.10, 0.10, 1);
  spr.position.copy(normal.clone().multiplyScalar(0.10));
  spr.renderOrder = renderOrder;

  const group = new THREE.Group();
  group.add(spr);
  group.position.copy(worldPos.clone().add(normal.clone().multiplyScalar(0.02)));
  group.renderOrder = renderOrder;

  disposers.push(() => mat.dispose());
  return group;
}

function makeHubRoute(
  hubPos: THREE.Vector3,
  nodePos: THREE.Vector3,
  circleTex: THREE.Texture,
  color: string
) {
  const a = hubPos.clone().normalize();
  const b = nodePos.clone().normalize();
  const axis = new THREE.Vector3().crossVectors(a, b).normalize();
  const angle = Math.acos(clamp(a.dot(b), -1, 1));

  const pts: THREE.Vector3[] = [];
  const steps = lowPower ? 80 : 140;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const v = a.clone().applyAxisAngle(axis, angle * t).multiplyScalar(CFG.radius);
    const lift = Math.sin(Math.PI * t) * 0.3;
    v.add(v.clone().normalize().multiplyScalar(lift));
    pts.push(v);
  }

  const curve = new THREE.CatmullRomCurve3(pts);
  const ptsFwd = curve.getPoints(lowPower ? 140 : 260);
  const ptsRev = [...ptsFwd].reverse();

  const baseGeom = new THREE.BufferGeometry().setFromPoints(ptsFwd);
  const baseMat = new THREE.LineDashedMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: props.baseLineOpacity!,
    dashSize: 0.10,
    gapSize: 0.06,
  });
  const baseLine = new THREE.Line(baseGeom, baseMat);
  baseLine.computeLineDistances();

  const outGeom = new THREE.BufferGeometry().setFromPoints(ptsFwd);
  outGeom.setDrawRange(0, 2);
  const outMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const outLine = new THREE.Line(outGeom, outMat);

  const inGeom = new THREE.BufferGeometry().setFromPoints(ptsRev);
  inGeom.setDrawRange(0, 2);
  const inMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const inLine = new THREE.Line(inGeom, inMat);

  const trailCount = Math.max(
    2,
    lowPower ? Math.min(3, props.flowTrailCount ?? 7) : (props.flowTrailCount ?? 7)
  );
  const spacing = clamp(props.flowTrailSpacing ?? 0.06, 0.01, lowPower ? 0.12 : 0.2);

  type TrailDot = { spr: THREE.Sprite; mat: THREE.SpriteMaterial; offset: number; base: number };
  const makeTrail = () => {
    const dots: TrailDot[] = [];
    for (let i = 0; i < trailCount; i++) {
      const isHead = i === 0;
      const mat = new THREE.SpriteMaterial({
        map: circleTex,
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0,
        blending: THREE.NormalBlending,
        depthWrite: false,
        alphaTest: 0.15,
      });

      const spr = new THREE.Sprite(mat);
      const base = isHead ? 0.10 : 0.075;
      spr.scale.set(base, base, 1);
      dots.push({ spr, mat, offset: i * spacing, base });
    }
    const group = new THREE.Group();
    dots.forEach((d) => group.add(d.spr));
    return { dots, group };
  };

  const outTrail = makeTrail();
  const inTrail = makeTrail();

  const updateTrail = (dots: TrailDot[], curvePts: THREE.Vector3[], u: number, fade: number) => {
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i]!;
      const uu = u - d.offset;
      if (uu <= 0) {
        d.mat.opacity = 0;
        continue;
      }

      const idx = Math.floor(clamp(uu, 0, 1) * (curvePts.length - 1));
      d.spr.position.copy(curvePts[idx]!);

      const decay = 1 - i / dots.length;
      d.mat.opacity = (i === 0 ? 0.95 : 0.55 * decay) * fade;

      const s =
        i === 0 ? d.base * (1 + 0.08 * Math.sin(u * 12.0)) : d.base * (0.95 + 0.12 * decay);
      d.spr.scale.set(s, s, 1);
    }
  };

  const update = (t: number, phaseIn: boolean, u: number) => {
    (baseMat as any).dashOffset = -t * 0.25;

    const fade = smoothstep(0.02, 0.10, u) * (1.0 - smoothstep(0.92, 0.995, u));

    const totalFwd = ptsFwd.length;
    const totalRev = ptsRev.length;

    if (phaseIn) {
      outMat.opacity = 0;
      inMat.opacity = props.activeLineOpacity! * fade;

      const k = Math.max(2, Math.floor(u * (totalRev - 1)));
      inGeom.setDrawRange(0, k);
      outGeom.setDrawRange(0, 2);

      updateTrail(inTrail.dots, ptsRev, u, fade);
      updateTrail(outTrail.dots, ptsFwd, 0, 0);
    } else {
      inMat.opacity = 0;
      outMat.opacity = props.activeLineOpacity! * fade;

      const k = Math.max(2, Math.floor(u * (totalFwd - 1)));
      outGeom.setDrawRange(0, k);
      inGeom.setDrawRange(0, 2);

      updateTrail(outTrail.dots, ptsFwd, u, fade);
      updateTrail(inTrail.dots, ptsRev, 0, 0);
    }
  };

  disposers.push(() => {
    baseGeom.dispose();
    baseMat.dispose();
    outGeom.dispose();
    outMat.dispose();
    inGeom.dispose();
    inMat.dispose();
    outTrail.dots.forEach((d) => d.mat.dispose());
    inTrail.dots.forEach((d) => d.mat.dispose());
  });

  return { baseLine, outLine, inLine, outDots: outTrail.group, inDots: inTrail.group, update };
}

// scheduler types
type RouteMode = "in" | "out";
type RouteState = { mode: RouteMode | null; start: number; dur: number };
type RouteEvent = { route: number; mode: RouteMode; start: number; dur: number };

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

onMounted(async () => {
  if (!canvas.value || !wrap.value) return;

  // ✅ load ALL member logos before build globe
  await loadMembersNodes();

  const reduce = reduceMotion ?? false;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: !lowPower,
      alpha: true,
      powerPreference: lowPower ? "low-power" : "high-performance",
      precision: lowPower ? "mediump" : "highp",
    });
  } catch {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
  camera.position.set(0, 0, 3.7);

  scene.add(new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.35));
  const key = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 1.0);
  key.position.set(3, 2, 3);
  scene.add(key);

  if (props.showStars && !lowPower) scene.add(makeStarfield());

  const globe = new THREE.Group();
  scene.add(globe);

  const startLat = props.startLat ?? (props.startWithHubFront ? props.hubLat! : props.focusLat!);
  const startLon = props.startLon ?? (props.startWithHubFront ? props.hubLon! : props.focusLon!);

  const startV = latLonToVec3(startLat, startLon, 1).normalize();
  const qStart = new THREE.Quaternion().setFromUnitVectors(startV, new THREE.Vector3(0, 0, 1));
  globe.quaternion.copy(qStart);

  const sampleLand = props.landMaskUrl ? await loadLandMaskSampler(props.landMaskUrl) : null;

  const candidates = fibonacciSphere(CFG.dots * (sampleLand ? 2 : 1), CFG.radius);
  const dotPoints: THREE.Vector3[] = [];

  for (const p of candidates) {
    if (!sampleLand) {
      dotPoints.push(p);
      if (dotPoints.length >= CFG.dots) break;
      continue;
    }
    const { u, v } = vec3ToUV(p);
    if (sampleLand(u, v)) dotPoints.push(p);
    if (dotPoints.length >= CFG.dots) break;
  }

  const { pts: dotField, mat: dotMat } = makeDotGlobe(dotPoints);
  globe.add(dotField);

  const circleTex = makeCircleTexture(64);
  disposers.push(() => circleTex.dispose());

const loader = new THREE.TextureLoader();
// Allow cross-origin textures (server must send CORS headers for images)
(loader as any).setCrossOrigin?.("anonymous");
  const urls = Array.from(
    new Set([hub.value.logo, ...nodes.value.map((n) => n.logo)].filter(Boolean))
  );

  const texMap = new Map<string, THREE.Texture>();

  await Promise.all(
    urls.map(async (url) => {
      try {
        const tex = await loader.loadAsync(url);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 1;
        texMap.set(url, tex);
        disposers.push(() => tex.dispose());
      } catch {}
    })
  );

  const hubVec = latLonToVec3(hub.value.lat, hub.value.lon, CFG.radius);
  const hubN = hubVec.clone().normalize();

  const routesGroup = new THREE.Group();
  globe.add(routesGroup);

  const hubTex = texMap.get(hub.value.logo);
  if (hubTex) {
    routesGroup.add(
      makeLogoPin(
        hubVec,
        hubN,
        hubTex,
        props.hubPinScale ?? 0.29,
        props.hubFrontLift ?? 0.14,
        props.hubRenderOrder ?? 50
      )
    );
  } else {
    routesGroup.add(makeHubMarker(hubVec, hubN, circleTex, props.hubRenderOrder ?? 50));
  }

  const minSepRad = (props.minSeparationDeg! * Math.PI) / 180;
  const minHubRad = (props.minNodeToHubDeg! * Math.PI) / 180;
  const safeCandidates = dotPoints.filter((p) => angleBetween(p, hubVec) > minHubRad);

  const need = nodes.value.length;
  const chosen = props.autoDistribute
    ? pickSpreadPoints(need, safeCandidates.length ? safeCandidates : dotPoints, minSepRad)
    : [];

  const routes: Array<ReturnType<typeof makeHubRoute>> = [];
  const routeStates: RouteState[] = Array.from({ length: nodes.value.length }, () => ({
    mode: null,
    start: 0,
    dur: 0,
  }));

  for (let i = 0; i < nodes.value.length; i++) {
    const node = nodes.value[i]!;
    const nodePos = chosen[i]
      ? chosen[i]!.clone()
      : latLonToVec3(
          node.lat ?? (Math.random() * 180 - 90),
          node.lon ?? (Math.random() * 360 - 180),
          CFG.radius
        );

    const nodeN = nodePos.clone().normalize();
    const color = i % 2 === 0 ? CFG.arcColor : "#9CA3AF";

    routesGroup.add(makeLogoPin(nodePos, nodeN, texMap.get(node.logo), props.nodePinScale!, 0.07, 1));

    const route = makeHubRoute(hubVec, nodePos, circleTex, color);
    routesGroup.add(route.baseLine, route.outLine, route.inLine, route.outDots, route.inDots);
    routes.push(route);
  }

  // scheduler
  let events: RouteEvent[] = [];
  let order: number[] = shuffle([...Array(nodes.value.length).keys()]);
  let orderCursor = 0;

  const pickNextSource = (exclude: Set<number>) => {
    for (let tries = 0; tries < nodes.value.length * 2; tries++) {
      if (orderCursor >= order.length) {
        order = shuffle([...Array(nodes.value.length).keys()]);
        orderCursor = 0;
      }
      const idx = order[orderCursor++]!;
      if (!exclude.has(idx)) return idx;
    }
    return null;
  };

  const pickDest = (exclude: Set<number>, usedDests: Set<number>) => {
    const n = nodes.value.length;
    if (n <= 1) return null;

    for (let t = 0; t < 40; t++) {
      const d = Math.floor(Math.random() * n);
      if (exclude.has(d) || usedDests.has(d)) continue;
      if (routeStates[d]?.mode) continue;
      return d;
    }
    for (let t = 0; t < 40; t++) {
      const d = Math.floor(Math.random() * n);
      if (!exclude.has(d) && !usedDests.has(d)) return d;
    }
    return null;
  };

  const scheduleBatch = (batchStart: number) => {
    const total = nodes.value.length;
    if (total === 0) return batchStart + 2;

    const minB = clamp(props.inboundBatchMin ?? 3, 1, total);
    const maxB = clamp(props.inboundBatchMax ?? 4, minB, total);
    const batchSize = total <= maxB ? total : Math.random() < 0.55 ? minB : maxB;

    const inDur = Math.max(1.6, props.inboundSeconds ?? 3.8);
    const outDur = Math.max(1.4, props.outboundSeconds ?? inDur * 0.85);
    const inSt = clamp(props.inboundStaggerSeconds ?? 0.18, 0.0, 0.6);
    const outDelay = clamp(props.outboundDelaySeconds ?? 0.1, 0.0, 0.8);
    const outSt = clamp(props.outboundStaggerSeconds ?? 0.1, 0.0, 0.6);
    const pause = clamp(props.batchPauseSeconds ?? 0.35, 0.0, 2.0);

    const sources: number[] = [];
    const excludeSources = new Set<number>();

    for (let i = 0; i < batchSize; i++) {
      const s = pickNextSource(excludeSources);
      if (s == null) break;
      sources.push(s);
      excludeSources.add(s);
    }

    const usedDests = new Set<number>();

    for (let i = 0; i < sources.length; i++) {
      const src = sources[i]!;
      const startIn = batchStart + i * inSt;
      events.push({ route: src, mode: "in", start: startIn, dur: inDur });

      const exclude = new Set<number>(excludeSources);
      exclude.add(src);

      const dest = pickDest(exclude, usedDests);
      if (dest != null) {
        usedDests.add(dest);
        const startOut = startIn + inDur + outDelay + i * outSt;
        events.push({ route: dest, mode: "out", start: startOut, dur: outDur });
      }
    }

    const lastInEnd = batchStart + (sources.length - 1) * inSt + inDur;
    const lastOutStart =
      batchStart +
      (sources.length - 1) * inSt +
      inDur +
      outDelay +
      (sources.length - 1) * outSt;
    const lastOutEnd = lastOutStart + outDur;

    return Math.max(lastInEnd, lastOutEnd) + pause;
  };

  let nextBatchAt = reduce ? 0.2 : 0.9;
  const ensureSchedule = (t: number) => {
    const lookAhead = lowPower ? 8 : 16;
    while (nextBatchAt < t + lookAhead) nextBatchAt = scheduleBatch(nextBatchAt);
    events.sort((a, b) => a.start - b.start);
  };

  const resize = () => {
    if (!renderer || !camera || !wrap.value) return;
    const rect = wrap.value.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  ro = new ResizeObserver(resize);
  ro.observe(wrap.value);
  resize();

  let isDown = false;
  let lastX = 0;
  let lastY = 0;
  const target = { rx: 0, ry: 0 };
  const current = { rx: 0, ry: 0 };

  const onDown = (e: PointerEvent) => {
    isDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onUp = () => (isDown = false);
  const onMove = (e: PointerEvent) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const nx = (e.clientX / w) * 2 - 1;
    const ny = (e.clientY / h) * 2 - 1;

    target.rx = -ny * 0.12;
    target.ry = nx * 0.22;

    if (!isDown) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    globe.rotation.y += dx * 0.004;
    globe.rotation.x += dy * 0.003;
  };

  canvas.value.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("pointermove", onMove, { passive: true });

  disposers.push(() => {
    canvas.value?.removeEventListener("pointerdown", onDown as any);
    window.removeEventListener("pointerup", onUp as any);
    window.removeEventListener("pointermove", onMove as any);
  });

  if (!reduce && !lowPower) {
    globe.scale.set(0.96, 0.96, 0.96);
    gsapTweens.push(gsap.to(globe.scale, { x: 1, y: 1, z: 1, duration: 1.05, ease: "power3.out" }));
    gsapTweens.push(gsap.fromTo(camera.position, { z: 4.2 }, { z: 3.7, duration: 1.1, ease: "power3.out" }));
  }

  let running = true;
  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const onLost = (e: Event) => {
    e.preventDefault();
    stopLoop();
  };
  canvas.value.addEventListener("webglcontextlost", onLost as any, false);
  disposers.push(() => canvas.value?.removeEventListener("webglcontextlost", onLost as any, false));

  const onVis = () => {
    if (document.hidden) stopLoop();
    else if (!running) {
      running = true;
      tick();
    }
  };
  document.addEventListener("visibilitychange", onVis);
  disposers.push(() => document.removeEventListener("visibilitychange", onVis));

  const clock = new THREE.Clock();

  const tick = () => {
    if (!running) return;
    raf = requestAnimationFrame(tick);

    if (!renderer || !scene || !camera) return;

    const t = clock.getElapsedTime();

    (dotMat as any).uniforms.uTime.value = t;
    (dotMat as any).uniforms.uPulseSpeed.value = props.dotPulseSpeed!;

    ensureSchedule(t);

    while (events.length && events[0]!.start <= t) {
      const ev = events.shift()!;
      const st = routeStates[ev.route];
      if (st && st.mode && t < st.start + st.dur) continue;
      routeStates[ev.route] = { mode: ev.mode, start: ev.start, dur: ev.dur };
    }

    for (let i = 0; i < routes.length; i++) {
      const st = routeStates[i]!;
      let phaseIn = true;
      let u = 0;

      if (st.mode) {
        const raw = (t - st.start) / Math.max(0.0001, st.dur);
        if (raw >= 1) {
          st.mode = null;
          u = 0;
          phaseIn = true;
        } else {
          phaseIn = st.mode === "in";
          u = easeInOutCubic(clamp(raw, 0, 1));
        }
      }
      routes[i]!.update(t, phaseIn, u);
    }

    const baseSpin = reduce ? 0.03 : 0.07;
    globe.rotation.y += 0.002 * baseSpin;

    current.rx = THREE.MathUtils.lerp(current.rx, target.rx, 0.05);
    current.ry = THREE.MathUtils.lerp(current.ry, target.ry, 0.05);
    globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, current.rx, 0.03);
    globe.rotation.y = THREE.MathUtils.lerp(globe.rotation.y, globe.rotation.y + current.ry * 0.01, 0.03);

    renderer.render(scene, camera);
  };

  tick();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  raf = 0;

  ro?.disconnect();
  ro = null;

  gsapTweens.forEach((t) => t.kill());
  gsapTweens = [];

  disposers.forEach((d) => d());
  disposers.length = 0;

  if (renderer) {
    (renderer as any).renderLists?.dispose?.();
    renderer.dispose();
    renderer.forceContextLoss?.();

    const el = renderer.domElement;
    el.width = 1;
    el.height = 1;
  }

  renderer = null;
  scene = null;
  camera = null;
});
</script>

<style scoped>
.globeWrap {
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  border-radius: inherit;
  overflow: hidden;
}

.globeCanvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}
</style>