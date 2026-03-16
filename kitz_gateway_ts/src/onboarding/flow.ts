/** Onboarding state machine for new business owners. */

import type { ProfileContext } from "../tools/business/types.js";
import { getSupabase } from "../db/client.js";
import { getLlmRouter } from "../llm/router.js";
import { storeMessage } from "../brain/memory.js";

export interface OnboardingResult {
  response: string;
  updatedProfile?: ProfileContext;
}

const BUSINESS_TYPES = [
  "panaderia", "salon", "tienda", "electricista", "restaurante",
  "mecanico", "farmacia", "taller", "ferreteria", "cafeteria",
];

async function updateProfile(
  profileId: string,
  updates: Record<string, unknown>,
): Promise<ProfileContext> {
  const db = getSupabase();
  const { data, error } = await db
    .from("kz_business_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to update profile: ${error?.message}`);

  return {
    id: data.id,
    phone: data.phone,
    businessType: data.business_type,
    businessName: data.business_name,
    language: data.language,
    onboarded: data.onboarded,
    onboardStep: data.onboard_step,
  };
}

async function classifyBusinessType(text: string): Promise<string> {
  try {
    const router = getLlmRouter();
    const response = await router.route({
      messages: [
        {
          role: "system",
          content: `Clasifica el tipo de negocio del usuario. Responde SOLO con una palabra de esta lista: ${BUSINESS_TYPES.join(", ")}. Si no coincide exactamente, elige la más cercana. Si no puedes clasificar, responde "tienda".`,
        },
        { role: "user", content: text },
      ],
      maxTokens: 20,
    }, "classification");

    const classified = response.text.trim().toLowerCase();
    return BUSINESS_TYPES.includes(classified) ? classified : "tienda";
  } catch {
    return "tienda";
  }
}

export async function handleOnboardingStep(
  userMessage: string,
  profile: ProfileContext,
): Promise<OnboardingResult> {
  const step = profile.onboardStep;

  await storeMessage(profile.id, "user", userMessage);

  switch (step) {
    case "greeting": {
      const response =
        "¡Hola! 👋 Soy Kitz, tu asistente personal de negocios.\n\n" +
        "Estoy aquí para ayudarte a llevar el control de tu negocio: ventas, gastos, inventario, clientes y más.\n\n" +
        "Para empezar, cuéntame: ¿qué tipo de negocio tienes? (por ejemplo: panadería, salón, tienda, restaurante, taller...)";

      const updated = await updateProfile(profile.id, { onboard_step: "ask_type" });
      await storeMessage(profile.id, "assistant", response);
      return { response, updatedProfile: updated };
    }

    case "ask_type": {
      const businessType = await classifyBusinessType(userMessage);
      const response =
        `¡Genial! Un negocio de tipo *${businessType}*. 🏪\n\n` +
        "¿Cómo se llama tu negocio?";

      const updated = await updateProfile(profile.id, {
        business_type: businessType,
        onboard_step: "ask_name",
      });
      await storeMessage(profile.id, "assistant", response);
      return { response, updatedProfile: updated };
    }

    case "ask_name": {
      const businessName = userMessage.trim();
      const response =
        `Perfecto, *${businessName}* queda registrado. ✅\n\n` +
        "Ahora dime tu primera venta de hoy para que empieces a llevar el control. " +
        "Por ejemplo: \"Vendí 5 arepas a $2 cada una\"";

      const updated = await updateProfile(profile.id, {
        business_name: businessName,
        onboard_step: "first_capture",
      });
      await storeMessage(profile.id, "assistant", response);
      return { response, updatedProfile: updated };
    }

    case "first_capture": {
      // Try to parse the sale using LLM
      try {
        const router = getLlmRouter();
        const parseResponse = await router.route({
          messages: [
            {
              role: "system",
              content: 'Extrae los datos de venta del mensaje. Responde en JSON: {"description": "...", "amount": number}. Si no puedes extraer el monto, usa 0.',
            },
            { role: "user", content: userMessage },
          ],
          maxTokens: 100,
        }, "extraction");

        const jsonMatch = parseResponse.text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const saleData = JSON.parse(jsonMatch[0]) as { description: string; amount: number };

          const db = getSupabase();
          await db.from("kz_orders").insert({
            profile_id: profile.id,
            description: saleData.description || userMessage,
            amount: saleData.amount || 0,
            status: "completed",
          });
        }
      } catch {
        // If parsing fails, store raw text as order
        const db = getSupabase();
        await db.from("kz_orders").insert({
          profile_id: profile.id,
          description: userMessage,
          amount: 0,
          status: "completed",
        });
      }

      const response =
        "¡Primera venta registrada! 🎉\n\n" +
        "Tu negocio está listo en KitZ. Esto es lo que puedo hacer por ti:\n\n" +
        "📦 *Ventas* — \"Vendí 10 empanadas a $1.50\"\n" +
        "💰 *Gastos* — \"Gasté $50 en harina\"\n" +
        "📋 *Inventario* — \"Tengo 20 bolsas de harina\"\n" +
        "👥 *Clientes* — \"Agrega a María, tel 6700-1234\"\n" +
        "📊 *Reportes* — \"¿Cuánto vendí hoy?\"\n\n" +
        "Simplemente escríbeme como si le hablaras a un asistente. ¡Vamos! 💪";

      const updated = await updateProfile(profile.id, {
        onboard_step: "done",
        onboarded: true,
      });
      await storeMessage(profile.id, "assistant", response);
      return { response, updatedProfile: updated };
    }

    default: {
      // Already onboarded or unknown step — shouldn't reach here
      return { response: "¿En qué te puedo ayudar hoy?" };
    }
  }
}
