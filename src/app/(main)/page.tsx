"use client";

import { useState, useEffect } from "react";

const slogans = [
  "Quietly excellent.",
  "Software that disappears.",
  "Less, but better.",
  "Only what matters.",
  "Engineering without compromise.",
];

export default function HomePage() {
  const [i, setI] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setI((prev) => (prev + 1) % slogans.length);
        setOpacity(1);
      }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="home-page">
      <h1>Athion</h1>
      <p className="muted" style={{ opacity, transition: "opacity 0.4s" }}>{slogans[i]}</p>
    </div>
  );
}
