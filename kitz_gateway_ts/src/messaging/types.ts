/** Messaging types for multi-channel communication. */

export interface IncomingMessage {
  channel: "whatsapp" | "sms" | "web";
  from: string;         // phone number or user ID
  text: string;
  timestamp: number;
  mediaUrl?: string;
  mediaType?: string;
}

export interface OutboundMessage {
  channel: "whatsapp" | "sms" | "email";
  to: string;
  text: string;
  mediaUrl?: string;
}

export interface ChannelAdapter {
  name: string;
  send(message: OutboundMessage): Promise<void>;
  isConnected(): boolean;
}
