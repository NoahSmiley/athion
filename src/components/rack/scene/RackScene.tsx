"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { computeAnchors } from "@/lib/rack/anchors";
import { SCHEDULE, type Cable } from "@/lib/rack/cables";
import { devicesFor } from "@/lib/rack/devices";
import { CH, yOf, type Mode } from "@/lib/rack/geometry";
import { buildCabinet, buildCeiling } from "./cabinet";
import { buildCables, highlightCables, type CableObject } from "./cables";
import { buildDevices } from "./devices";
import { makeMaterials } from "./materials";
import { buildDeskEndpoints } from "./endpoints";
import { disposeTree } from "./dispose";

export type ViewPreset = "equipment" | "overview" | "front" | "rear";

interface Props {
  mode: Mode;
  selectedId: string | null;
  hoveredId: string | null;
  pathIds: string[];
  sidePanels: boolean;
  doors: boolean;
  showCables: boolean;
  labels: boolean;
  /** Incrementing token + preset; bump to re-aim the camera. */
  view: { preset: ViewPreset; n: number };
  onHover: (cable: Cable | null, x: number, y: number) => void;
  onSelect: (cable: Cable | null) => void;
  onLoadState: (state: "loading" | "loaded" | "fallback" | "unavailable") => void;
}

/**
 * Imperative three.js scene behind a React surface. Rebuilds the whole scene when `mode` changes;
 * hover/select/side-panel/view changes only touch materials and the camera.
 */
