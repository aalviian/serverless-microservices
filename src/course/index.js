import { DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddbClient } from './ddbClient';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  let data;
  try {
    switch (event.httpMethod) {
      case "GET":
        if(event.queryStringParameters != null) {
          data = await getCourseByCategory(event)
        }
        else if (event.pathParameters != null) {
          data = await getCourse(event.pathParameters.id)
        } else {
          data = await getAllCourses()
        }
        break;
      case "POST":
        data = await createCourse(event)
        break;
      case "DELETE":
        data = await deleteCourse(event.pathParameters.id)
        break;
      case "PUT":
        data = await updateCourse(event)
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
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation.",
        errorMsg: error.message,
        errorStack: error.stack,
      })
    };
  }
};

const getCourse = async (courseId) => {
  console.log("Get course by ID")

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: courseId })
    }

    const { Item } = await ddbClient.send(new GetItemCommand(params))
    return (Item) ? unmarshall(Item): {};
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const getAllCourses = async () => {
  console.log("Get all of courses ");

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

const createCourse = async (event) => {
  console.log("Create a course");

  try {
    const courseRequest = JSON.parse(event.body);

    const courseId = uuidv4()
    courseRequest.id = courseId;

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(courseRequest || {})
    }

    const result = await ddbClient.send(new PutItemCommand(params));
    return result;

  } catch(e) {
    console.error(e);
    throw e;
  }
}

const deleteCourse = async (courseId) => {
  console.log("Delete a course");

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: courseId }),
    }

    const result = await ddbClient.send(new DeleteItemCommand(params))
    return result;
  } catch(e) {
    console.error(e)
    throw e;
  }
}

const updateCourse = async (event) => {
  console.log("Update a course");
  try {
    const requestBody = JSON.parse(event.body)
    const objKeys = Object.keys(requestBody)
    console.log(`Update course. requestBody : "${requestBody}", objKeys: "${objKeys}"`)

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
      UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
      }), {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`:value${index}`]: requestBody[key],
      }), {})),
    }

    const result = await ddbClient.send(new UpdateItemCommand(params));
    return result;
  } catch(e) {
    console.error(e);
    throw e;
  }
}

const getCourseByCategory = async (event) => {
  console.log("Get course by category")

  try {
    const courseId = event.pathParameters.id
    const category = event.queryStringParameters.category

    const params = {
      KeyConditionExpression: "id = :courseId",
      FilterExpression: "contains (category, :category)",
      ExpressionAttributeValues: {
        ":courseId": { S: courseId },
        ":category": { S: category }
      },
      TableName: process.env.DYNAMODB_TABLE_NAME
    }

    const { Items } = await ddbClient.send(new QueryCommand(params))
    return Items.map((item) => unmarshall(item));
  } catch(e) {
    console.error(e)
    throw e;
  }
}