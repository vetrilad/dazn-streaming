let AWS = require("aws-sdk");
let constants = require("./constants.js");

const getUserSessions = (userid, dynamoDb) => {
    const params = {
        TableName: "VideoStreams",
        ExpressionAttributeValues: {":v1": {S: userid}},
        ConsistentRead: true,
        KeyConditionExpression: "userid = :v1"
    };
    return dynamoDb.query(params).promise();
};

const activeStreamingSessions = (sessions) => {
    return sessions.Items.filter(item => {
        return item.ttl.N >= constants.timeNow &&
           (item.status.S == "HOT" || item.status.S == "UNPROCESSED");
    });
};

const requestNewSession = (requestItem) => {
    let sessionType;

    if (requestItem.numberOfActiveSession < 3) {
        sessionType = constants.hotStream;
    } else {
        sessionType = constants.blockedStream;
    }

    return {
        userid: {S: requestItem.userid},
        streamId: {S: requestItem.streamId},
        ...constants.ttlStream,
        ...sessionType
    };
};

const updateStreamingSession = (newStreamingSession, dynamoDb) => {
    const params = {
        TableName: "VideoStreams",
        Item: newStreamingSession
    };
    return dynamoDb.putItem(params).promise();
};

const buildRequestItem = (event) => {
    let keys;

    if (event.Records.length == 1 && event.Records[0].eventName == "INSERT"){
        keys = event.Records[0].dynamodb.Keys;
    } else {
        throw "Event is not Insert or number of inserted records is not equal to one.";
    }

    return {
        userid: keys.userid.S,
        streamId: keys.streamId.S
    };
};

exports.handler = async (event) => {
    const dynamoDb = new AWS.DynamoDB();
    let response;
    let requestItem;

    try {
        requestItem = buildRequestItem(event);
        const currentSessions = await getUserSessions(requestItem.userid, dynamoDb);
        const activeSessions = activeStreamingSessions(currentSessions);
        const newStreamingSession = requestNewSession({
            numberOfActiveSession: activeSessions.length,
            ...requestItem
        });

        response = await updateStreamingSession(newStreamingSession, dynamoDb);
    } catch(error) {
        response = "Error: " + error;
    }

    return response;
};
