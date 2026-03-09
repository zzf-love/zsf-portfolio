"use client";

interface StarRatingProps {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
}

export default function StarRating({ value, onChange, disabled }: StarRatingProps) {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {[0, 1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          title={star === 0 ? "隐藏（草稿）" : `${star}星`}
          style={{
            background: "none",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: star === 0 ? "12px" : "16px",
            color:
              star === 0
                ? value === 0
                  ? "#ff5050"
                  : "var(--text-muted)"
                : star <= value
                ? "#00ffaa"
                : "var(--border-hover)",
            padding: "2px",
            lineHeight: "1",
            transition: "color 0.15s ease",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {star === 0 ? "◎" : "★"}
        </button>
      ))}
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "10px",
          color: "var(--text-muted)",
          marginLeft: "4px",
        }}
      >
        {value === 0 ? "草稿" : `${value}星`}
      </span>
    </div>
  );
}
