import net from "node:net";

// Minecraft Server List Ping (SLP), modern handshake variant.
// Spec: https://wiki.vg/Server_List_Ping
//
// We only need the JSON status payload (players + version), not the latency ping.

export type MCStatus = {
  players: number;
  maxPlayers: number;
  version: string;
};

function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  let v = value >>> 0;
  while (true) {
    if ((v & ~0x7f) === 0) { bytes.push(v); break; }
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  return Buffer.from(bytes);
}

function readVarInt(buf: Buffer, offset: number): { value: number; length: number } {
  let value = 0, length = 0, byte: number;
  do {
    if (offset + length >= buf.length) throw new Error("VarInt truncated");
    byte = buf[offset + length];
    value |= (byte & 0x7f) << (7 * length);
    length++;
    if (length > 5) throw new Error("VarInt too long");
  } while (byte & 0x80);
  return { value, length };
}

export async function queryMC(host: string, port = 25565, timeoutMs = 3000): Promise<MCStatus> {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection({ host, port });
    let chunks = Buffer.alloc(0);
    const timer = setTimeout(() => { sock.destroy(); reject(new Error("MC SLP timeout")); }, timeoutMs);

    sock.once("error", (e) => { clearTimeout(timer); sock.destroy(); reject(e); });

    sock.on("connect", () => {
      const hostBuf = Buffer.from(host, "utf8");
      const handshake = Buffer.concat([
        Buffer.from([0x00]),                       // packet id
        writeVarInt(764),                          // protocol version (1.20.4-ish; servers ignore for status)
        writeVarInt(hostBuf.length), hostBuf,
        Buffer.from([(port >> 8) & 0xff, port & 0xff]),
        writeVarInt(1),                            // next state = status
      ]);
      const handshakeFrame = Buffer.concat([writeVarInt(handshake.length), handshake]);
      const requestFrame = Buffer.concat([writeVarInt(1), Buffer.from([0x00])]);
      sock.write(Buffer.concat([handshakeFrame, requestFrame]));
    });

    sock.on("data", (chunk: Buffer) => {
      chunks = Buffer.concat([chunks, chunk]);
      try {
        const { value: pktLen, length: lenSize } = readVarInt(chunks, 0);
        if (chunks.length < lenSize + pktLen) return; // wait for more
        let off = lenSize;
        const { length: idSize } = readVarInt(chunks, off); off += idSize;
        const { value: jsonLen, length: jsonLenSize } = readVarInt(chunks, off); off += jsonLenSize;
        const json = chunks.subarray(off, off + jsonLen).toString("utf8");
        clearTimeout(timer);
        sock.destroy();
        const parsed = JSON.parse(json);
        resolve({
          players: parsed.players?.online ?? 0,
          maxPlayers: parsed.players?.max ?? 0,
          version: parsed.version?.name ?? "unknown",
        });
      } catch {
        // not enough bytes yet, keep buffering
      }
    });
  });
}
