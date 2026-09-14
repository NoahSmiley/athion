import * as THREE from "three";

/** Renders text into a canvas texture. Used for face labels, badges and cable tags. Browser only. */
export function textMaterial(text: string, w: number, h: number, fg: string, bg: string | null = null, size = 120, weight = "600"): THREE.MeshBasicMaterial {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = Math.max(8, Math.round((1024 * h) / w));
  const x = c.getContext("2d")!;
  if (bg) {
    x.fillStyle = bg;
    x.fillRect(0, 0, c.width, c.height);
  }
  x.fillStyle = fg;
  x.font = `${weight} ${size}px "Barlow Condensed","Arial Narrow",sans-serif`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(text, c.width / 2, c.height / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: t, transparent: !bg, depthWrite: !!bg });
}

export const plane = (w: number, h: number, mat: THREE.Material) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
export const box = (w: number, h: number, d: number, mat: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
