import { HeadObjectCommandOutput } from "@aws-sdk/client-s3";

export class S3Object {
  readonly url: string;
  readonly metadata: any;

  constructor(url: string, metadata: any) {
    this.url = url;
    this.metadata = metadata;
  }
}