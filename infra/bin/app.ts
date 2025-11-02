#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LambdaInfraStack } from "../lib/lambda-stack";
const app = new cdk.App();
const envParam = app.node.tryGetContext("environment") || "dev";
new LambdaInfraStack(app, `EmeraldOnPremStack-${envParam}`, {
 env: { region: "ap-south-1" },
 environment: envParam,
});

