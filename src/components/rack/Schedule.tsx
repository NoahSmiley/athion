"use client";

import { CSS_COLORS, speedLabel, type Cable } from "@/lib/rack/cables";

interface Props {
  list: Cable[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

const split = (s: string) => {
  const [head, ...rest] = s.split(" · ");
  return { head, rest: rest.join(" · ") };
};

export function Schedule({ list, selectedId, onSelect, onHover }: Props) {
  return (
    <div className="rack-rows">
      {list.map((c) => {
        const a = split(c.a);
        const b = split(c.b);
        return (
          <div
            key={c.id}
            className={`rack-row${c.id === selectedId ? " sel" : ""}`}
            onClick={() => onSelect(c.id)}
            onMouseEnter={() => onHover(c.id)}
            onMouseLeave={() => onHover(null)}
          >
            <span className="id">{c.id}</span>
            <span className="ep">
              <b>{a.head}</b>
              {a.rest}
            </span>
            <span className="ep">
              <b>{b.head}</b>
              {b.rest}
            </span>
            <span className="spd" style={{ color: CSS_COLORS[c.speed] }}>
              {speedLabel(c.speed)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
