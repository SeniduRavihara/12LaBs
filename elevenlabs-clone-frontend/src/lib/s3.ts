import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function getPresignedUrl({ key }: { key: string }): Promise<string> {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return "#";
  }
  try {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Error generating presigned GET URL:", error);
    return "#";
  }
}

export async function getUploadUrl(
  fileType: string,
): Promise<{ uploadUrl: string; s3Key: string }> {
  const extension = fileType.split("/")[1] ?? "wav";
  const s3Key = `uploads/${randomUUID()}.${extension}`;

  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return { uploadUrl: "#", s3Key };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { uploadUrl, s3Key };
  } catch (error) {
    console.error("Error generating presigned PUT upload URL:", error);
    return { uploadUrl: "#", s3Key };
  }
}
