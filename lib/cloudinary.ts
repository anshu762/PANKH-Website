import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  cloudinary.config({
    cloudinary_url: cloudinaryUrl,
  });
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Checks if Cloudinary credentials are fully configured.
 */
export function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes("xxxx")) {
    return true;
  }
  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes("xxxx") &&
    !apiKey.includes("xxxx")
  );
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

/**
 * Uploads a file buffer or base64 data string to Cloudinary.
 * Falls back safely if Cloudinary is not configured.
 */
export async function uploadImageToCloudinary(
  fileBufferOrBase64: Buffer | string,
  options: {
    folder?: string;
    filename?: string;
    resourceType?: "image" | "auto" | "raw";
  } = {}
): Promise<CloudinaryUploadResult | null> {
  const { folder = "pankh/poultry-photos", filename, resourceType = "image" } = options;

  if (!isCloudinaryConfigured()) {
    console.log(
      `[Pankh Cloudinary / Dev Mode] Cloudinary not configured in .env. Skipping remote upload to ${folder}.`
    );
    return null;
  }

  try {
    if (typeof fileBufferOrBase64 === "string") {
      // Direct upload of base64 data URL
      const result = await cloudinary.uploader.upload(fileBufferOrBase64, {
        folder,
        resource_type: resourceType,
        public_id: filename ? `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}` : undefined,
      });

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      };
    } else {
      // Upload from Buffer using upload_stream
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            public_id: filename ? `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}` : undefined,
          },
          (error, result) => {
            if (error || !result) {
              console.error("[Cloudinary Upload Error]:", error);
              return reject(error || new Error("Cloudinary upload failed"));
            }
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
            });
          }
        );
        uploadStream.end(fileBufferOrBase64);
      });
    }
  } catch (error) {
    console.error("[Cloudinary Upload Exception]:", error);
    return null;
  }
}

export default cloudinary;
