// import { Request, Response } from 'express';
// import httpStatus from 'http-status';
// import mime from 'mime-types';
// import path from 'path';
// import catchAsync from '../utils/catch-async';
// import uploadService from '../services/upload.service';

// const getUploadedFile = catchAsync(async (req: Request, res: Response): Promise<void> => {
//   const fileName = decodeURIComponent(req.params.fileName); // Decode encoded filenames

//   const doc = await uploadService.getDocumentByOriginalName(fileName);
//   if (!doc) {
//     res.status(httpStatus.NOT_FOUND).send({ message: 'File not found in database' });
//     return;
//   }

//   const fileStream = uploadService.getFileStream(doc.filePath);
//   if (!fileStream) {
//     res.status(httpStatus.NOT_FOUND).send({ message: 'File not found on disk' });
//     return;
//   }

//   // Determine MIME type
//   const mimeType = doc.mimeType || mime.lookup(doc.fileName) || 'application/octet-stream';

//   // Set Content-Type
//   res.setHeader('Content-Type', mimeType);

//   // Sanitize file name for content-disposition
//   const safeFileName = path.basename(doc.fileName).replace(/[\n\r]/g, '');

//   // Determine content disposition
//   const isInline = mimeType.startsWith('image/') || mimeType.startsWith('text/');
//   res.setHeader('Content-Disposition', `${isInline ? 'inline' : 'attachment'}; filename="${safeFileName}"`);

//   // Pipe the file stream to the response
//   fileStream.pipe(res);
// });

// export default {
//   getUploadedFile,
// };

import { Request, Response } from "express";
import httpStatus from "http-status";
import mime from "mime-types";
import path from "path";
import fs from "fs";
import catchAsync from "../utils/catch-async";
import uploadService from "../services/upload.service";

const getUploadedFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const fileName = decodeURIComponent(req.params.fileName);

    const doc = await uploadService.getDocumentByOriginalName(fileName);
    if (!doc) {
      res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "File not found in database" });
      return;
    }

    const absoluteFilePath = path.resolve(
      __dirname,
      "./uploads/documents",
      doc.filePath
    );

    if (!fs.existsSync(absoluteFilePath)) {
      console.error(`File not found at path: ${absoluteFilePath}`);
      res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "File not found on disk" });
      return;
    }

    const stat = fs.statSync(absoluteFilePath);
    const fileStream = fs.createReadStream(absoluteFilePath);
    const mimeType =
      doc.mimeType || mime.lookup(doc.fileName) || "application/octet-stream";

    const extension = path.extname(doc.fileName).toLowerCase();
    const forceDownloadTypes = [
      ".pdf",
      ".xlsx",
      ".xls",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
    ];
    const isInline = !forceDownloadTypes.includes(extension);
    const safeFileName = path.basename(doc.fileName).replace(/[\n\r]/g, "");

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-Disposition",
      `${isInline ? "inline" : "attachment"}; filename="${safeFileName}"`
    );

    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: "Error reading file stream" });
    });

    fileStream.pipe(res);
  }
);

export default {
  getUploadedFile,
};
