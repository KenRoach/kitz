/** Business tool types and helpers. */

import { getSupabase } from "../../db/client.js";

export interface ProfileContext {
  id: string;
  phone: string;
  businessType: string | null;
  businessName: string | null;
  language: string;
  onboarded: boolean;
  onboardStep: string;
}

export async function resolveProfile(profileId: string): Promise<ProfileContext> {
  const db = getSupabase();
  const { data, error } = await db
    .from("kz_business_profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error || !data) throw new Error(`Profile not found: ${profileId}`);

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

export async function resolveProfileByPhone(phone: string): Promise<ProfileContext | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from("kz_business_profiles")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !data) return null;

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

export async function createProfile(phone: string): Promise<ProfileContext> {
  const db = getSupabase();
  const { data, error } = await db
    .from("kz_business_profiles")
    .insert({ phone })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to create profile: ${error?.message}`);

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
