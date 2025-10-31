import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';

interface LambdaStackProps extends cdk.StackProps {
  environment: 'dev' | 'qa';
  lambdaRuntime?: string;
  lambdaHandler?: string;
}

export class LambdaFunctionUrlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { environment, lambdaRuntime = 'nodejs22.x', lambdaHandler = 'index.handler' } = props;

    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      roleName: `lambda-exec-role-${environment}-${this.stackName}`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject', 's3:ListBucket'],
        resources: ['*'],
      })
    );

    const lambdaCodePath = path.join(__dirname, '../../dist/lambda', environment);

    const myLambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      functionName: `Emerald-on-prem-presign-${environment}`,
      runtime: lambda.Runtime.of({
        name: lambdaRuntime,
        supportsInlineCode: false,
      }),
      handler: lambdaHandler,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      code: lambda.Code.fromAsset(lambdaCodePath),
    });

    const functionUrl = myLambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    myLambdaFunction.addPermission('LambdaPermissionInvokeFunctionUrl', {
      principal: new iam.AnyPrincipal(),
      action: 'lambda:InvokeFunctionUrl',
      functionUrlAuthType: lambda.FunctionUrlAuthType.NONE,
    });

    myLambdaFunction.addPermission('LambdaPermissionInvokeFunction', {
      principal: new iam.AnyPrincipal(),
      action: 'lambda:InvokeFunction',
      invokedViaFunctionUrl: true,
    });

    new cdk.CfnOutput(this, 'FunctionName', {
      value: myLambdaFunction.functionName,
      description: 'Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: functionUrl.url,
      description: 'Public Function URL for this Lambda',
    });
  }
}
