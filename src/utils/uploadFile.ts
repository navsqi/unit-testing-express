import multer, { Field, FileFilterCallback } from 'multer';
import CustomError from './customError';

export const uploadBuffer = (fileInput: Field[], isImage = false) => {
  const storage = multer.memoryStorage();

  const fileFilter = (req, file: Express.Multer.File, cb) => {
    if (isImage && !file.mimetype.startsWith('image')) cb(new Error('Invalid file format'));

    if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf' || file.mimetype.includes('csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format'));
    }
  };

  // File size
  const uploadConfig = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 25621440, // 2621440 = 2,5 mb
    },
  });

  return uploadConfig.fields(fileInput);
};

export const uploadSingle = (table, fileInput, path) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      const imageFormat = file.mimetype.split('/')[1];
      const fileName = `${table}-${Date.now()}.${imageFormat}`;
      cb(null, fileName);
    },
  });

  const fileFilter = (req, file: Express.Multer.File, cb: FileFilterCallback) => {
    // File format
    if (file.mimetype.includes('csv')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const uploadConfig = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10000000,
    },
  });

  return (req, res, next) => {
    const upload = uploadConfig.single(fileInput);

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === 'LIMIT_FILE_SIZE') return next(new CustomError(`File too large`, 400));
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.send(err);
      }
      // Everything went fine.
      return next();
    });
  };
};
