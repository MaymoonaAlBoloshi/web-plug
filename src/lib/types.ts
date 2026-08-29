export type Role = "admin" | "customer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId?: string;
  passwordHash: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  enabled: boolean;
  accessibilityEnabled?: boolean;
  createdAt: string;
  chatbot: ChatbotConfig;
  modelConfig?: ModelConfig;
  accessibility?: AccessibilityConfig;
}

export type AccessibilityTool = "textSize" | "contrast" | "grayscale" | "highlightLinks" | "readableFont" | "reducedMotion" | "lineHeight" | "textSpacing" | "largeCursor";

export interface AccessibilityConfig {
  title: string;
  titleAr: string;
  primaryColor: string;
  accentColor: string;
  position: "bottom-right" | "bottom-left";
  launcherIcon: "accessibility" | "eye" | "settings";
  tools: Record<AccessibilityTool, boolean>;
}

export interface ModelConfig {
  baseUrl: string;
  model: string;
  encryptedApiKey?: string;
  updatedAt: string;
}

export interface ChatbotConfig {
  name: string;
  nameAr?: string;
  welcomeMessage: string;
  welcomeMessageAr?: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  position: "bottom-right" | "bottom-left";
}

export interface KnowledgeSource {
  id: string;
  tenantId: string;
  type: "web" | "pdf";
  title: string;
  url: string;
  text: string;
  status: "processing" | "ready" | "failed";
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportRequest {
  id: string;
  tenantId: string;
  email: string;
  query: string;
  status: "open" | "resolved";
  createdAt: string;
}

export interface Database {
  users: User[];
  tenants: Tenant[];
  sources: KnowledgeSource[];
  supportRequests: SupportRequest[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId?: string;
}

export interface Citation {
  title: string;
  url: string;
  excerpt: string;
}
