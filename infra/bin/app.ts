import * as cdk from 'aws-cdk-lib';
import { LambdaFunctionUrlStack } from '../lib/lambda-stack';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') || 'dev';

new LambdaFunctionUrlStack(app, `LambdaFunctionUrlStack-${environment}`, {
  environment: environment as 'dev' | 'qa',
  lambdaRuntime: 'nodejs22.x',
  lambdaHandler: 'index.handler',
});

app.synth();
