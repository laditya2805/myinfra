import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

interface LambdaInfraStackProps extends cdk.StackProps {
  environment: string;
}

export class LambdaInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaInfraStackProps) {
    super(scope, id, props);

    const { environment } = props;
    
    const role = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonS3ReadOnlyAccess"
        ),
      ],
    });

    const lambdaFn = new lambda.Function(this, "MyLambdaFunction", {
      functionName: `Emerald-on-prem-presign-s3-${environment}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`
        exports.handler = async () => {
          return { statusCode: 200, body: "Hello from ${environment}!" };
        };
      `),

      role: role,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const functionUrl = new lambda.CfnUrl(this, "LambdaFunctionUrl", {
      authType: "NONE",
      targetFunctionArn: lambdaFn.functionArn,
    });

    // Permission 1: InvokeFunctionUrl with FunctionUrlAuthType condition
    new lambda.CfnPermission(this, "LambdaPermissionInvokeFunctionUrl", {
      functionName: lambdaFn.functionName,
      action: "lambda:InvokeFunctionUrl",
      principal: "*",
      functionUrlAuthType: "NONE",
    });

    // Permission 2: InvokeFunction with InvokedViaFunctionUrl condition
    new lambda.CfnPermission(this, "LambdaPermissionInvokeFunction", {
      functionName: lambdaFn.functionName,
      action: "lambda:InvokeFunction",
      principal: "*",
      invokedViaFunctionUrl: true,
    });
  }

}
 

