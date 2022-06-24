import multer, { Field } from 'multer';

export const uploadBuffer = (fileInput: Field[], isImage = false) => {
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (isImage && !file.mimetype.startsWith('image')) cb(new Error('Invalid file format'));

    if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
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
