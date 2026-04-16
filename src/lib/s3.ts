import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.SUPABASE_S3_REGION!,
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export const S3_BUCKET = process.env.SUPABASE_S3_BUCKET!;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export const ALLOWED_FILE_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/markdown": ".md",
  "application/json": ".json",
  "application/x-yaml": ".yaml",
  "text/yaml": ".yaml",
  "application/xml": ".xml",
  "text/xml": ".xml",
  "text/csv": ".csv",
  "application/toml": ".toml",
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB