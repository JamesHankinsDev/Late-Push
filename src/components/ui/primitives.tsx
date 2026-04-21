import { ButtonHTMLAttributes, ReactNode } from "react";

export type Tone = "default" | "coral" | "mint" | "plain";

export function Eyebrow({
  tone = "default",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <span className={`eyebrow ${tone === "default" ? "" : tone}`}>{children}</span>;
}

export type TagTone = "default" | "yellow" | "mint" | "coral" | "violet" | "outline";

export function Tag({
  tone = "default",
  children,
}: {
  tone?: TagTone;
  children: ReactNode;
}) {
  return <span className={`tag ${tone === "default" ? "" : tone}`}>{children}</span>;
}

export function Bar({ value, tall }: { value: number; tall?: boolean }) {
  return (
    <div className={`bar ${tall ? "tall" : ""}`}>
      <div
        className="fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export type ButtonVariant = "default" | "primary" | "coral" | "mint" | "ghost";
export type ButtonSize = "default" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const variantCls = variant === "default" ? "" : `btn-${variant}`;
  const sizeCls = size === "default" ? "" : `btn-${size}`;
  return (
    <button
      className={`btn ${variantCls} ${sizeCls} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export function DifficultyMeter({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <span className="diff">
      {Array.from({ length: max }).map((_, i) => (
        <i key={i} className={i < value ? "on" : ""} />
      ))}
    </span>
  );
}

export function Avatar({
  size = 40,
  color = "var(--hazard)",
  initials,
  ring = false,
}: {
  size?: number;
  color?: string;
  initials: string;
  ring?: boolean;
}) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--hammer)",
        fontSize: size * 0.4,
        color: "var(--ink)",
        flexShrink: 0,
        boxShadow: ring ? `0 0 0 3px var(--ink), 0 0 0 5px ${color}` : "none",
      }}
    >
      {initials}
    </div>
  );
}

export function HazardTape({ thin }: { thin?: boolean }) {
  return <div className={thin ? "hazard-tape-thin" : "hazard-tape"} />;
}

import type { TrickStatus } from "@/lib/types";

const STATUS_PILL_MAP: Record<TrickStatus, [string, Tone]> = {
  locked: ["LOCKED", "plain"],
  not_started: ["OPEN", "plain"],
  practicing: ["GRINDING", "coral"],
  landed_once: ["LANDED", "mint"],
  consistent: ["CONSISTENT", "mint"],
  mastered: ["MASTERED", "default"],
};

export function StatusPill({ status }: { status: TrickStatus }) {
  const [label, tone] = STATUS_PILL_MAP[status] ?? ["", "plain"];
  return <Eyebrow tone={tone}>{label}</Eyebrow>;
}
