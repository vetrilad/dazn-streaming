var AWS = require("aws-sdk");
let constants = require("./constants.js");

const getUserSession = ({userid, streamId}, dynamoDb) => {
    const params = {
        TableName: "VideoStreams",
        ExpressionAttributeValues: {":v1": {S: userid}, ":v2": {S: streamId}},
        KeyConditionExpression: "userid = :v1 AND streamId = :v2"
    };
    return dynamoDb.query(params).promise();
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

const buildRequestItem = (event) => {
    return {
        userid: event.queryStringParameters.account,
        streamId: event.queryStringParameters.streamId
    };
};

const done = (err, res) => {
    return {
        statusCode: err ? "400" : "200",
        body: err ? JSON.stringify(err.message) : JSON.stringify(res),
        headers: {
            "Content-Type": "application/json",
        }
    };
};

exports.handler = async (event) => {
    const dynamo = new AWS.DynamoDB();
    let response;
    let requestItem;

    try {
        if (event.httpMethod == "GET") {
            requestItem = buildRequestItem(event);
            const res = await getUserSession(requestItem, dynamo);

            if (res.Items.length <= 0) {
                response = done({message: {error: "Session not found"}}, null);
            } else if (res.Items[0].status && res.Items[0].status.S == "DROPPED" ) {
                response = done({message: {error: "Session Status is " + res.Items[0].status.S}}, null);
            } else if (res.Items[0].ttl.N < constants.timeNow) {
                response = done({message: {error: "Session expired"}}, null);
            } else {
                const ttl = (constants.timeNow + constants.TTL).toString();
                await refreshStreamingSession(requestItem, ttl, dynamo);
                response = done(null, {...requestItem, message: "Session ttl updated"});
            }
        } else {
            response = done(new Error(`Unsupported method "${event.httpMethod}"`));
        }
    } catch(error) {
        response = done(new Error(`Unsupported method "${event.httpMethod}"`));
    }

    return response;
};
