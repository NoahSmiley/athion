import dgram from "node:dgram";

/** Rack PCs that can be woken from the admin page. MACs from the UniFi client list. */
export const WAKE_TARGETS = [
  { id: "gaming", name: "Noah's gaming PC", mac: "bc:fc:e7:19:d9:e8" },
  { id: "sam", name: "Sam's PC", mac: "9c:6b:00:5e:52:41" },
] as const;

export type WakeTargetId = (typeof WAKE_TARGETS)[number]["id"];

/**
 * Sends a Wake-on-LAN magic packet (6 x 0xFF, then the MAC 16 times) as a
 * broadcast on the home LAN. athion.me runs on CT 109, which sits on the same
 * network as the PCs, so the broadcast reaches their NICs directly.
 */
export function sendMagicPacket(mac: string): Promise<void> {
  const bytes = Buffer.from(mac.replace(/[^0-9a-f]/gi, ""), "hex");
  if (bytes.length !== 6) return Promise.reject(new Error("Invalid MAC"));
  const packet = Buffer.alloc(102, 0xff);
  for (let i = 0; i < 16; i++) bytes.copy(packet, 6 + i * 6);

  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    socket.once("error", (err) => { socket.close(); reject(err); });
    socket.bind(() => {
      socket.setBroadcast(true);
      socket.send(packet, 9, "192.168.0.255", (err) => {
        socket.close();
        if (err) reject(err); else resolve();
      });
    });
  });
}
