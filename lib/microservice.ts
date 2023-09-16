import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface MurzMicroservicesProps {
    courseTable: ITable;
    cartTable: ITable;
    orderTable: ITable;
}

export class MurzMicroservices extends Construct {
    public readonly courseMicroservice: NodejsFunction;
    public readonly cartMicroservice: NodejsFunction;
    public readonly orderMicroservice: NodejsFunction;

    constructor(scope: Construct, id: string, props: MurzMicroservicesProps) {
        super(scope, id);

        this.courseMicroservice = this.createCourseFunction(props.courseTable)
        this.cartMicroservice = this.createCartFunction(props.cartTable)
        this.orderMicroservice = this.createOrderFunction(props.orderTable)
    }

    private createCourseFunction(courseTable: ITable): NodejsFunction {
        const functionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk'
                ]
            },
            environment: {
                PRIMARY_KEY: 'id',
                DYNAMODB_TABLE_NAME: courseTable.tableName
            },
            runtime: Runtime.NODEJS_16_X
        }

        const courseFunction = new NodejsFunction(this, 'EkamurzCourseLambda', {
            entry: join(__dirname, `/../src/course/index.js`),
            ...functionProps,
        })

        courseTable.grantReadWriteData(courseFunction);

        return courseFunction
    }

    private createCartFunction(cartTable: ITable): NodejsFunction {
        const functionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk'
                ]
            },
            environment: {
                PRIMARY_KEY: 'username',
                DYNAMODB_TABLE_NAME: cartTable.tableName,
                EVENT_SOURCE: "com.murz.cart.checkout",
                EVENT_DETAILTYPE: "EkamurzCheckout",
                EVENT_BUSNAME: "EkamurzCheckoutEventBus"
            },
            runtime: Runtime.NODEJS_16_X
        }

        const cartFunction = new NodejsFunction(this, 'EkamurzCartLambda', {
            entry: join(__dirname, `/../src/cart/index.js`),
            ...functionProps,
        });

        cartTable.grantReadWriteData(cartFunction);

        return cartFunction;
    }

    private createOrderFunction(orderTable: ITable): NodejsFunction {
        const functionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk'
                ]
            },
            environment: {
                PRIMARY_KEY: 'username',
                SORT_KEY: 'orderDate',
                DYNAMODB_TABLE_NAME: orderTable.tableName
            },
            runtime: Runtime.NODEJS_16_X
        }

        const orderFunction = new NodejsFunction(this, 'EkamurzOrderLambda', {
            entry: join(__dirname, `/../src/order/index.js`),
            ...functionProps,
        });

        orderTable.grantReadWriteData(orderFunction);

        return orderFunction;
    }
}