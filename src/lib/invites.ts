export const INVITE_CODE_TTL_DAYS = 14;

export function generateCode(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}
