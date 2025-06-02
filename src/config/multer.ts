// import multer from "multer";
// import path from "path";
// import crypto from "crypto";
// import fs from "fs";

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

import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// ❗ Prevent dangerous file types
const fileFilter = (_req: any, file: any, cb: any) => {
  const dangerousExtensions = [".exe", ".bat", ".sh", ".php", ".js", ".jar"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (dangerousExtensions.includes(ext)) {
    return cb(new Error("File type not allowed"), false);
  }

  cb(null, true);
};

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// ✅ Add limits and fileFilter
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size
    files: 20, // max 20 files
  },
  fileFilter,
});
