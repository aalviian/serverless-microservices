import { Duration } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { IQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface MurzQueueProps {
    consumer: IFunction;
}

export class MurzQueue extends Construct {

    public readonly orderQueue: IQueue;

    constructor(scope: Construct, id: string, props: MurzQueueProps) {
        super(scope, id);

        this.orderQueue = new Queue(this, 'EkamurzOrderQueue', {
            queueName: 'EkamurzOrderQueue',
            visibilityTimeout: Duration.seconds(30)
        });

        props.consumer.addEventSource(new SqsEventSource(this.orderQueue, {
            batchSize: 1
        }));
    }
}