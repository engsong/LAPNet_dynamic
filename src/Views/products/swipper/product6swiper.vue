<template>
  <div ref="containerRef" class="globe-root"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobe from "three-globe";
import countries from "../../../data/globe.json";

const RING_PROPAGATION_SPEED = 1.9;
const DEFAULT_ASPECT = 1.2;
const CAMERA_Z = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

type GlobeArc = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
  dashInitialGap: number;
  ringColor: string;
};

type GlobePoint = {
  lat: number;
  lng: number;
  color: string;
  size: number;
};

type CountryFeatureCollection = {
  features?: Record<string, unknown>[];
};

const props = defineProps<WorldProps>();
const containerRef = ref<HTMLDivElement | null>(null);

const mergedConfig = computed(() => ({
  pointSize: 0.38,
  atmosphereColor: "#67e8f9",
  showAtmosphere: true,
  atmosphereAltitude: 0.17,
  polygonColor: "rgba(110,168,255,0.14)",
  globeColor: "#071126",
  emissive: "#0b1733",
  emissiveIntensity: 0.28,
  shininess: 1.1,
  arcTime: 4200,
  arcLength: 0.16,
  rings: 1,
  maxRings: 4.5,
  ambientLight: "#b7d8ff",
  directionalLeftLight: "#6ee7ff",
  directionalTopLight: "#9f7aea",
  pointLight: "#7dd3fc",
  autoRotate: true,
  autoRotateSpeed: 0.55,
  ...props.globeConfig,
}));

const countryFeatures = ((countries as CountryFeatureCollection).features ?? []) as object[];

let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let renderer: WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let globe: ThreeGlobe | null = null;

let ambientLightRef: AmbientLight | null = null;
let directionalLeftLightRef: DirectionalLight | null = null;
let directionalTopLightRef: DirectionalLight | null = null;
let pointLightRef: PointLight | null = null;
let pointLightBackRef: PointLight | null = null;

let animationFrameId = 0;
let ringsIntervalId: number | null = null;

function safeNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function sanitizeArcList(input: Position[]) {
  return (Array.isArray(input) ? input : [])
    .map((item, index): GlobeArc => ({
      order: safeNumber(item?.order, index),
      startLat: safeNumber(item?.startLat),
      startLng: safeNumber(item?.startLng),
      endLat: safeNumber(item?.endLat),
      endLng: safeNumber(item?.endLng),
      arcAlt: safeNumber(item?.arcAlt, 0.28),
      color: String(item?.color || "rgba(34,211,238,0.88)"),
      dashInitialGap: index * 0.28,
      ringColor: String(item?.color || "rgba(34,211,238,0.45)"),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.startLat) &&
        Number.isFinite(item.startLng) &&
        Number.isFinite(item.endLat) &&
        Number.isFinite(item.endLng),
    );
}

function buildSparseWorldPoints(arcs: GlobeArc[]) {
  const cfg = mergedConfig.value;
  const sparsePoints: GlobePoint[] = [];
  const latBands = [-54, -26, 0, 24, 48];
  const lngStep = 72;

  latBands.forEach((lat, rowIndex) => {
    for (let lng = -180; lng < 180; lng += lngStep) {
      sparsePoints.push({
        lat,
        lng: lng + (rowIndex % 2 === 0 ? 10 : -12),
        color: "rgba(125,211,252,0.18)",
        size: cfg.pointSize,
      });
    }
  });

  const endpointPoints = arcs
    .flatMap((arc) => [
      {
        lat: arc.startLat,
        lng: arc.startLng,
        color: "rgba(103,232,249,0.68)",
        size: cfg.pointSize * 1.4,
      },
      {
        lat: arc.endLat,
        lng: arc.endLng,
        color: "rgba(192,132,252,0.58)",
        size: cfg.pointSize * 1.25,
      },
    ])
    .filter(
      (value, index, array) =>
        array.findIndex((item) => item.lat === value.lat && item.lng === value.lng) === index,
    )
    .slice(0, 14);

  return [...sparsePoints, ...endpointPoints];
}

function initScene() {
  if (!containerRef.value || scene) return;

  const el = containerRef.value;
  const width = el.clientWidth || 800;
  const height = el.clientHeight || Math.round(width / DEFAULT_ASPECT);

  scene = new Scene();
  scene.fog = new Fog(0x071126, 540, 1750);

  camera = new PerspectiveCamera(42, width / height, 180, 1800);
  camera.position.set(0, 0, CAMERA_Z);

  renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = SRGBColorSpace;

  el.appendChild(renderer.domElement);

  ambientLightRef = new AmbientLight(mergedConfig.value.ambientLight, 0.9);

  directionalLeftLightRef = new DirectionalLight(mergedConfig.value.directionalLeftLight, 1.45);
  directionalLeftLightRef.position.copy(new Vector3(-420, 140, 420));

  directionalTopLightRef = new DirectionalLight(mergedConfig.value.directionalTopLight, 1.25);
  directionalTopLightRef.position.copy(new Vector3(120, 520, 160));

  pointLightRef = new PointLight(mergedConfig.value.pointLight, 1.35, 0, 2.2);
  pointLightRef.position.copy(new Vector3(-210, 220, 300));

  pointLightBackRef = new PointLight("#38bdf8", 0.95, 0, 2.5);
  pointLightBackRef.position.copy(new Vector3(260, -180, -220));

  scene.add(ambientLightRef);
  scene.add(directionalLeftLightRef);
  scene.add(directionalTopLightRef);
  scene.add(pointLightRef);
  scene.add(pointLightBackRef);

  globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true });
  globe.rendererSize(new Vector2(width, height));
  scene.add(globe);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = CAMERA_Z;
  controls.maxDistance = CAMERA_Z;
  controls.autoRotate = mergedConfig.value.autoRotate;
  controls.autoRotateSpeed = mergedConfig.value.autoRotateSpeed;
  controls.minPolarAngle = Math.PI / 3.65;
  controls.maxPolarAngle = Math.PI - Math.PI / 3.15;

  applyMaterial();
  applyLights();
  buildGlobeData();
  startRingsAnimation();
  handleResize();
  animate();

  window.addEventListener("resize", handleResize);
}

function applyMaterial() {
  if (!globe) return;

  const material = globe.globeMaterial() as unknown as {
    color: Color;
    emissive: Color;
    emissiveIntensity: number;
    shininess: number;
  };

  material.color = new Color(mergedConfig.value.globeColor);
  material.emissive = new Color(mergedConfig.value.emissive);
  material.emissiveIntensity = mergedConfig.value.emissiveIntensity;
  material.shininess = mergedConfig.value.shininess;
}

function applyLights() {
  if (
    !ambientLightRef ||
    !directionalLeftLightRef ||
    !directionalTopLightRef ||
    !pointLightRef ||
    !pointLightBackRef
  ) {
    return;
  }

  ambientLightRef.color = new Color(mergedConfig.value.ambientLight);
  directionalLeftLightRef.color = new Color(mergedConfig.value.directionalLeftLight);
  directionalTopLightRef.color = new Color(mergedConfig.value.directionalTopLight);
  pointLightRef.color = new Color(mergedConfig.value.pointLight);
  pointLightBackRef.color = new Color("#38bdf8");

  if (controls) {
    controls.autoRotate = mergedConfig.value.autoRotate;
    controls.autoRotateSpeed = mergedConfig.value.autoRotateSpeed;
  }
}

