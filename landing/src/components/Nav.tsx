import { Logo } from "./Logo";
import { Icon } from "./Icon";

export function Nav() {
  return (
    <div
      className="lp-nav"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 46px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      <Logo size={22} variant="glow" />
      <div
        className="lp-navlinks"
        style={{ display: "flex", alignItems: "center", gap: 30 }}
      >
        <a href="#how" className="nav-link">
          How it works
        </a>
        <a href="#features" className="nav-link">
          Architecture
        </a>
        <a
          href="#"
          className="nav-link"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon name="git" size={15} color="currentColor" /> GitHub
        </a>
        <button
          style={{
            background: "var(--life)",
            color: "#06231a",
            border: "none",
            padding: "9px 16px",
            fontSize: 13.5,
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            borderRadius: 11,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Join the waitlist
        </button>
      </div>
    </div>
  );
}
