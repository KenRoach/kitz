/** Voice transcriber — ElevenLabs integration stub. */

let _apiKey: string | null = null;

export function initTranscriber(apiKey: string): void {
  _apiKey = apiKey;
  console.log("[transcriber] Voice transcriber initialized");
}

export function getTranscriberKey(): string | null {
  return _apiKey;
}
