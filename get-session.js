var AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    const userid = event.queryStringParameters.account;
    const streamId = event.queryStringParameters.streamId;
    const timeNow = Math.floor(Date.now() / 1000).toString();
    const TTL = 10;

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'GET':
            dynamo.query({
                TableName: "VideoStreams",
                ExpressionAttributeValues: {":v1": {S: userid}, ":v2": {S: streamId}},
                KeyConditionExpression: "userid = :v1 AND streamId = :v2"
            }, (err, res) => {
                console.log(res);
                dynamo.putItem({
                    TableName: "VideoStreams",
                    Item: {
                        ttl: {N: (Math.floor(Date.now() / 1000) + TTL).toString()},
                        ...res.Items[0]
                    }
                }, done)
            });
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
