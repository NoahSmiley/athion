"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Kanban, FileText, Calendar, Bot,
  Plus, MoreHorizontal, Tag, Clock, User,
} from "lucide-react";

/* ─── Color tokens (OpenDock dark theme) ─── */
const C = {
  bgPrimary: "#0a0a0a",
  bgSecondary: "#111111",
  bgCard: "#161616",
  bgHover: "#1a1a1a",
  textPrimary: "#e5e5e5",
  textSecondary: "#737373",
  textMuted: "#525252",
  accent: "#a78bfa",
  accentGlow: "rgba(167,139,250,0.15)",
  border: "#1e1e1e",
  green: "#4ade80",
  blue: "#60a5fa",
  amber: "#fbbf24",
  red: "#f87171",
} as const;

/* ─── Sidebar nav items ─── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Kanban, label: "Boards", active: true },
  { icon: FileText, label: "Notes", active: false },
  { icon: Calendar, label: "Calendar", active: false },
];

/* ─── Board columns ─── */
const COLUMNS = [
  { id: "backlog", title: "Backlog", color: "#525252" },
  { id: "todo", title: "To Do", color: "#60a5fa" },
  { id: "progress", title: "In Progress", color: "#fbbf24" },
  { id: "done", title: "Done", color: "#4ade80" },
];

/* ─── Tickets ─── */
const INITIAL_TICKETS: Ticket[] = [
  { id: "OD-14", title: "Add drag-and-drop reorder", col: "backlog", priority: "medium", assignee: "R", tags: ["frontend"] },
  { id: "OD-15", title: "Calendar recurring events", col: "backlog", priority: "low", assignee: "Q", tags: ["feature"] },
  { id: "OD-10", title: "Build notification system", col: "todo", priority: "high", assignee: "N", tags: ["backend"] },
  { id: "OD-11", title: "Fix sidebar collapse anim", col: "todo", priority: "medium", assignee: "T", tags: ["bug"] },
  { id: "OD-7", title: "Implement sprint planning", col: "progress", priority: "high", assignee: "N", tags: ["feature"] },
  { id: "OD-8", title: "Notes markdown preview", col: "progress", priority: "medium", assignee: "R", tags: ["frontend"] },
  { id: "OD-3", title: "Auth session management", col: "done", priority: "high", assignee: "T", tags: ["backend"] },
  { id: "OD-4", title: "Board snapshot API", col: "done", priority: "medium", assignee: "N", tags: ["backend"] },
];

interface Ticket {
  id: string;
  title: string;
  col: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  tags: string[];
}

