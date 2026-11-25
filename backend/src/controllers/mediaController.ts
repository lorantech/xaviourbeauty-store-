import type { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { MediaAsset, MediaAssetType } from "../models/MediaAsset";

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const mediaFolder = "xaviourbeautystore/media";

const getFiles = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

const getResourceType = (file: Express.Multer.File): MediaAssetType =>
  file.mimetype.startsWith("video/") ? "video" : "image";

const uploadToCloudinary = (file: Express.Multer.File): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: mediaFolder, resource_type: "auto" },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error || new Error("Cloudinary returned an incomplete upload result."));
          return;
        }
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

const rollbackMediaUpload = async (
  uploaded: { result: UploadApiResponse; type: MediaAssetType }[],
  saved: InstanceType<typeof MediaAsset>[]
) => {
  const cleanupResults = await Promise.allSettled([
    ...saved.map((asset) => asset.deleteOne()),
    ...uploaded.map(({ result, type }) =>
      cloudinary.uploader.destroy(result.public_id, {
        resource_type: type,
      })
    ),
  ]);
  if (cleanupResults.some((result) => result.status === "rejected")) {
    console.error("Media upload rollback failed for one or more resources.");
  }
};

export const uploadMedia = async (req: AuthRequest, res: Response) => {
  const files = getFiles(req);
  if (files.length === 0) throw new AppError('No files received. Upload files using the "files" field.', 400);
  if (files.some((file) => file.mimetype.startsWith("image/") && file.size > IMAGE_MAX_SIZE)) {
    throw new AppError("Images must be 5 MB or smaller.", 413);
  }

  const uploaded: { result: UploadApiResponse; type: MediaAssetType }[] = [];
  const saved: InstanceType<typeof MediaAsset>[] = [];

  try {
    for (const file of files) {
      const result = await uploadToCloudinary(file);
      const type = getResourceType(file);
      uploaded.push({ result, type });
      if (result.resource_type !== type) {
        throw new Error("Cloudinary returned a different resource type than the uploaded file.");
      }
    }

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const { result: cloudinaryAsset, type } = uploaded[index];
      const asset = new MediaAsset({
        url: cloudinaryAsset.secure_url,
        publicId: cloudinaryAsset.public_id,
        filename: file.originalname,
        type,
        size: cloudinaryAsset.bytes,
        uploadedBy: req.user._id,
      });
      await asset.save();
      saved.push(asset);
    }
  } catch {
    await rollbackMediaUpload(uploaded, saved);
    throw new AppError("Media upload failed. Please try again.", 502);
  }

  res.status(201).json({ media: saved });
};

export const listMedia = async (req: Request, res: Response) => {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const requestedLimit =
    req.query.limit === undefined ? DEFAULT_PAGE_SIZE : Number(req.query.limit);
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new AppError("Page must be a positive whole number.", 400);
  }
  if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    throw new AppError("Limit must be a positive whole number.", 400);
  }

  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  const filter: { type?: MediaAssetType } = {};
  if (req.query.type !== undefined) {
    const type = req.query.type;
    if (typeof type !== "string" || !["image", "video", "raw"].includes(type)) {
      throw new AppError("Type must be image, video, or raw.", 400);
    }
    filter.type = type as MediaAssetType;
  }

  const [media, total] = await Promise.all([
    MediaAsset.find(filter)
      .sort({ uploadedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    MediaAsset.countDocuments(filter),
  ]);

  res.json({ media, page, limit, total, pages: Math.ceil(total / limit) });
};

export const deleteMedia = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid media asset ID.", 400);

  const asset = await MediaAsset.findById(id);
  if (!asset) throw new AppError("Media asset not found.", 404);

  let result: { result?: string };
  try {
    result = await cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.type,
    });
  } catch {
    throw new AppError("Could not delete this file from media storage. Please try again.", 502);
  }

  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError("Could not delete this file from media storage. Please try again.", 502);
  }

  await asset.deleteOne();
  res.json({ message: "Media asset deleted." });
};
