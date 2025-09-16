"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const PlayerInput = z.object({
  nickname: z.string().min(1, "Nickname is required").max(50),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type PlayerInput = z.infer<typeof PlayerInput>;

export default function AddPlayerForm() {
  const router = useRouter();
  const [values, setValues] = useState<PlayerInput>({
    nickname: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parse = PlayerInput.safeParse({
      nickname: values.nickname.trim(),
      firstName: values.firstName?.trim() || undefined,
      lastName: values.lastName?.trim() || undefined,
    });

    if (!parse.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of parse.error.issues) {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parse.data),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setServerError(text || `Create failed (${res.status})`);
        setSubmitting(false);
        return;
      }

      // Success: go back to list and refresh data
      router.push("/players");
      router.refresh();
    } catch (err: any) {
      setServerError(err?.message ?? "Network error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      {serverError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-900">
          {serverError}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="nickname">Nickname *</label>
        <input
          id="nickname"
          name="nickname"
          className="w-full border rounded-lg p-2"
          autoComplete="off"
          value={values.nickname}
          onChange={onChange}
          required
        />
        {errors.nickname && <p className="text-xs text-red-600">{errors.nickname}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            className="w-full border rounded-lg p-2"
            autoComplete="given-name"
            value={values.firstName}
            onChange={onChange}
          />
          {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            className="w-full border rounded-lg p-2"
            autoComplete="family-name"
            value={values.lastName}
            onChange={onChange}
          />
          {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-xl px-4 py-2 border bg-white hover:bg-neutral-50 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save Player"}
        </button>
        <button
          type="button"
          className="rounded-xl px-4 py-2 border"
          onClick={() => router.push("/players")}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
