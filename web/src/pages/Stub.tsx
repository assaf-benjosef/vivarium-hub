import { Icon } from "../components/Icon";

export function StubPage({
  title,
  icon,
  description,
}: {
  title: string;
  icon: string;
  description: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Icon name={icon} size={30} color="var(--dim)" />
      <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 14, color: "var(--mid)" }}>{description}</div>
    </div>
  );
}
