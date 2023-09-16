import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction, SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface MurzEventBusProps {
    publisherFunction: IFunction;
    // subscriberFunction: IFunction;
    subscriberFunction: IQueue;
}

export class MurzEventBus extends Construct {
    constructor(scope: Construct, id: string, props: MurzEventBusProps) {
        super(scope, id);

        const bus = new EventBus(this, 'EkamurzEventBus', {
            eventBusName: 'EkamurzCheckoutEventBus'
        });

        const checkoutCartRule = new Rule(this, 'EkamurzCheckoutRule', {
            eventBus: bus,
            enabled: true,
            description: 'When cart microservice checkout the cart',
            eventPattern: {
                source: ['com.ekamurz.cart.checkout'],
                detailType: ['EkamurzCheckout']
            },
            ruleName: 'EkamurzCheckoutRule'
        });

        // checkoutCartRule.addTarget(new LambdaFunction(props.subscriberFunction));
        checkoutCartRule.addTarget(new SqsQueue(props.subscriberFunction));

        bus.grantPutEventsTo(props.publisherFunction);
    }
}