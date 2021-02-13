import { Construct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { DOMAIN_NAME } from './constants';

export class S3Resources extends Construct {
    static websiteBucket: Bucket;

    constructor(scope: Construct) {
        super(scope, 'S3');

        S3Resources.websiteBucket = new Bucket(this, 'WebsiteAssetsBucket', {
            bucketName: DOMAIN_NAME,
            publicReadAccess: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html',
        });
    }
}
