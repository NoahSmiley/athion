import Link from "next/link";

const variants = [
  { id: "current", label: "Current" },
  { id: "rack", label: "A · Rack" },
  { id: "ledger", label: "B · Ledger" },
  { id: "console", label: "C · Console" },
];

export function VariantSwitcher({ active }: { active: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "6px 8px",
        marginTop: 48,
        border: "1px dashed #1f1f1f",
        background: "#0a0a0a",
        fontSize: 9,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "#444", marginRight: 4, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>v →</span>
      {variants.map((v) => {
        const isActive = v.id === active;
        return (
          <Link
            key={v.id}
            href={v.id === "current" ? "/infra" : `/infra?v=${v.id}`}
            style={{
              padding: "2px 7px",
              borderRadius: 2,
              border: "1px solid",
              borderColor: isActive ? "#828282" : "#1a1a1a",
              background: isActive ? "#828282" : "transparent",
              color: isActive ? "#060606" : "#666",
              textDecoration: "none",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
