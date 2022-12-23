import * as Minio from 'minio';
import logger from '~/utils/logger';

let minioSSL = !!Number(process.env.MINIO_SSL);
if (minioSSL) {
  minioSSL = true;
} else {
  minioSSL = false;
}
let minioClient: Minio.Client;

try {
  minioClient = new Minio.Client({
    endPoint: process.env.MINIO_SERVER,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: minioSSL,
    accessKey: process.env.MINIO_ID,
    secretKey: process.env.MINIO_KEY,
  });
} catch (error) {
  logger.error(error, 'MINIO_CLIENT');
  process.exit(1);
}

minioClient.setRequestOptions({ rejectUnauthorized: false });

export const minioInit = async () => {
  minioClient.getBucketPolicy(process.env.MINIO_BUCKET, (err, res) => {
    if (err) {
      logger.error('Error when connecting to minio service', 'MINIO_INIT');
      process.exit(1);
    }
    logger.info('MINIO_INIT', `Connection to minio ${process.env.MINIO_BUCKET} success`);
  });
};

const isBucketExist = (bucketName) => {
  return new Promise((resolve, reject) => {
    minioClient.bucketExists(bucketName, (err, exists) => {
      if (err) {
        logger.error(err.message, 'MINIO_ISBUCKETEXIST');

        reject(err);
      }
      resolve(exists ? true : false);
    });
  });
};
const bucketCreate = async (bucketName, region = 'us-east-1') => {
  try {
    const isExists = await isBucketExist(bucketName);
    if (isExists) {
      return true;
    }
    await minioClient.makeBucket(bucketName, region);
    return true;
  } catch (err) {
    logger.error(err.message, 'MINIO_BUCKETCREATE');
    return false;
  }
};
export const bucketRemove = async (bucketName) => {
  try {
    await minioClient.removeBucket(bucketName);
    return true;
  } catch (err) {
    logger.error(err.message, 'MINIO_BUCKETREMOVE');
    return false;
  }
};

export const objectUpload = async (
  bucketName: string,
  objectName: string,
  filePath: any,
  metaData: Minio.ItemBucketMetadata,
) => {
  try {
    const isUploaded = await minioClient.putObject(bucketName, objectName, filePath, metaData);

    return isUploaded;
  } catch (err) {
    logger.error(err.message, 'MINIO_OBJECTUPLOAD');
    return { err: true, data: null };
  }
};
export const objectDownload = async (bucketName, objectName, filePath) => {
  try {
    const isDownloaded = await minioClient.fGetObject(bucketName, objectName, filePath);
    return isDownloaded;
  } catch (err) {
    logger.error(err.message, 'MINIO_OBJECTDOWNLOAD');
    return { err: true, data: null };
  }
};
export const objectRemove = async (bucketName, objectName) => {
  try {
    await minioClient.removeObject(bucketName, objectName);
    return true;
  } catch (err) {
    logger.error(err.message, 'MINIO_OBJECTREMOVE');
    return false;
  }
};
export const objectGetUrl = async (bucketName, objectName, expiry = 86400) => {
  try {
    const getUrl = await minioClient.presignedGetObject(bucketName, objectName, expiry);
    return { err: false, data: getUrl };
  } catch (err) {
    logger.error(err.message, 'MINIO_OBJECTURL');
    return { err: true, data: null };
  }
};
export const minioPublicBucketConfig = async (bucketName) => {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          AWS: ['*'],
        },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
      {
        Effect: 'Deny',
        Principal: {
          AWS: ['*'],
        },
        Action: ['s3:GetBucketLocation', 's3:ListBucket'],
        Resource: [`arn:aws:s3:::${bucketName}`],
      },
    ],
  };
  minioClient.setBucketPolicy(bucketName, JSON.stringify(policy), (err) => {
    if (err) {
      logger.error(err.message, 'MINIO_BUCKETPOLICY');

      return;
    }
    logger.info('MINIO_BUCKETPOLICY', `Bucket '${bucketName}' policy set`);
  });
};
export const createPublicBucket = async (bucketName) => {
  const isExist = await isBucketExist(bucketName);
  if (!isExist) {
    const isCreated = await bucketCreate(bucketName);
    if (isCreated) {
      await minioPublicBucketConfig(bucketName);
    }
  }
};
