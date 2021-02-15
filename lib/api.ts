import { Construct } from '@aws-cdk/core';
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import { Function as LambdaFunction, Runtime, Code } from '@aws-cdk/aws-lambda';
import { LambdaRestApi } from '@aws-cdk/aws-apigateway';

export class ApiResources extends Construct {
    lambdaRole: Role;
    lambdaFunction: LambdaFunction;

    constructor(scope: Construct) {
        super(scope, 'API');
        this.createLambdaRole();
        this.createLambdaFunction();
        this.createApi();
    }

    createLambdaRole(): void {
        const policyStatements = [
            new PolicyStatement({
                actions: ['cloudwatch:*', 'logs:*'],
                resources: ['*'],
            }),
            new PolicyStatement({
                actions: ['ses:SendEmail'],
                resources: ['*'],
            }),
        ];

        this.lambdaRole = new Role(this, 'LambdaRole', {
            roleName: 'SendEmailLambdaRole',
            assumedBy: new ServicePrincipal('lambda'),
            inlinePolicies: {
                ConfigsPolicy: new PolicyDocument({
                    statements: policyStatements,
                }),
            },
        });
    }

    createLambdaFunction(): void {
        this.lambdaFunction = new LambdaFunction(this, 'LambdaFunction', {
            functionName: 'SendEmailLambda',
            role: this.lambdaRole,
            handler: 'src/handlers/sendEmail.handler',
            runtime: Runtime.NODEJS_12_X,
            code: Code.fromAsset('../carmen_api/dist/carmen_api.zip'),
        });
    }

    createApi(): void {
        const restApi = new LambdaRestApi(this, 'RestAPI', {
            handler: this.lambdaFunction,
            proxy: false,
            defaultCorsPreflightOptions: {
                allowOrigins: ['https://carmenleung.me'],
            },
        });

        const items = restApi.root.addResource('email');
        items.addMethod('POST');
    }
}
