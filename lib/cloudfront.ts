import { Construct } from '@aws-cdk/core';
import { HostedZone, IHostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import {
    CloudFrontWebDistribution,
    OriginProtocolPolicy,
    SecurityPolicyProtocol,
    SSLMethod,
    ViewerCertificate,
} from '@aws-cdk/aws-cloudfront';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { ARecord } from '@aws-cdk/aws-route53';
import { S3Resources } from './s3';
import { DOMAIN_NAME } from './constants';

export class CloudfrontResources extends Construct {
    hostedZone: IHostedZone;
    distribution: CloudFrontWebDistribution;
    certificate: DnsValidatedCertificate;

    constructor(scope: Construct) {
        super(scope, 'Cloudfront');
        this.createCertificate();
        this.createDistribution();
        this.createDeployment();
        this.createAliasRecord();
    }

    createCertificate(): void {
        this.hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
            domainName: DOMAIN_NAME,
        });

        this.certificate = new DnsValidatedCertificate(this, 'Certificate', {
            domainName: DOMAIN_NAME,
            hostedZone: this.hostedZone,
            region: 'us-east-1',
        });
    }

    createDistribution(): void {
        this.distribution = new CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [
                {
                    customOriginSource: {
                        domainName: S3Resources.websiteBucket.bucketWebsiteDomainName,
                        originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
            viewerCertificate: ViewerCertificate.fromAcmCertificate(this.certificate, {
                sslMethod: SSLMethod.SNI,
                securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2019,
                aliases: [DOMAIN_NAME],
            }),
        });
    }

    createDeployment(): void {
        new BucketDeployment(this, 'WebsiteAssetsDeployment', {
            sources: [Source.asset('../carmen/build')],
            destinationBucket: S3Resources.websiteBucket,
            distribution: this.distribution,
            distributionPaths: ['/*'],
        });
    }

    createAliasRecord(): void {
        new ARecord(this, 'Alias', {
            recordName: DOMAIN_NAME,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
            zone: this.hostedZone,
        });
    }
}
