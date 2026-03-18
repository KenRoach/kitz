"use client";

import { useState } from "react";
import Link from "next/link";

const TOTAL_STEPS = 3;

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-lg p-8">
        {/* Step indicator */}
        <p className="text-sm text-gray-400 mb-6">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="flex gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Flow
            </h1>
            <p className="text-gray-500 mb-6">
              Let&apos;s set up your warranty renewal platform
            </p>
            <div className="mb-6">
              <label
                htmlFor="company-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company name
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full rounded-lg bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Import Assets */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Import Assets
            </h1>
            <p className="text-gray-500 mb-6">
              Import your hardware inventory to start tracking warranty renewals.
            </p>
            <Link
              href="/assets/import"
              className="block w-full text-center rounded-lg bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-700 transition-colors mb-3"
            >
              Import Hardware Inventory
            </Link>
            <button
              onClick={() => setStep(3)}
              className="w-full rounded-lg border border-gray-200 text-gray-600 py-2.5 font-medium hover:bg-gray-50 transition-colors"
            >
              I&apos;ll do this later
            </button>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You&apos;re all set!
            </h1>
            <p className="text-gray-500 mb-6">
              {companyName
                ? `${companyName} is ready to go.`
                : "Your platform is ready to go."}
            </p>
            <Link
              href="/"
              className="block w-full text-center rounded-lg bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
