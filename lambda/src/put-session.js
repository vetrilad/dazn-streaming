var AWS = require("aws-sdk");
let constants = require("./constants.js");

const buildRequestItem = (event) => {
    return {
        userid: event.queryStringParameters.account,
        streamId: event.queryStringParameters.streamId
    };
};

const getUserSessions = ({userid}, dynamoDb) => {
    const params = {
        TableName: "VideoStreams",
        ExpressionAttributeValues: {":v1": {S: userid}},
        ConsistentRead: true,
        KeyConditionExpression: "userid = :v1"
    };
    return dynamoDb.query(params).promise();
};

const unprocessedStreamingSessions = (sessions) => {
    return sessions.Items.filter(item => {
        return item.ttl.N >= constants.timeNow &&
           (item.status.S == "UNPROCESSED");
    });
};

const insertSession = ({userid, streamId}, dynamoDb) => {
    const params = {
        TableName: "VideoStreams",
        Item: {
            "userid": {S: userid},
            "streamId": {S: streamId},
            "status": {S: "UNPROCESSED"},
            ...constants.ttlStream
        }
    };
    return dynamoDb.putItem(params).promise();
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

exports.handler = async event => {
    var dynamoDb = new AWS.DynamoDB();

    let response;
    let requestItem;
    let unprocessedSessions;
    let streamingSessions;

    try {
        requestItem = buildRequestItem(event);
        streamingSessions = await getUserSessions(requestItem, dynamoDb);
        unprocessedSessions = unprocessedStreamingSessions(streamingSessions);

        if (unprocessedSessions.length === 0) {
            await insertSession(requestItem, dynamoDb);
            response = done(null, { message: "Created unprocessed session" });
        } else {
            response = done({message: "Unprocessed records for user"});
        }
    } catch (error) {
        response = done({message: "Something went wrong" + error});
    }

    return response;
};
