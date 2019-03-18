var AWS = require('aws-sdk');

const TTL = 5;

const blocked = {
    status: {
        S: "DROPPED"
    },
    reason: {
        S: "Threshold Limit reached"
    }
};

const hot = {
    status: {
        S: "HOT"
    }
};

var ttl = {
    ttl: {
        N: (Math.floor(Date.now() / 1000) + TTL).toString()
    }
};

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
        return item.ttl.N >= Math.floor(Date.now() / 1000) &&
           (item.status.S == "HOT" || item.status.S == "UNPROCESSED");
    });
};

const buildRequestItem = ({ dynamodb: {Keys: keys} }, dynamoDb) => {
    var userid = keys.userid.S;
    return new Promise((resolve, reject) => {

        getUserSessions(userid, dynamoDb).then((data) => {
            const currentSessions = activeStreamingSessions(data)

            resolve({
                userid: userid,
                streamId: keys.streamId.S,
                numberOfActiveSession: currentSessions.length
            });
        }).catch(e => reject(e));
    });
};

const requestNewSession = (requestItem) => {
    if (requestItem.numberOfActiveSession < 3) {
        return {
            userid: {S: requestItem.userid},
            streamId: {S: requestItem.streamId},
            ...ttl,
            ...hot
        }
    } else {
        return {
            userid: {S: requestItem.userid},
            streamId: {S: requestItem.streamId},
            ...ttl,
            ...blocked
        }
    }
};

const updateStreamingSession = (newStreamingSession, dynamoDb) => {
    const params = {
        TableName: "VideoStreams",
        Item: newStreamingSession
    };
    return dynamoDb.putItem(params).promise();
};

exports.handler = async (event) => {
    const dynamoDb = new AWS.DynamoDB();
    let response;

    try {
        if (event.Records[0].eventName == "INSERT") {
            const requestItem = await buildRequestItem(event.Records[0], dynamoDb)
            const newStreamingSession = requestNewSession(requestItem);

            response = await updateStreamingSession(newStreamingSession, dynamoDb);
        } else {
            response = "Bypass Stream Check function";
        }
    } catch(error) {
        response = "Bypass Stream Check function";
    }

    return response;
};
