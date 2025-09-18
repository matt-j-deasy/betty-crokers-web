// app/games/[id]/ui/ActionButton.tsx
"use client";

import React from "react";

type Props = {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  title?: string;
  children: React.ReactNode;
  variant?: "primary" | "success";
};

export default function ActionButton({
  onClick,
  disabled,
  busy,
  title,
  children,
  variant = "primary",
}: Props) {
  const base =
    "rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed";
  const palette =
    variant === "success"
      ? "bg-green-600 text-white hover:bg-green-500 disabled:bg-neutral-300 disabled:text-neutral-600"
      : "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-neutral-300 disabled:text-neutral-600";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={`${base} ${palette}`}
      title={title}
    >
      {busy ? "Working…" : children}
    </button>
  );
}