function buildGlobeData() {
  if (!globe) return;

  const cfg = mergedConfig.value;
  const arcs = sanitizeArcList(props.data);
  const sparsePoints = buildSparseWorldPoints(arcs);

  globe
    .hexPolygonsData(countryFeatures)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.55)
    .showAtmosphere(cfg.showAtmosphere)
    .atmosphereColor(cfg.atmosphereColor)
    .atmosphereAltitude(cfg.atmosphereAltitude)
    .hexPolygonColor(() => cfg.polygonColor);

  globe
    .arcsData(arcs as never[])
    .arcStartLat("startLat")
    .arcStartLng("startLng")
    .arcEndLat("endLat")
    .arcEndLng("endLng")
    .arcColor("color")
    .arcAltitude("arcAlt")
    .arcStroke(0.75)
    .arcDashLength(safeNumber(cfg.arcLength, 0.16))
    .arcDashGap(1.8)
    .arcDashInitialGap("dashInitialGap")
    .arcDashAnimateTime(safeNumber(cfg.arcTime, 4200))
    .arcsTransitionDuration(0);

  globe
    .pointsData(sparsePoints as never[])
    .pointColor("color")
    .pointAltitude(0.006)
    .pointRadius((point: object) => safeNumber((point as GlobePoint).size, cfg.pointSize))
    .pointsMerge(true);

  globe
    .ringsData([])
    .ringColor("ringColor")
    .ringMaxRadius(cfg.maxRings)
    .ringPropagationSpeed(RING_PROPAGATION_SPEED)
    .ringRepeatPeriod(Math.max(1400, safeNumber(cfg.arcTime, 4200) * 0.62));
}

function startRingsAnimation() {
  stopRingsAnimation();

  if (!globe) return;

  const arcs = sanitizeArcList(props.data);
  if (!arcs.length) return;

  globe.ringsData(
    arcs.slice(0, Math.min(arcs.length, 2)).map((item) => ({
      lat: item.startLat,
      lng: item.startLng,
      ringColor: "rgba(103,232,249,0.42)",
    })),
  );

  ringsIntervalId = window.setInterval(() => {
    if (!globe) return;

    const randomIndexes = genRandomNumbers(
      0,
      arcs.length,
      Math.max(1, Math.min(3, Math.ceil(arcs.length / 4))),
    );

    const ringsData = arcs
      .filter((_, index) => randomIndexes.includes(index))
      .map((item, index) => ({
        lat: index % 2 === 0 ? item.startLat : item.endLat,
        lng: index % 2 === 0 ? item.startLng : item.endLng,
        ringColor: index % 2 === 0 ? "rgba(103,232,249,0.42)" : "rgba(192,132,252,0.36)",
      }));

    globe.ringsData(ringsData);
  }, 2800);
}

function stopRingsAnimation() {
  if (ringsIntervalId !== null) {
    window.clearInterval(ringsIntervalId);
    ringsIntervalId = null;
  }
}

function animate() {
  if (!renderer || !scene || !camera) return;

  controls?.update();
  renderer.render(scene, camera);
  animationFrameId = window.requestAnimationFrame(animate);
}

function handleResize() {
  if (!containerRef.value || !renderer || !camera) return;

  const width = containerRef.value.clientWidth || 800;
  const height = containerRef.value.clientHeight || Math.round(width / DEFAULT_ASPECT);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  globe?.rendererSize(new Vector2(width, height));
}

function disposeScene() {
  stopRingsAnimation();
  window.removeEventListener("resize", handleResize);

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
  }

  controls?.dispose();
  renderer?.dispose();

  if (renderer?.domElement && containerRef.value?.contains(renderer.domElement)) {
    containerRef.value.removeChild(renderer.domElement);
  }

  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  globe = null;
  ambientLightRef = null;
  directionalLeftLightRef = null;
  directionalTopLightRef = null;
  pointLightRef = null;
  pointLightBackRef = null;
}

onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  disposeScene();
});

watch(
  () => props.globeConfig,
  () => {
    applyMaterial();
    applyLights();
    buildGlobeData();
    startRingsAnimation();
  },
  { deep: true },
);

watch(
  () => props.data,
  () => {
    buildGlobeData();
    startRingsAnimation();
  },
  { deep: true },
);

function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = [];
  const safeCount = Math.max(0, Math.min(count, max - min));

  while (arr.length < safeCount) {
    const randomValue = Math.floor(Math.random() * (max - min)) + min;
    if (!arr.includes(randomValue)) {
      arr.push(randomValue);
    }
  }

  return arr;
}
</script>

<style scoped>
.globe-root {
  width: 100%;
  height: 100%;
  min-height: 600px;
  position: relative;
  overflow: hidden;
}
</style>
