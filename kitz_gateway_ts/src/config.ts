/** Environment configuration for RenewFlow gateway. */

export interface Config {
  port: number;
  host: string;
  appUrl: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  authEnabled: boolean;
  anthropicApiKey: string;
  resendApiKey: string;
  emailFrom: string;
  staticDir: string | null;
}

function env(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export function loadConfig(): Config {
  const config: Config = {
    port: parseInt(env("PORT", "8787"), 10),
    host: env("HOST", "0.0.0.0"),
    appUrl: env("APP_URL", "https://www.renewflow.io"),
    supabaseUrl: env("SUPABASE_URL"),
    supabaseServiceKey: env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SERVICE_KEY"),
    authEnabled: env("AUTH_ENABLED", "false") === "true",
    anthropicApiKey: env("ANTHROPIC_API_KEY"),
    resendApiKey: env("RESEND_API_KEY"),
    emailFrom: env("EMAIL_FROM", "RenewFlow <noreply@renewflow.io>"),
    staticDir: env("STATIC_DIR") || null,
  };

  if (!config.supabaseUrl) throw new Error("SUPABASE_URL environment variable is required");
  if (!config.supabaseServiceKey) throw new Error("SUPABASE_SERVICE_KEY environment variable is required");

  return config;
}
