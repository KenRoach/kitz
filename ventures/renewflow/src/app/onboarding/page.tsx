import { redirect } from "next/navigation";
import { ventures, assets } from "@/lib/services";
import type { Venture } from "@/types";
import OnboardingWizard from "./wizard-client";

export default async function OnboardingPage() {
  let hasAssets = false;

  try {
    const allVentures: Venture[] = await ventures.list();
    const flow = allVentures.find((v) => v.slug === "renewflow");
    if (flow) {
      try {
        const assetList = await assets.list(flow.id);
        hasAssets = assetList.length > 0;
      } catch {
        hasAssets = false;
      }
    }
  } catch {
    // If we can't reach the API, show the wizard anyway
    hasAssets = false;
  }

  if (hasAssets) {
    redirect("/");
  }

  return <OnboardingWizard />;
}
