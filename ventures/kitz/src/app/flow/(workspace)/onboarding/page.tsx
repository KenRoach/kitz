"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";
import { invokeTool } from "@/lib/gateway";

interface ParsedAsset {
  serial: string;
  model: string;
  brand: string;
  warranty_end: string;
  device_type: string;
}

export default function OnboardingPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Step 1
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");

  // Step 2
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importCount, setImportCount] = useState<number | null>(null);

  function parseCSV(text: string): ParsedAsset[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const required = ["serial", "model", "brand", "warranty_end", "device_type"];
    for (const col of required) {
      if (!header.includes(col)) throw new Error(`Missing required column: ${col}`);
    }
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      header.forEach((h, i) => {
        row[h] = values[i] ?? "";
      });
      return row as unknown as ParsedAsset;
    });
  }

  async function handleImport(file: File) {
    if (!token) return;
    setImporting(true);
    setImportError(null);
    try {
      const text = await file.text();
      const assets = parseCSV(text);
      await invokeTool("add_assets", { assets }, token);
      setImportCount(assets.length);
      setStep(3);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-12">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-12 rounded-full ${s <= step ? "bg-purple-600" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {/* Step 1: Company Info */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Tell us about your company</h2>

          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select industry...</option>
              <option value="it-reseller-var">IT Reseller / VAR</option>
              <option value="msp">MSP</option>
              <option value="distributor">Distributor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
              Company size
            </label>
            <select
              id="companySize"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select size...</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="200+">200+</option>
            </select>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!industry || !companySize}
            className="w-full rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Import Devices */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Import your devices</h2>
          <p className="text-sm text-gray-600">
            Upload a CSV with columns:{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
              serial, model, brand, warranty_end, device_type
            </code>
          </p>

          <input
            type="file"
            accept=".csv"
            disabled={importing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-100"
          />

          {importing && (
            <p className="text-sm text-purple-600 font-medium">Importing...</p>
          )}

          {importError && (
            <p className="text-sm text-red-600">{importError}</p>
          )}

          <button
            onClick={() => setStep(3)}
            disabled={importing}
            className="w-full rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 3 && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">You&apos;re all set!</h2>
          {importCount !== null && (
            <p className="text-gray-600">
              Successfully imported <span className="font-semibold">{importCount}</span> device
              {importCount !== 1 ? "s" : ""}.
            </p>
          )}
          <button
            onClick={() => router.push("/flow/dashboard")}
            className="w-full rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
