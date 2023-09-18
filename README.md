# Welcome to Ekamurz

This is a Ekamurz with Serverless Microservices.

![Architecture](https://raw.githubusercontent.com/aalviian/ekamurz/develop/Serverless%20Microservice.png)

The `cdk.json` file tells the CDK Toolkit how to execute your app.

### Run The Project
1. Clone this repository
2. At the root directory which include **cdk.json** files, run below command:
```csharp
npm install
cdk deploy
```
>Note: Make sure Docker Desktop is running before execute the cdk deploy command.

4. Wait for provision all microservices into aws cloud.

5. You can **launch microservices** as below urls:

* **Product API -> https://xxx.execute-api.us-east-2.amazonaws.com/prod/product**
* **Cart API -> https://xxx.execute-api.us-east-2.amazonaws.com/prod/cart**
* **Order API -> https://xxx.execute-api.aus-east-2.amazonaws.com/prod/order**

Existing API:
* **Course API -> https://97vipdpgvc.execute-api.us-east-2.amazonaws.com/prod/course**
* **Cart API -> https://h7ut0lwkb3.execute-api.us-east-2.amazonaws.com/prod/cart**
* **Order API -> https://r8rnci9ow0.execute-api.us-east-2.amazonaws.com/prod/order**

6. Signup & Login using Cognito Authentication
```csharp
https://ekamurz.auth.us-east-2.amazoncognito.com/login?client_id=3euuidrcvrkboct8b7ofqe7ss6&response_type=token&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fekamurz-app%2Fcallback
```

7. After successfully redirect, get access token and put it to header when calling the APIs.
`Authorization: <token>`

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
