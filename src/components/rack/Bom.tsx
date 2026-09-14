import { BOM } from "@/lib/rack/content";

export function Bom() {
  return (
    <section className="rack-section">
      <div className="rack-eyebrow">bill of materials</div>
      <h2>What to buy beyond the boxes you have</h2>
      <div className="rack-tw">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {BOM.map((r, i) => (
              <tr key={i}>
                <td dangerouslySetInnerHTML={{ __html: r.item }} />
                <td>{r.qty}</td>
                <td>{r.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
