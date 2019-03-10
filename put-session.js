var AWS = require('aws-sdk');
const TTL = 60; // seconds
var dynamoDb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    const userid = event.queryStringParameters.account;
    const streamId = event.queryStringParameters.streamId;

    var timeNow = new Date();
    timeNow.setSeconds(timeNow.getSeconds() + TTL);
    const ttl = Math.floor(timeNow / 1000);

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    dynamoDb.putItem({
        TableName: "VideoStreams",
        Item: {"userid": {S: userid}, "streamId": {S: streamId}}},
        done
    );
};
