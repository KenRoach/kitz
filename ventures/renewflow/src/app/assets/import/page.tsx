"use client";

import { useState } from "react";
import Link from "next/link";

interface ParsedRow {
  brand: string;
  model: string;
  serial: string;
  warrantyEnd: string;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  const rows: ParsedRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Skip header row if present
    if (trimmed.toLowerCase().startsWith("brand")) continue;

    const parts = trimmed.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      rows.push({
        brand: parts[0],
        model: parts[1],
        serial: parts[2],
        warrantyEnd: parts[3] || "",
      });
    }
  }

  return rows;
}

export default function ImportAssetsPage() {
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handlePreview() {
    setError(null);
    setResult(null);
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      setError("No valid rows found. Expected format: brand,model,serial,warrantyEnd");
      return;
    }
    setParsed(rows);
  }

  async function handleImport() {
    if (!parsed || parsed.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      const res = await fetch("/api/assets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: parsed }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Import failed: ${body}`);
      }

      const data = await res.json();
      setResult(data);
      setParsed(null);
      setCsvText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Assets</h1>
        <Link
          href="/assets"
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Back to Assets
        </Link>
      </div>

      {result ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <p className="text-green-800 text-lg font-medium">
            Successfully imported {result.imported} assets.
          </p>
          <Link
            href="/assets"
            className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700"
          >
            View Assets
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste CSV data (brand,model,serial,warrantyEnd)
            </label>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setParsed(null);
              }}
              placeholder={`brand,model,serial,warrantyEnd\nHPE,DL380 Gen10,CZ12345678,2025-06-30\nDell,PowerEdge R740,ABCD1234,2025-09-15`}
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={handlePreview}
              disabled={!csvText.trim()}
              className="mt-3 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {parsed && parsed.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Preview: {parsed.length} rows
                </span>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {importing ? "Importing..." : "Import"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Brand
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Model
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Serial
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Warranty End
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsed.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.brand}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {row.model}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 font-mono">
                          {row.serial}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {row.warrantyEnd || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
