import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
const s3 = new AWS.S3();
export const smallSizeImage = async (imageData) => {
  const { height, width } = imageData;
  imageData.height = height / 20;
  imageData.width = width / 20;

  const name = uuid();
  const key = `${name}`;

  return await s3
    .putObject({
      Body: JSON.stringify(imageData),
      Key: key,
      ContentType: 'image/jpg',
      Bucket: process.env.imageUploadBucket,
      ACL: 'public-read',
    })
    .promise();
};
