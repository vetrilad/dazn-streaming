var AWS = require('aws-sdk');
const TTL = 5;

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
    }

    return dynamo.updateItem(params).promise()
};

const buildRequestItem = (event) => {
    return {
        userid: event.queryStringParameters.account,
        streamId: event.queryStringParameters.streamId
    }
};

exports.handler = (event) => {
    const dynamo = new AWS.DynamoDB();

    const requestItem = buildRequestItem(event);

    return new Promise((resolve,) => {
        const done = (err, res) => resolve({
            statusCode: err ? '400' : '200',
            body: err ? JSON.stringify(err.message) : JSON.stringify(res),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (event.httpMethod == "GET") {
            getUserSession(requestItem, dynamo).then(res => {
                if (res.Items.length <= 0) {
                    done({message: {error: "Session not found"}}, null)
                } else if (res.Items[0].status && res.Items[0].status.S == "DROPPED" ) {
                    done({message: {error: "Session Status is " + res.Items[0].status.S}}, null)
                } else if (res.Items[0].ttl.N < Math.floor(Date.now() / 1000)) {
                    done({message: {error: "Session expired"}}, null)
                } else {
                    const ttl = ((Math.floor(Date.now() / 1000) + TTL)).toString();
                    refreshStreamingSession(requestItem, ttl, dynamo).then(() => {
                        done(null, {...requestItem, message: "Session ttl updated"})
                    }).catch(error => {
                        done(error)
                    });
                }
            });
        } else {
            done(new Error(`Unsupported method "${event.httpMethod}"`));
        }
    });
};
