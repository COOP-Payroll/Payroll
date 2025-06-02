// import multer from "multer";
// import path from "path";
// import crypto from "crypto";
// import fs from "fs";
// console.log("come here");
// const fileFilter = (_req: any, file: any, cb: any) => {
//   // Reject files that might be executable
//   const dangerousExtensions = [".exe", ".bat", ".sh", ".php", ".js", ".jar"];
//   const ext = path.extname(file.originalname).toLowerCase();

//   if (dangerousExtensions.includes(ext)) {
//     return cb(new Error("File type not allowed"), false);
//   }

//   cb(null, true);
// };

// // Ensure the upload directory exists
// const uploadDir = path.join(__dirname, "..", "uploads", "documents");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, uploadDir);
//   },

//   // filename: (_req, file, cb) => {
//   //   const ext = path.extname(file.originalname);
//   //   const uniqueName = crypto.randomBytes(16).toString("hex") + ext;
//   //   cb(null, uniqueName);
//   // },
//   filename: function (req, file, cb) {

//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname +
//         "-" +
//         uniqueSuffix +
//         "." +
//         file.originalname.split(".").pop()
//     );
//   },
// });

// export const upload = multer({ storage });

import multer, { FileFilterCallback } from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { Request } from "express";
console.error(">> ❌ No write access to upload directoryddjddjdh:");
// Define dangerous file extensions to block
const dangerousExtensions = [".exe", ".bat", ".sh", ".php", ".js", ".jar"];

// Upload directory path
const uploadDir = path.join(__dirname, "..", "uploads", "documents");

// Ensure upload directory exists and is writable
if (!fs.existsSync(uploadDir)) {
  console.log(">> Creating upload directory:", uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log(">> Upload directory exists:", uploadDir);
}

fs.access(uploadDir, fs.constants.W_OK, (err) => {
  if (err) {
    console.error(">> ❌ No write access to upload directory:", err);
  } else {
    console.log(">> ✅ Upload directory is writable.");
  }
});

// Filter to block dangerous file types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  console.log(">> Checking file type:", file.originalname);

  if (dangerousExtensions.includes(ext)) {
    console.warn(">> ❌ File blocked due to dangerous extension:", ext);
    // return cb(new Error("File type not allowed"), false);
  }

  cb(null, true);
};

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    console.log(">> Setting upload destination:", uploadDir);
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = crypto.randomBytes(16).toString("hex") + ext;
    console.log(">> Saving file:", uniqueName);
    cb(null, uniqueName);
  },
});

// Export the configured multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// import multer, { FileFilterCallback } from "multer";
// import path from "path";
// import fs from "fs";
// import { Request } from "express";

// // Type for the file with our custom properties
// type FileWithExtension = Express.Multer.File & {
//   originalExtension?: string;
//   allowed?: boolean;
// };

// // Reject dangerous file types
// const fileFilter = (
//   _req: Request,
//   file: FileWithExtension,
//   cb: FileFilterCallback
// ) => {
//   const dangerousExtensions = [
//     ".exe",
//     ".bat",
//     ".sh",
//     ".php",
//     ".js",
//     ".jar",
//     ".bin",
//   ];
//   const ext = path.extname(file.originalname).toLowerCase();
//   file.originalExtension = ext;
//   file.allowed = !dangerousExtensions.includes(ext);

//   if (!file.allowed) {
//     console.warn(`Rejected potentially dangerous file: ${file.originalname}`);
//     return cb(new Error(`File type "${ext}" is not allowed`));
//   }

//   cb(null, true);
// };

// // Configure upload directory
// const getUploadDir = () => {
//   const uploadDir = path.join(__dirname, "..", "uploads", "documents");

//   try {
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//       console.log(`Created upload directory at: ${uploadDir}`);
//     }
//     return uploadDir;
//   } catch (err) {
//     console.error(`Failed to create upload directory: ${err}`);
//     throw new Error("Failed to initialize upload directory");
//   }
// };

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     try {
//       const uploadDir = getUploadDir();
//       cb(null, uploadDir);
//     } catch (err) {
//       cb(err as Error, "");
//     }
//   },
//   filename: (req, file: FileWithExtension, cb) => {
//     try {
//       const ext = file.originalExtension || path.extname(file.originalname);
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "");
//       const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;

//       console.log(`Saving file: ${filename}`);
//       cb(null, filename);
//     } catch (err) {
//       console.error(`Error generating filename: ${err}`);
//       cb(err as Error, "");
//     }
//   },
// });

// // Configure Multer instance
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//     files: 5, // Maximum 5 files
//   },
// });

// // Export configured upload methods
// export const uploadSingle = (fieldName: string) => upload.single(fieldName);
// export const uploadArray = (fieldName: string, maxCount?: number) =>
//   upload.array(fieldName, maxCount);
// export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

// // For backward compatibility
// export { upload };
// import multer from "multer";
// import path from "path";
// import crypto from "crypto";
// import fs from "fs";

// // ❗ Prevent dangerous file types
// const fileFilter = (_req: any, file: any, cb: any) => {
//   const dangerousExtensions = [".exe", ".bat", ".sh", ".php", ".js", ".jar"];
//   const ext = path.extname(file.originalname).toLowerCase();

//   if (dangerousExtensions.includes(ext)) {
//     return cb(new Error("File type not allowed"), false);
//   }

//   cb(null, true);
// };

// // Ensure upload directory exists
// const uploadDir = path.join(__dirname, "..", "uploads", "documents");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

// // ✅ Add limits and fileFilter
// export const upload = multer({
//   storage,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50 MB max file size
//     files: 20, // max 20 files
//   },
//   fileFilter,
// });
