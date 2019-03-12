var AWS = require('aws-sdk');
const TTL = 5; // seconds
var dynamoDb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    const userid = event.queryStringParameters.account;
    const streamId = event.queryStringParameters.streamId;

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // check if there are any unprocessed items and then insert.
    dynamoDb.query({
        TableName: "VideoStreams",
        ExpressionAttributeValues: {":v1": {S: userid}},
        KeyConditionExpression: "userid = :v1"
    }, (err, data) => {
        const unprocessedItems = data.Items.filter((item) => {
            return item.status === "UNPROCESSED";
        });
        if (unprocessedItems.length === 0) {
            dynamoDb.putItem({
                TableName: "VideoStreams",
                Item: {
                    "userid": {S: userid},
                    "streamId": {S: streamId},
                    "status": {S: "UNPROCESSED"},
                    "ttl": {N: (Math.floor(Date.now() / 1000) + TTL).toString()}
                }},
                done
            );
        } else {
            callback(`Unprocessed records for user`, null)
        }
    });
};
