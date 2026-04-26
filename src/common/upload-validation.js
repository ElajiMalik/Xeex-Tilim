import multer from 'multer';
import path from 'path';

const MIME_TYPES_AUTORISES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
]);

const EXTENSIONS_AUTORISEES = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.heic',
  '.mp4', '.mov',
  '.pdf',
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!MIME_TYPES_AUTORISES.has(file.mimetype)) {
      return cb(new Error(`Type non autorisé: ${file.mimetype}`));
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!EXTENSIONS_AUTORISEES.has(ext)) {
      return cb(new Error(`Extension non autorisée: ${ext}`));
    }

    cb(null, true);
  },
});

export const MEDIA_TYPE_BY_MIME = {
  'image/jpeg': 'PHOTO',
  'image/png': 'PHOTO',
  'image/webp': 'PHOTO',
  'image/heic': 'PHOTO',
  'video/mp4': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'application/pdf': 'DOCUMENT',
};
