/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}

 */
import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";


//DynamoDB ayarları
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "todoApp2";

export const handler = async (event, context, callback) => {
  let response;

  //Cloudwatcher Logunda görüntülemek için. console.log yerine pure fonksiyon tercih edilebilir.
  console.log("methodu:" + event.httpMethod);
  console.log("event:" + event);
  //-------------------------------
  if (event.httpMethod === "POST") {
    //DynamoDB'ye POST isteği ile gelen veriyi ekleyen kod. Aynı anahtar değerine sahip olan eklemelerde hata verir.
    await dynamo
      .send(
        new PutCommand({
          TableName: tableName,
          Item: {
            id: randomUUID(),
            text: event.text,
          },
          ConditionExpression: `attribute_not_exists(id)`,
        })
      )
      .then(() => {
        response = {
          statusCode: 200,
        };

        callback(null, response);
      })
      .catch((err) => {
        response = {
          statusCode: 400,
          body: err,
        };
        callback(null, response);
      });
  } else if (event.httpMethod === "GET") {
    //DynamoDB'de tablodan tüm verileri çeken GET isteği.
    await dynamo
      .send(new ScanCommand({ TableName: tableName }))
      .then((data) => {
        callback(null, data.Items);
      })
      .catch((err) => {
        response = {
          statusCode: 400,
          body: err,
        };
        callback(null, response);
      });
  } else if (event.httpMethod === "DELETE") {
    //Tablodan bir veri silmek için DELETE isteği.
    await dynamo
      .send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            id: event.id,
          },
        })
      )
      .then((data) => {
        response = {
          statusCode: 200,
          body: data,
        };

        callback(null, response);
      })
      .catch((err) => {
        response = {
          statusCode: 400,
          body: err,
        };
        callback(null, response);
      });
  } else {
    response = {
      statusCode: 400,
    };
    callback(null, response);
  }
};
