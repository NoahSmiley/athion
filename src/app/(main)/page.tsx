const services = [
  {
    name: "Minecraft",
    href: "https://minecraft.athion.me",
    description: "Fabric 1.21.1 server and Cold Brew development.",
    state: "active",
  },
  {
    name: "Prime",
    href: "https://prime.athion.me",
    description: "Private streaming for invited accounts.",
    state: "private",
  },
  {
    name: "Status",
    href: "https://status.athion.me",
    description: "Current availability for public Athion services.",
    state: "live",
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <h1>Athion</h1>
      <p className="muted">Active projects and services.</p>

      <table className="home-directory" aria-label="Active Athion services">
        <tbody>
          {services.map((service) => (
            <tr key={service.name}>
              <td>
                <a href={service.href}>{service.name}</a>
              </td>
              <td>{service.description}</td>
              <td className="muted">{service.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
