import { env } from "@/common/utils/envConfig";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  paginateListObjectsV2,
  GetObjectCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { createInterface } from "node:readline/promises";
import fs from "node:fs";
import path from "node:path";
import { StatusCodes } from "http-status-codes";

// a client can be shared by different commands.
const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_KEY,
  },
});

const bucketName = `synhya`;
const cloudfrontDomain = `d1u2ai9ytjvk88.cloudfront.net`;

const generateSignedUrl = (filePath: string, expireTimeInSeconds: number) => {
  const signedUrl = getSignedUrl({
    url: `https://${cloudfrontDomain}/${filePath}`, // CloudFront URL
    keyPairId: env.AWS_CLOUDFRONT_KEY_ID,
    privateKey: "/cloudfront_private.pem",
    dateLessThan: new Date(
      Date.now() + expireTimeInSeconds * 1000
    ).toISOString(),
  });

  return signedUrl;
};

export const uploadFileToBucket = async (filePath: string) => {
  try {
    const fileContent = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    const folderNames = path.dirname(filePath).split(path.sep);
    const folderName = folderNames[folderNames.length - 1];

    const s3ObjectKey = `live/${folderName}/${fileName}`;
    // Upload the file to the Amazon S3 bucket.
    const uploadParams = {
      Bucket: bucketName,
      Key: s3ObjectKey,
      Body: fileContent,
    };

    const res = await s3Client.send(new PutObjectCommand(uploadParams));

    // HTTP 상태 코드가 2xx 범위에 있는지 확인
    if (!res.$metadata.httpStatusCode || res.$metadata.httpStatusCode < 200 || res.$metadata.httpStatusCode >= 300) {
      throw new Error(`Failed to upload file. HTTP Status: ${res.$metadata.httpStatusCode}`);
    }

    const url = generateSignedUrl(s3ObjectKey, 60);

    return url;
  } catch (err) {
    console.error(err);
  }
};

export const deleteBucket = async (bucketName: string) => {
  // Confirm resource deletion.
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const result = await prompt.question("Empty and delete bucket? (y/n) ");
  prompt.close();

  if (result === "y") {
    // Create an async iterator over lists of objects in a bucket.
    const paginator = paginateListObjectsV2(
      { client: s3Client },
      { Bucket: bucketName }
    );
    for await (const page of paginator) {
      const objects = page.Contents;
      if (objects) {
        // For every object in each page, delete it.
        for (const object of objects) {
          await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key })
          );
        }
      }
    }

    // Once all the objects are gone, the bucket can be deleted.
    await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
  }
};
