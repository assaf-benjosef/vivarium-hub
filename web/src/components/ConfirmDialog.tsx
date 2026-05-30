export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line2)",
          borderRadius: 18,
          padding: "24px",
          width: 380,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: "flex", gap: 9, justifyContent: "flex-end", marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              background: "var(--surface2)",
              color: "var(--mid)",
              padding: "9px 16px",
              fontSize: 13,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              border: "1px solid var(--line)",
              borderRadius: 11,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: "var(--red)",
              color: "#fff",
              padding: "9px 16px",
              fontSize: 13,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              border: "none",
              borderRadius: 11,
              cursor: "pointer",
            }}
          >
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
