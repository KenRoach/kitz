/** Incoming message handler — routes messages through onboarding or brain. */

import type { IncomingMessage } from "./types.js";
import type { ToolDef } from "../tools/registry.js";
import { resolveProfileByPhone, createProfile } from "../tools/business/types.js";
import { handleOnboardingStep } from "../onboarding/flow.js";
import { routeMessage } from "../brain/router.js";
import type { BaileysAdapter } from "./baileys.js";

export async function handleIncoming(
  msg: IncomingMessage,
  tools: ToolDef[],
  adapter: BaileysAdapter,
): Promise<void> {
  const phone = msg.from;

  try {
    // 1. Resolve or create profile
    let profile = await resolveProfileByPhone(phone);
    if (!profile) {
      profile = await createProfile(phone);
    }

    let responseText: string;

    // 2. Check if onboarding is needed
    if (!profile.onboarded) {
      const result = await handleOnboardingStep(msg.text, profile);
      responseText = result.response;

      // Re-fetch profile if onboarding updated it
      if (result.updatedProfile) {
        profile = result.updatedProfile;
      }
    } else {
      // 3. Route through brain
      const result = await routeMessage(msg.text, profile, tools);
      responseText = result.response;
    }

    // 4. Send response
    await adapter.send({
      channel: "whatsapp",
      to: phone,
      text: responseText,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[handler] Error processing message from ${phone}: ${errorMsg}`);

    // Try to send a friendly error response
    try {
      await adapter.send({
        channel: "whatsapp",
        to: phone,
        text: "Disculpa, tuve un problema procesando tu mensaje. Intenta de nuevo en un momento.",
      });
    } catch {
      console.error(`[handler] Failed to send error response to ${phone}`);
    }
  }
}
