import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { orientModel, placeRackModel, placeAP, calibrateSockets, modelNode } from "../../components/rack/scene/devices";
import { devicesFor, type Device } from "./devices";
import { computeAnchors } from "./anchors";

// Read the real shipped POSITION data without loading browser-only textures.
function geometryOnly(d: Device) {
 const j=JSON.parse(fs.readFileSync(process.cwd()+'/public'+d.glb,'utf8'));
 const buffers=j.buffers.map((b:any)=>Buffer.from(b.uri.split(',')[1],'base64'));
 const nodes=j.nodes.map((n:any)=>{const g=new THREE.Group();g.name=THREE.PropertyBinding.sanitizeNodeName(n.name||'');g.userData.name=n.name;if(n.matrix)g.applyMatrix4(new THREE.Matrix4().fromArray(n.matrix));else {if(n.translation)g.position.fromArray(n.translation);if(n.rotation)g.quaternion.fromArray(n.rotation);if(n.scale)g.scale.fromArray(n.scale);}if(n.mesh!==undefined)for(const prim of j.meshes[n.mesh].primitives){const a=j.accessors[prim.attributes.POSITION],v=j.bufferViews[a.bufferView],b=buffers[v.buffer];const data=new Float32Array(a.count*3);for(let i=0;i<a.count;i++)for(let k=0;k<3;k++)data[i*3+k]=b.readFloatLE((v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||12)+k*4);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(data,3));g.add(new THREE.Mesh(geo));}return g;});
 j.nodes.forEach((n:any,i:number)=>n.children?.forEach((c:number)=>nodes[i].add(nodes[c])));
 const obj=new THREE.Group();j.scenes[j.scene||0].nodes.forEach((i:number)=>obj.add(nodes[i]));
 return obj;
}

test("mounted sockets and cable anchors agree on the shipped models", () => {
  const devices = devicesFor("after");
  const anchors = computeAnchors(devices);
  for (const d of devices.filter((d) => d.glb)) {
    const g = orientModel(geometryOnly(d), d.hint, d.flip);
    if (d.kind === "ap") placeAP(g); else placeRackModel(g, d);
    calibrateSockets(g, d, anchors);
    const bounds = (name: string) => new THREE.Box3().setFromObject(modelNode(g, name)!);
    const close = (a: number, b: number) => assert(Math.abs(a - b) < 0.001);
    if (d.kind === "sw") {
      const a = anchors.SW;
      for (const [group, name] of ["metal.002", "metal.001", "metal"].entries()) {
        const b = bounds(name); const center = b.getCenter(new THREE.Vector3());
        close((a.p[group * 8].x + a.p[group * 8 + 7].x) / 2, center.x);
        for (const p of a.p.slice(group * 8, group * 8 + 8)) { close(p.y, center.y); close(p.z, b.max.z); assert(p.x > b.min.x && p.x < b.max.x); }
      }
      close(a.iec!.z, bounds("black").min.z);
      close(a.sfp[1].x, bounds("sfp").getCenter(new THREE.Vector3()).x);
    } else if (d.kind === "uci") {
      assert(bounds("LCM.001").max.z > bounds("Rear_Plug").max.z, "LCD faces forward");
      close(anchors.UCI.p[0].z, bounds("Port_Metal").max.z);
      close(anchors.UCI.coax!.z, bounds("Cable_Screw").min.z);
      close(anchors.UCI.iec!.x, bounds("Rear_Plug").getCenter(new THREE.Vector3()).x);
    } else if (d.kind === "ap") {
      assert(bounds("LED.001").getCenter(new THREE.Vector3()).y < bounds("Back_Case_AW").getCenter(new THREE.Vector3()).y, "AP LED faces the room");
      close(anchors.AP.port!.y, bounds("Metal_Ether.001").max.y);
    }
  }
});
