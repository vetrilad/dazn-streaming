var AWS = require("aws-sdk");
let constants = require("./constants.js");
let apiGatewayWrapper = require("./api-gateway.js");

const getStreamingSession = ({userid, streamId}, dynamoDb) => {
    const params = {
        TableName: "VideoStreams",
        ExpressionAttributeValues: {":v1": {S: userid}, ":v2": {S: streamId}},
        ConsistentRead: true,
        KeyConditionExpression: "userid = :v1 AND streamId = :v2"
    };
    return dynamoDb.query(params).promise();
};

const buildResponseItem = (requestItem, session, timeNow) => {
  let sessionValid = false;
  let message = null;

  if (session.Items.length <= 0) {
      sessionValid = false,
      message = "Session not found";
  } else if (session.Items[0].status && session.Items[0].status.S == "DROPPED" ) {
      sessionValid = false,
      message = "Session Status is " + session.Items[0].status.S;
  } else if (session.Items[0].ttl.N < timeNow) {
      sessionValid = false,
      message = "Session expired";
  } else {
      sessionValid = true;
  }

  return {
    session: {
      valid: sessionValid,
      message: message
    },
    ...requestItem
  };
};

const refreshStreamingSession = ({userid, streamId}, ttl, dynamo) => {
    const params = {
        TableName: "VideoStreams",
        Key: { userid: { S: userid }, streamId: { S: streamId } },
        ExpressionAttributeNames: { "#timetolive": "ttl" },
        ExpressionAttributeValues: { ":t": { N: ttl } },
        UpdateExpression: "SET #timetolive = :t"
    };

    return dynamo.updateItem(params).promise();
};

exports.handler = async (event) => {
    const dynamo = new AWS.DynamoDB();
    let response;

    try {
        const requestItem = apiGatewayWrapper.buildRequestItem(event);
        const session = await getStreamingSession(requestItem, dynamo);
        const responseItem = buildResponseItem(requestItem, session, constants.timeNow());

        if (responseItem.session.valid) {
            const ttl = (constants.timeNow() + constants.TTL).toString();
            await refreshStreamingSession(requestItem, ttl, dynamo);
            response = apiGatewayWrapper.done(
                null,
                {...responseItem, message: "Session ttl updated"}
            );
        } else {
            response = apiGatewayWrapper.done(new Error(responseItem.session.message));
        }
    } catch(error) {
        response = apiGatewayWrapper.done(new Error("Something went wrong " + error));
    }

    return response;
};
