import fs from "fs";
import path from "path";
import prisma from "../client";

interface Document {
  fileName: string;
  filePath: string;
  mimeType?: string;
}

const getDocumentByOriginalName = async (
  fileName: string
): Promise<Document | null> => {
  // Replace with actual Prisma query
  const document = await prisma.document.findFirst({
    where: {
      filePath: fileName,
    },
  });
  console.log("dfhadsjfhdsjj");
  console.log(fileName);
  console.log(document);
  if (!document) return null;

  return {
    fileName: document.fileName,
    filePath: document.filePath,
    // mimeType: document.mimeType // Make sure this field exists in your schema
  };
};

const getFileStream = (filePath: string) => {
  try {
    const fullPath = path.resolve(filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found at path: ${fullPath}`);
      return null;
    }

    return fs.createReadStream(fullPath);
  } catch (error) {
    console.error("Error creating read stream:", error);
    return null;
  }
};

export default {
  getDocumentByOriginalName,
  getFileStream,
};
