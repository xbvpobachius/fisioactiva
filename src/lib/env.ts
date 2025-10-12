// Environment configuration
export const env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:9002",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "fisioactiva-secret-key-2025-production",
} as const;
