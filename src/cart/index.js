import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";
import { ebClient } from "./eventBridgeClient";

exports.handler = async function(event) {
    let data;

    try {
      switch (event.httpMethod) {
        case "GET":
          if (event.pathParameters != null) {
            data = await getCart(event.pathParameters.username)
            } else {
            data = await getAllCarts()
          }
          break;
        case "POST":
          if (event.path == "/cart/checkout") {
            data = await checkoutCart(event)
          } else {
              data = await createCart(event)
          }
          break;
        case "DELETE":
          data = await deleteCart(event.pathParameters.username)
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

    } catch (e) {
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
};

const getCart = async (username) => {
  console.log("Get cart by username");

  try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ username: username })
      };

      const { Item } = await ddbClient.send(new GetItemCommand(params));
      return (Item) ? unmarshall(Item) : {};

    } catch(e) {
      console.error(e);
      throw e;
  }
}

const getAllCarts = async () => {
  console.log("Get all carts");

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));
    return (Items) ? Items.map((item) => unmarshall(item)) : {};

  } catch(e) {
      console.error(e);
      throw e;
  }
}

const createCart = async (event) => {
  console.log("Create a cart");

  try {
    const requestBody = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(requestBody || {})
    };

    const result = await ddbClient.send(new PutItemCommand(params));
    return result;

  } catch(e) {
    console.error(e);
    throw e;
  }
}

const deleteCart = async (username) => {
  console.log("Delete a cart by username");

  try {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ username: username }),
    };

    const result = await ddbClient.send(new DeleteItemCommand(params));
    return result;

  } catch(e) {
    console.error(e);
    throw e;
  }
}

const checkoutCart = async (event) => {
  console.log("Checkout the cart");

  const checkoutRequest = JSON.parse(event.body);
  if (checkoutRequest == null || checkoutRequest.username == null) {
    throw new Error("Cart for this username is not exists");
  }

  const cart = await getCart(checkoutRequest.username);

  var checkoutPayload = calculateGrandTotal(checkoutRequest, cart);
  const publishedEvent = await publishCheckoutCartEvent(checkoutPayload);

  await deleteCart(checkoutRequest.username);
}

const calculateGrandTotal = (checkoutRequest, cart) => {
  console.log("Calculate grand total cart");

  try {
      if (cart == null || cart.items == null) {
          throw new Error('Cart was not found.');
      }

      // calculate grand total
      let grandTotal = 0;
      cart.items.forEach(item => grandTotal = grandTotal + item.price);
      checkoutRequest.grandTotal = grandTotal;
      console.log(checkoutRequest);

      // copies all properties from cart into checkoutRequest
      Object.assign(checkoutRequest, cart);
      return checkoutRequest;

    } catch(e) {
      console.error(e);
      throw e;
  }
}

const publishCheckoutCartEvent = async (checkoutPayload) => {
  console.log("Publish checkout cart event");

  try {
      const params = {
          Entries: [
              {
                  Source: process.env.EVENT_SOURCE,
                  Detail: JSON.stringify(checkoutPayload),
                  DetailType: process.env.EVENT_DETAILTYPE,
                  Resources: [ ],
                  EventBusName: process.env.EVENT_BUSNAME
              },
          ],
      };

      const data = await ebClient.send(new PutEventsCommand(params));
      console.log("Event was successfully sent with requestID:", data);
      return data;

    } catch(e) {
      console.error(e);
      throw e;
  }
}