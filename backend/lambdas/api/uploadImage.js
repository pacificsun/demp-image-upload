import Responses from '../utils/responses';
// import * as fileType from 'file-type';
import { v4 as uuid } from 'uuid';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

import { midSizeImage } from '../utils/midSizeImage';
import { smallSizeImage } from '../utils/smallSizeImage';

const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

export const handler = async (event) => {
  console.log('event>>', JSON.parse(event.body));
  try {
    const body = JSON.parse(event.body);

    if (!body) {
      return Responses._400({ message: 'incorrect body on request' });
    }

    let imageData = body;
    console.log('imageData>>', imageData);
    const mimmType = imageData.uri.split('.').pop();
    const detectedMime = `image/${mimmType}`;
    console.log('detectedMime>>', detectedMime);

    if (!allowedMimes.includes(detectedMime)) {
      return Responses._400({ message: 'mime is not allowed ' });
    }

    const name = uuid();
    const key = `${name}`;

    console.log(`writing image to bucket called ${key}`);

    await s3
      .putObject({
        Body: JSON.stringify(imageData),
        Key: key,
        ContentType: 'image/jpg',
        Bucket: process.env.imageUploadBucket,
        ACL: 'public-read',
      })
      .promise();

    midSizeImage(imageData);
    smallSizeImage(imageData);

    const url = `https://${process.env.imageUploadBucket}.s3-${process.env.region}.amazonaws.com/${key}`;
    return Responses._200({
      imageURL: url,
    });
  } catch (error) {
    console.log('error', error);

    return Responses._400({
      message: error.message || 'failed to upload image',
    });
  }
};
