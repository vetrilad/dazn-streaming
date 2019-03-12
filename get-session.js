var AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    const userid = event.queryStringParameters.account;
    const streamId = event.queryStringParameters.streamId;
    const timeNow = Math.floor(Date.now() / 1000).toString();
    const TTL = 5;

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? JSON.stringify(err.message) : JSON.stringify(res),
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
            console.log("Query response: ", JSON.stringify(res.Items));
            if (res.Items.length <= 0) {
                done({message: { error: "Session not found"}}, null)
            } else if (res.Items[0].status && res.Items[0].status.S == "DROPPED" ) {
                done({message: {error: "Session Status is " + res.Items[0].status.S}}, null)
            } else if (res.Items[0].ttl.N < Math.floor(Date.now() / 1000)) {
                done({message: {error: "Session expired"}}, null)
            } else {
                dynamo.updateItem({
                    TableName: "VideoStreams",
                    Key: {
                        userid: { S: userid },
                        streamId: { S: streamId }
                    },
                    ExpressionAttributeNames: {
                        "#timetolive": "ttl"
                    },
                    ExpressionAttributeValues: {
                        ":t": {
                            N: (Math.floor(Date.now() / 1000) + TTL).toString()
                        }
                    },
                    UpdateExpression: "SET #timetolive = :t"
                }, (err, resp) => {
                    done(err, {userid: userid, streamId: streamId, message: "Session ttl updated"})
                });
            }
        });
        break;
        default:
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
