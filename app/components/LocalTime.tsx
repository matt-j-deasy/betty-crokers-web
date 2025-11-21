"use client";

export default function LocalTime({ iso }: { iso: string | null }) {
  if (!iso) return <>TBD</>;

  // Safari-safe normalization
  const fixed = iso.replace(/\.\d+Z$/, "Z");
  const d = new Date(fixed);

  return <>{d.toLocaleString()}</>;
}
