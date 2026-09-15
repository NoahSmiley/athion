import { BOM, CART_NOTE, OWNED_NETWORK } from "@/lib/rack/content";

export function Bom() {
  return (
    <section className="rack-section rack-purchases" id="rack-shopping">
      <div className="rack-eyebrow">Inventory and shopping list</div>
      <h2>Owned, in cart, and still needed</h2>
      <p className="rack-intro"><b>Already owned:</b> {OWNED_NETWORK.join(" · ")}. The patch panel is still blank.</p>
      <p className="rack-schematic-note">{CART_NOTE}</p>
      {(["In cart", "Still needed", "Optional / check"] as const).map((status) => <div key={status} className="rack-purchase-group">
        <h3>{status}</h3>
        <div className="rack-tw"><table>
          <thead><tr><th>Item</th><th>Qty</th><th>Purpose</th></tr></thead>
          <tbody>{BOM.filter((row) => row.status === status).map((row) => <tr key={row.item}>
            <td>{row.item}</td><td>{row.qty}</td><td>{row.purpose}</td>
          </tr>)}</tbody>
        </table></div>
      </div>)}
      <p className="rack-schematic-note">Your previously described HDMI, DisplayPort, USB-C and USB hub leads remain existing desk cables. The cart inventory covers the network upgrade. <a href="https://store.ui.com/us/en/collections/rackmount-keystone/products/uacc-keystone-coupler-c6" target="_blank" rel="noreferrer">Coupler details</a> · <a href="https://techspecs.ui.com/unifi/wifi/u7-pro-max" target="_blank" rel="noreferrer">AP specifications</a></p>
    </section>
  );
}
