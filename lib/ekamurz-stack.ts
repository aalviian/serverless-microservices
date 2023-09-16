import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MurzDatabase } from './database';
import { MurzMicroservices } from './microservice';
import { MurzApiGateway } from './api_gateway';
import { MurzEventBus } from './event_bus';
import { MurzQueue } from './queue';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EkamurzStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new MurzDatabase(this, 'Database');

    const microservices = new MurzMicroservices(this, 'Microservices', {
      courseTable: database.courseTable,
      cartTable: database.cartTable,
      orderTable: database.orderTable
    });

    const apigateway = new MurzApiGateway(this, 'ApiGateway', {
      courseMicroservice: microservices.courseMicroservice,
      cartMicroservice: microservices.cartMicroservice,
      orderMicroservice: microservices.orderMicroservice
    });

    const queue = new MurzQueue(this, 'Queue', {
      consumer: microservices.orderMicroservice
    });

    const eventbus = new MurzEventBus(this, 'EventBus', {
      publisherFunction: microservices.cartMicroservice,
      subscriberFunction: queue.orderQueue
      // subscriberFunction: microservices.orderMicroservice
    })
  }
}
