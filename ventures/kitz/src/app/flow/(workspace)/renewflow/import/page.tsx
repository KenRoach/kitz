"use client";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Assets</h1>
        <p className="text-gray-500">Upload your hardware asset inventory</p>
      </div>
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p className="mt-4 text-sm font-semibold text-gray-700">Drop a CSV or Excel file here</p>
        <p className="mt-1 text-xs text-gray-500">or click to browse — columns: Device, S/N, Client, Purchase Date, Warranty End</p>
        <button className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
          Browse Files
        </button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-700">Recent Imports</p>
        <p className="mt-2 text-xs text-gray-400">No imports yet</p>
      </div>
    </div>
  );
}
