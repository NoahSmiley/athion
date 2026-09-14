import { PORT_ASSIGNMENTS, PORT_INTRO } from "@/lib/rack/content";

/** USW Pro Max 24 PoE front port map. Ports 1-8 are 2.5 GbE PoE++, 9-24 are 1 GbE PoE+, 25-26 are 10G SFP+. */
export function PortMap() {
  const ports = Array.from({ length: 24 }, (_, i) => i + 1);
  return (
    <section className="rack-section">
      <div className="rack-eyebrow">usw pro max 24 poe · front port map</div>
      <h2>Switch port assignment</h2>
      <p className="rack-intro">{PORT_INTRO}</p>
      <div className="rack-portmap">
        {ports.map((i) => {
          const used = PORT_ASSIGNMENTS[i];
          return (
            <div key={i} className={`pt ${i <= 8 ? "u25" : "u1"}${used ? " used" : ""}`}>
              <b>{i}</b>
              {used ?? (i <= 8 ? "2.5G spare" : "1G spare")}
            </div>
          );
        })}
        <div className="pt sfp">
          <b>25</b>spare
        </div>
        <div className="pt sfp used">
          <b>26</b>UDM DAC
        </div>
      </div>
    </section>
  );
}