const USERS: Record<string, { color: string; avatar: string }> = {
  N: { color: "#6366f1", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Noah&top=shortCurly&clothing=hoodie&clothesColor=6366f1&skinColor=f8d25c" },
  T: { color: "#8b5cf6", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Trevor&top=shortFlat&facialHair=beardLight&clothing=blazerAndShirt&skinColor=edb98a" },
  R: { color: "#0ea5e9", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Riley&top=shortWaved&clothing=graphicShirt&clothesColor=0ea5e9&skinColor=f8d25c" },
  Q: { color: "#f59e0b", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Quinn&top=dreads01&facialHair=beardMedium&clothing=hoodie&clothesColor=f59e0b&skinColor=ae5d29" },
};

const PRIORITY_COLORS = { low: C.green, medium: C.amber, high: C.red };

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/* ─── Ticket Card ─── */
function TicketCard({ ticket }: { ticket: Ticket }) {
  const user = USERS[ticket.assignee];
  return (
    <div
      className="rounded-lg p-3 mb-2"
      style={{ background: C.bgCard, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between mb-2">
        <span style={{ fontSize: "10px", fontFamily: "monospace", color: C.textMuted }}>{ticket.id}</span>
        <MoreHorizontal size={12} style={{ color: C.textMuted }} />
      </div>
      <p style={{ fontSize: "12px", color: C.textPrimary, lineHeight: 1.4, marginBottom: "8px" }}>
        {ticket.title}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-full"
            style={{ width: 6, height: 6, background: PRIORITY_COLORS[ticket.priority] }}
          />
          {ticket.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded"
              style={{ fontSize: "9px", background: C.accentGlow, color: C.accent }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div
          className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"
          style={{ background: user.color + "33" }}
        >
          <img src={user.avatar} alt="" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Board Column ─── */
function BoardColumn({ column, tickets }: { column: typeof COLUMNS[number]; tickets: Ticket[] }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="rounded-full" style={{ width: 8, height: 8, background: column.color }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: C.textPrimary }}>{column.title}</span>
          <span style={{ fontSize: "10px", color: C.textMuted }}>{tickets.length}</span>
        </div>
        <Plus size={12} style={{ color: C.textMuted }} />
      </div>
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout">
          {tickets.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <TicketCard ticket={t} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Exported OpenDockAppMock ─── */
export function OpenDockAppMock({ height = "520px" }: { height?: string }) {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const moveIdx = useRef(0);

  // Animate tickets moving between columns every 4s
  useEffect(() => {
    const moves = [
      { id: "OD-10", to: "progress" },
      { id: "OD-14", to: "todo" },
      { id: "OD-8", to: "done" },
      { id: "OD-11", to: "progress" },
      { id: "OD-15", to: "todo" },
      { id: "OD-10", to: "done" },
      { id: "OD-14", to: "progress" },
      { id: "OD-11", to: "done" },
    ];

    const interval = setInterval(() => {
      const move = moves[moveIdx.current % moves.length];
      setTickets((prev) =>
        prev.map((t) => (t.id === move.id ? { ...t, col: move.to } : t))
      );
      moveIdx.current++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden w-full mx-auto"
      style={{ background: C.bgPrimary, border: `1px solid ${C.border}` }}
    >
      <div className="flex" style={{ height }}>
        {/* Sidebar */}
        <div
          className="flex-shrink-0 flex-col hidden md:flex"
          style={{ width: "200px", background: C.bgSecondary, borderRight: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 px-4" style={{ height: "44px", borderBottom: `1px solid ${C.border}` }}>
            <div className="w-5 h-5 rounded" style={{ background: C.accent + "33" }}>
              <div className="w-full h-full flex items-center justify-center">
                <span style={{ fontSize: "10px", fontWeight: 700, color: C.accent }}>O</span>
              </div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>OpenDock</span>
          </div>
          <div className="flex-1 px-2 pt-2 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md"
                style={{
                  background: item.active ? "rgba(167,139,250,0.08)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <item.icon size={14} style={{ color: item.active ? C.accent : C.textMuted }} />
                <span style={{ fontSize: "13px", fontWeight: item.active ? 500 : 400, color: item.active ? C.textPrimary : C.textSecondary }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {/* Claude button at bottom */}
          <div className="px-2 pb-3">
            <div
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md"
              style={{ background: "rgba(167,139,250,0.06)", cursor: "pointer" }}
            >
              <Bot size={14} style={{ color: C.accent }} />
              <span style={{ fontSize: "13px", color: C.textSecondary }}>Claude</span>
            </div>
          </div>
        </div>

        {/* Main content — board */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Board header */}
          <div
            className="flex items-center justify-between px-5 flex-shrink-0"
            style={{ height: "44px", borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary }}>Sprint 4</span>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", background: C.accentGlow, color: C.accent }}>
                Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {Object.values(USERS).map((u) => (
                  <div key={u.color} className="w-5 h-5 rounded-full overflow-hidden" style={{ border: `2px solid ${C.bgPrimary}`, background: u.color + "33" }}>
                    <img src={u.avatar} alt="" className="w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columns */}
          <div className="flex-1 overflow-hidden flex gap-3 p-4">
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tickets={tickets.filter((t) => t.col === col.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
