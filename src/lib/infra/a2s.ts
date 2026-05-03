import dgram from "node:dgram";

// Steam A2S_INFO query. Project Zomboid and other Source-engine-style servers
// respond with player counts on the query port.
// Spec: https://developer.valvesoftware.com/wiki/Server_queries

const A2S_INFO_REQUEST = Buffer.concat([
  Buffer.from([0xff, 0xff, 0xff, 0xff, 0x54]),
  Buffer.from("Source Engine Query\0", "utf8"),
]);

export type A2SInfo = {
  players: number;
  maxPlayers: number;
  bots: number;
  map: string;
  name: string;
};

export async function queryA2S(host: string, port: number, timeoutMs = 2500): Promise<A2SInfo> {
  return new Promise((resolve, reject) => {
    const sock = dgram.createSocket("udp4");
    const timer = setTimeout(() => {
      sock.close();
      reject(new Error("A2S timeout"));
    }, timeoutMs);

    sock.on("error", (e) => {
      clearTimeout(timer);
      sock.close();
      reject(e);
    });

    sock.on("message", (msg) => {
      try {
        // Some servers respond with a challenge first (header 0x41). Re-send query with the challenge appended.
        if (msg[4] === 0x41 && msg.length >= 9) {
          const challenge = msg.subarray(5, 9);
          sock.send(Buffer.concat([A2S_INFO_REQUEST, challenge]), port, host);
          return;
        }
        clearTimeout(timer);
        const info = parseA2SInfo(msg);
        sock.close();
        resolve(info);
      } catch (e) {
        clearTimeout(timer);
        sock.close();
        reject(e);
      }
    });

    sock.send(A2S_INFO_REQUEST, port, host);
  });
}

function parseA2SInfo(buf: Buffer): A2SInfo {
  // Skip 4-byte header (0xFFFFFFFF) + 1-byte type (0x49) + 1-byte protocol
  let i = 6;
  const readCStr = () => {
    const end = buf.indexOf(0, i);
    const s = buf.toString("utf8", i, end);
    i = end + 1;
    return s;
  };
  const name = readCStr();
  const map = readCStr();
  readCStr(); // folder
  readCStr(); // game
  i += 2;     // app id
  const players = buf[i++];
  const maxPlayers = buf[i++];
  const bots = buf[i++];
  return { name, map, players, maxPlayers, bots };
}