export function RackScene({ mode, selectedId, hoveredId, pathIds, sidePanels, doors, showCables, labels, view, onHover, onSelect, onLoadState }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    root: THREE.Group;
    cables: CableObject[];
    sides: THREE.Mesh[];
    doors: THREE.Group[];
    cableRoot: THREE.Group | null;
    ceiling: THREE.Group | null;
    desks: THREE.Group | null;
    frame: (preset: ViewPreset, animate?: boolean) => void;
    raf: number;
  } | null>(null);
  const cb = useRef({ onHover, onSelect, onLoadState });
  cb.current = { onHover, onSelect, onLoadState };

  const selectionRef = useRef({ id: hoveredId ?? selectedId ?? (pathIds.length ? pathIds : null), labels });
  selectionRef.current = { id: hoveredId ?? selectedId ?? (pathIds.length ? pathIds : null), labels };
  const viewRef = useRef(view);
  viewRef.current = view;

  // renderer, camera, lights, controls: once
  useEffect(() => {
    const host = hostRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      cb.current.onLoadState("unavailable");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0b101a, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    host.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xdce9ff, 0x172030, 0.65));
    const key = new THREE.DirectionalLight(0xffefdc, 3.2);
    key.position.set(-9, 28, 18);
    key.target.position.set(0, 12, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -14, right: 14, top: 16, bottom: -16, near: 1, far: 65 });
    key.shadow.normalBias = 0.025;
    key.shadow.bias = -0.0002;
    key.shadow.radius = 3;
    scene.add(key.target);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xaacbff, 1.5);
    fill.position.set(12, 16, 8);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x8aaeff, 2.2);
    rim.position.set(4, 20, -12);
    scene.add(rim);
    const rearFill = new THREE.DirectionalLight(0xd5e4ff, 1.4);
    rearFill.position.set(-7, 16, -16);
    rearFill.target.position.set(0, 13, 0);
    scene.add(rearFill, rearFill.target);
    // Metals need an environment to reflect or they render black.
    const pm = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pm.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.38;
    room.dispose();
    pm.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 95;
    controls.enablePan = true;
    controls.zoomToCursor = true;
    controls.maxPolarAngle = Math.PI * 0.62;
    const root = new THREE.Group();
    scene.add(root);

    const destination = new THREE.Vector3();
    const target = new THREE.Vector3();
    let moving = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = (preset: ViewPreset, animate = false) => {
      const close = preset === "equipment";
      if (stateRef.current?.ceiling) stateRef.current.ceiling.visible = !close;
      const overview = preset === "overview";
      target.set(overview ? -2.4 : 0, close ? yOf(10) + 0.15 : overview ? CH / 2 + 1 : CH / 2, 0);
      const height = close ? 12.3 : overview ? CH + 6.5 : CH + 3;
      const width = overview ? 22 : close ? 10 : 17;
      const distance = Math.max(height, width / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      const angle = preset === "rear" ? Math.PI - 0.28 : preset === "front" ? 0 : overview ? 0.48 : 0.25;
      destination.set(target.x + distance * Math.sin(angle), target.y + distance * (overview ? 0.16 : 0.07), distance * Math.cos(angle));
      moving = animate && !reducedMotion;
      if (!moving) { camera.position.copy(destination); controls.target.copy(target); controls.update(); }
    };
    controls.addEventListener("start", () => { moving = false; });
    const st = { renderer, scene, camera, controls, root, frame, cables: [] as CableObject[], sides: [] as THREE.Mesh[], doors: [] as THREE.Group[], cableRoot: null as THREE.Group | null, ceiling: null as THREE.Group | null, desks: null as THREE.Group | null, raf: 0 };
    stateRef.current = st;

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h, false);
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frame(viewRef.current.preset);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downAt: [number, number] | null = null;
    const pick = (e: PointerEvent): Cable | null => {
      const r = host.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(mouse, camera);
      if (!st.cableRoot?.visible) return null;
      const hit = ray.intersectObjects(st.cables.filter((c) => c.visible))[0];
      return hit ? (hit.object as CableObject).userData.cable : null;
    };
    const onMove = (e: PointerEvent) => {
      if (e.buttons) return;
      const c = pick(e);
      const r = host.getBoundingClientRect();
      host.style.cursor = c ? "pointer" : "grab";
      cb.current.onHover(c, e.clientX - r.left, e.clientY - r.top + host.offsetTop);
    };
    const onDown = (e: PointerEvent) => (downAt = [e.clientX, e.clientY]);
    const onUp = (e: PointerEvent) => {
      if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4) cb.current.onSelect(pick(e));
      downAt = null;
    };
    const onLeave = () => cb.current.onHover(null, 0, 0);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);

    const loop = () => {
      if (moving) {
        camera.position.lerp(destination, 0.12);
        controls.target.lerp(target, 0.12);
        if (camera.position.distanceTo(destination) < 0.01 && controls.target.distanceTo(target) < 0.01) moving = false;
      }
      controls.update();
      if (st.desks) st.desks.visible = camera.position.z < controls.target.z;
      for (const cable of st.cables) {
        if (cable.userData.overviewOnly) cable.visible = viewRef.current.preset !== "equipment";
      }
      renderer.render(scene, camera);
      st.raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(st.raf);
      ro.disconnect();
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      controls.dispose();
      environment.dispose();
      key.shadow.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      stateRef.current = null;
    };
  }, []);

  // scene contents: per mode
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const content = new THREE.Group();
    st.root.add(content);
    const M = makeMaterials();
    const devices = devicesFor(mode);
    const anchors = computeAnchors(devices);
    const { sidePanels: sides, doors: doorGroups } = buildCabinet(content, M);
    const ceiling = new THREE.Group();
    content.add(ceiling);
    st.ceiling = ceiling;
    ceiling.visible = viewRef.current.preset !== "equipment";
    if (mode === "after") buildCeiling(ceiling, M);
    const { overlays, pending } = buildDevices(content, devices.filter((d) => d.kind !== "ap"), anchors, M);
    const ap = buildDevices(ceiling, devices.filter((d) => d.kind === "ap"), anchors, M);
    pending.push(...ap.pending);
    const cableRoot = new THREE.Group();
    content.add(cableRoot);
    st.cableRoot = cableRoot;
    cableRoot.visible = showCables;
    st.cables = [];
    const desks = new THREE.Group();
    cableRoot.add(desks);
    buildDeskEndpoints(desks);
    st.desks = desks;
    st.doors = doorGroups;
    doorGroups.forEach((door) => (door.visible = doors));
    st.sides = sides;
    sides.forEach((p) => (p.visible = sidePanels));
    cb.current.onLoadState("loading");
    let live = true;
    let settled = false;
    const dispose = () => { disposeTree(content); Object.values(M).forEach((material) => material.dispose()); };
    Promise.allSettled(pending).then((rs) => {
      settled = true;
      if (!live) { dispose(); return; }
      st.cables = buildCables(cableRoot, SCHEDULE[mode], anchors, overlays);
      highlightCables(st.cables, selectionRef.current.id, selectionRef.current.labels);
      if (live) cb.current.onLoadState(rs.every((r) => r.status === "fulfilled") ? "loaded" : "fallback");
    });
    return () => {
      live = false;
      st.root.remove(content);
      if (settled) dispose();
    };
    // Layer visibility and selection update independently; changing them does not reload models.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    stateRef.current?.sides.forEach((p) => (p.visible = sidePanels));
  }, [sidePanels]);

  useEffect(() => {
    stateRef.current?.doors.forEach((door) => (door.visible = doors));
  }, [doors]);

  useEffect(() => {
    const st = stateRef.current;
    if (st?.cableRoot) st.cableRoot.visible = showCables;
    if (!showCables) cb.current.onHover(null, 0, 0);
  }, [showCables]);

  useEffect(() => {
    const st = stateRef.current;
    if (st) highlightCables(st.cables, hoveredId ?? selectedId ?? (pathIds.length ? pathIds : null), labels);
  }, [hoveredId, selectedId, pathIds, mode, labels]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    st.frame(view.preset, view.n > 0);
  }, [view]);

  return <div ref={hostRef} className="rack-view" role="img" aria-label="Interactive 3D rack. Drag to orbit, scroll to zoom. Use the view buttons and cable schedule for keyboard navigation." />;
}
