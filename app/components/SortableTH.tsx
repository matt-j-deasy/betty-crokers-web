import Link from "next/link";

function SortableTH({
  href,
  label,
  active,
  dir,
  numeric,
}: {
  href: string;
  label: string;
  numeric?: boolean;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th className={numeric ? "text-right" : ""}>
      <Link
        href={href}
        className={`inline-flex items-center gap-1 hover:underline ${
          active ? "font-semibold text-black" : ""
        }`}
      >
        {label}
        {active ? (
          <span>{dir === "asc" ? "▲" : "▼"}</span>
        ) : (
          <span className="opacity-30">↕</span>
        )}
      </Link>
    </th>
  );
}

export default SortableTH;
