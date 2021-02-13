import { Construct, Stack } from '@aws-cdk/core';
import { CloudfrontResources } from './cloudfront';
import { S3Resources } from './s3';

export class Infrastructure extends Stack {
    constructor(scope: Construct, id: string) {
        super(scope, id, { env: { region: 'us-east-1', account: '495327713453' } });

        new S3Resources(this);
        new CloudfrontResources(this);
    }
}
