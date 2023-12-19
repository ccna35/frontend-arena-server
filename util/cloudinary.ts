import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

type UploadedImageType = { type: string; url: string };

export async function uploadMultipleImages(req: Request) {
  const files = req.files as Express.Multer.File[];

  const image_URLs: UploadedImageType[] = [];

  await Promise.all(
    files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI, {
        resource_type: "image",
        format: "webp",
      });
      image_URLs.push({ type: file.fieldname, url: res.secure_url });
    })
  );

  return image_URLs;
}
