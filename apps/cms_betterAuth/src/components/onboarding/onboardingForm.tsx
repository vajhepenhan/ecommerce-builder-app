"use client";

import { useState } from "react";

export default function OnboardingForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      tenantName: form.get("tenantName"),
      domain: form.get("domain"),
      template: form.get("template"),
    };

    const res = await fetch("/api/admin/tenants/createWithTemplate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Failed to create tenant");
      setLoading(false);
      return;
    }

    // E3 redirect after success
    window.location.href = `/onboarding/success?tenant=${json.id}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="tenantName"
        placeholder="Store Name"
        required
        className="border p-2 w-full"
      />

      <input
        name="domain"
        placeholder="yourshop.example.com"
        required
        className="border p-2 w-full"
      />

      <select name="template" required className="border p-2 w-full">
        <option value="">Choose a Template</option>
        <option value="modern">Modern</option>
        <option value="minimal">Minimal</option>
        <option value="fashion">Fashion</option>
        <option value="electronics">Electronics</option>
      </select>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Provisioning Store…" : "Create Store"}
      </button>
    </form>
  );
}
