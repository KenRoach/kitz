/** Environment configuration for KitZ(OS) gateway. */

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface Config {
  port: number;
  host: string;
  appUrl: string;
  databaseUrl: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  authEnabled: boolean;
  anthropicApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  defaultLlmProvider: string;
  resendApiKey: string;
  emailFrom: string;
  staticDir: string | null;
  whatsappSessionDir: string;
  elevenlabsApiKey: string;
  smtp: SmtpConfig;
}

function env(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export function loadConfig(): Config {
  const config: Config = {
    port: parseInt(env("PORT", "8787"), 10),
    host: env("HOST", "0.0.0.0"),
    appUrl: env("APP_URL", "https://www.renewflow.io"),
    databaseUrl: env("DATABASE_URL"),
    supabaseUrl: env("SUPABASE_URL"),
    supabaseServiceKey: env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SERVICE_KEY"),
    authEnabled: env("AUTH_ENABLED", "false") === "true",
    anthropicApiKey: env("ANTHROPIC_API_KEY"),
    openaiApiKey: env("OPENAI_API_KEY"),
    geminiApiKey: env("GEMINI_API_KEY"),
    defaultLlmProvider: env("DEFAULT_LLM_PROVIDER", "claude"),
    resendApiKey: env("RESEND_API_KEY"),
    emailFrom: env("EMAIL_FROM", "RenewFlow <noreply@renewflow.io>"),
    staticDir: env("STATIC_DIR") || null,
    whatsappSessionDir: env("WHATSAPP_SESSION_DIR", "./wa_sessions"),
    elevenlabsApiKey: env("ELEVENLABS_API_KEY"),
    smtp: {
      host: env("SMTP_HOST"),
      port: parseInt(env("SMTP_PORT", "587"), 10),
      user: env("SMTP_USER"),
      pass: env("SMTP_PASS"),
      from: env("SMTP_FROM"),
    },
  };

  if (!config.supabaseUrl) throw new Error("SUPABASE_URL environment variable is required");
  if (!config.supabaseServiceKey) throw new Error("SUPABASE_SERVICE_KEY environment variable is required");

  return config;
}
