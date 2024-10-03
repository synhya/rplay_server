import { env } from "@/common/utils/envConfig";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  paginateListObjectsV2,
  GetObjectCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";
import { createInterface } from "node:readline/promises";
import fs from "node:fs";
import path from "node:path";

// a client can be shared by different commands.
const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_KEY,
  },
});

export const uploadFileToBucket = async (filePath: string) => {
  const fileContent = fs.createReadStream(filePath);
  const fileName = path.basename(filePath);
  const folderNames = path.dirname(filePath).split(path.sep);
  const folderName = folderNames[folderNames.length - 1];
  // Create an Amazon S3 bucket. The epoch timestamp is appended
  // to the name to make it unique.
  const bucketName = `synhya`;

  // Upload the file to the Amazon S3 bucket.
  const uploadParams = {
    Bucket: bucketName,
    Key: `live/${folderName}/${fileName}`,
    Body: fileContent,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
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
