import Link from "next/link";

const variants = [
  { id: "a", label: "A · Index list" },
  { id: "b", label: "B · Sidebar mirror" },
  { id: "c", label: "C · Manifest table" },
  { id: "d", label: "D · Per-product manifests" },
];

export function VariantSwitcher({ active }: { active: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "8px 12px",
        marginBottom: 24,
        border: "1px dashed #2a2a2a",
        background: "#0a0a0a",
        fontSize: 11,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "#555", marginRight: 6, fontFamily: "var(--font-mono)" }}>VARIANT →</span>
      {variants.map((v) => {
        const isActive = v.id === active;
        return (
          <Link
            key={v.id}
            href={`/software?v=${v.id}`}
            style={{
              padding: "3px 10px",
              borderRadius: 3,
              border: "1px solid",
              borderColor: isActive ? "#c8c8c8" : "#1f1f1f",
              background: isActive ? "#c8c8c8" : "transparent",
              color: isActive ? "#060606" : "#828282",
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
