/** Environment configuration for RenewFlow gateway. */

export interface Config {
  port: number;
  host: string;
  appUrl: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  authEnabled: boolean;
  anthropicApiKey: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  staticDir: string | null;
}

function env(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export function loadConfig(): Config {
  const config: Config = {
    port: parseInt(env("PORT", "8787"), 10),
    host: env("HOST", "0.0.0.0"),
    appUrl: env("APP_URL", "https://renewflow.io"),
    supabaseUrl: env("SUPABASE_URL"),
    supabaseServiceKey: env("SUPABASE_SERVICE_KEY"),
    authEnabled: env("AUTH_ENABLED", "false") === "true",
    anthropicApiKey: env("ANTHROPIC_API_KEY"),
    smtp: {
      host: env("SMTP_HOST"),
      port: parseInt(env("SMTP_PORT", "587"), 10),
      user: env("SMTP_USER"),
      pass: env("SMTP_PASS"),
      from: env("SMTP_FROM", "noreply@renewflow.io"),
    },
    staticDir: env("STATIC_DIR") || null,
  };

  if (!config.supabaseUrl) throw new Error("SUPABASE_URL environment variable is required");
  if (!config.supabaseServiceKey) throw new Error("SUPABASE_SERVICE_KEY environment variable is required");

  return config;
}
