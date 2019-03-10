var AWS = require('aws-sdk');
const TTL = 60;
exports.handler = (event, context, callback) => {
  var dynamoDb = new AWS.DynamoDB();
  const userid = "1234";
  const streamId = "get-random";
  var t = new Date();
  t.setSeconds(t.getSeconds() + TTL);
  const ttl = Math.floor(t / 1000);
  const timeNow =  Math.floor(Date.now() / 1000);
  // check the session is in the table
  // check ttl
  // update ttl

  dynamoDb.query({
    TableName: "videoStream",
    ExpressionAttributeValues: {":v1": {S: userid}, ":v2": {S: sessionid}, ":v3": {S: timeNow}},
    KeyConditionExpression: "userid = :v1 AND sessionId = :v2 AND ttl <= :v3"
  }, (err, data) => {
      if data {
        dynamoDb.putItem({ TableName: "videoStream", Item: {"userid": {S: userid}, "streamId": {S: streamId}, {ttl: ttl}}}, (err, data) => {
          return callback(null, "Finished");
        });
      }

      if error {

      }
  }
};

console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'GET':
            dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            break;
        case 'POST':
            dynamo.putItem(JSON.parse(event.body), done);
            break;
        case 'PUT':
            dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
