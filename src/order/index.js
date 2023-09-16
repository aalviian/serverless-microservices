import { PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";

exports.handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    if (event.Records != null) {
        // SQS Invocation - Event Source Mapping (Poll-based)
        await sqsInvocation(event);
    }
    else if (event['detail-type'] !== undefined) {
        // EventBridge Invocation - Async (Event)
        await eventBridgeInvocation(event);
    } else {
        // API Gateway Invocation - Sync (Push)
        return await apiGatewayInvocation(event);
    }
};

const sqsInvocation = async (event) => {
    console.log("SQS Invocation");

    // event.Records.forEach(async (record) => {
    //   console.log('Record: %j', record);

    //   const checkoutEventRequest = JSON.parse(record.body);

    //   await createOrder(checkoutEventRequest.detail);
    // });

    for (const record of event.Records) {
        const checkoutEventRequest = JSON.parse(record.body)
        await createOrder(checkoutEventRequest.detail)
            .then((res) => {
                console.log(res);
            })
            .catch((error) => console.log(error));
    }
}

const eventBridgeInvocation = async (event) => {
    console.log("Event Bridge Invocation");
    await createOrder(event.detail);
}

const createOrder = async (cartCheckoutEvent) => {
    try {
        console.log("Create an order");

        const orderDate = new Date().toISOString();
        cartCheckoutEvent.orderDate = orderDate;
        console.log(cartCheckoutEvent);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(cartCheckoutEvent || {})
        };

        const result = await ddbClient.send(new PutItemCommand(params));
        return result;

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const apiGatewayInvocation = async (event) => {
    let data;

    try {
        switch (event.httpMethod) {
            case "GET":
                if (event.pathParameters != null) {
                    data = await getOrder(event);
                } else {
                    data = await getAllOrders();
                }
                break;
            default:
                throw new Error(`Unsupported HTTP Request: "${event.httpMethod}"`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully called HTTP Request: "${event.httpMethod}"`,
                data: data
            })
        };
    }
    catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to perform operation.",
                errorMsg: e.message,
                errorStack: e.stack,
            })
        };
    }
}

const getOrder = async (event) => {
    console.log("Get an order by username");

    try {
        const username = event.pathParameters.username;

        const params = {
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": { S: username }
            },
            TableName: process.env.DYNAMODB_TABLE_NAME
        };

        const { Items } = await ddbClient.send(new QueryCommand(params));
        return Items.map((item) => unmarshall(item));
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getAllOrders = async () => {
    console.log("Get all of orders");
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME
        };

        const { Items } = await ddbClient.send(new ScanCommand(params));
        return (Items) ? Items.map((item) => unmarshall(item)) : {};
    } catch (e) {
        console.error(e);
        throw e;
    }
}