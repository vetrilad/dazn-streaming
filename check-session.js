var AWS = require('aws-sdk');
const TTL = 1;
const blocked = {
    "status": {
        S: "DROPPED"
    },
    "reason": {
        S: "Threshold Limit reached"
    }
};
const hot = {
    "status": {
        S: "HOT"
    }
};

exports.handler = (event, context, callback) => {
    var dynamoDb = new AWS.DynamoDB();
    // TODO: investigate if event can contain more then one record.
    event.Records.forEach((record) => {
        console.log('Record: %j', record);
        console.log('DynamoDB Record: %j', record.dynamodb);
        if (record.eventName == "INSERT") {
            var userid = record.dynamodb.Keys.userid.S;
            var streamId = record.dynamodb.Keys.streamId.S;
            dynamoDb.query({
                TableName: "VideoStreams",
                ExpressionAttributeValues: {":v1": {S: userid}},
                KeyConditionExpression: "userid = :v1"
            }, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    var ttl = {
                        "ttl": {
                            N: (Math.floor(Date.now() / 1000) + TTL).toString()
                        }
                    };
                    if (data.Items.length > 3) {
                        dynamoDb.putItem({
                            TableName: "VideoStreams",
                            Item: {
                                "userid": {S: userid},
                                "streamId": {S: streamId},
                                ...blocked,
                                ...ttl
                            }
                        }, (err, data) => {
                            console.log("Blocked Stream");
                            console.log(err);
                            return callback(null, data);
                        });
                    } else {
                        dynamoDb.putItem({
                            TableName: "VideoStreams",
                            Item: {
                                "userid": {S: userid},
                                "streamId": {S: streamId},
                                ...hot,
                                ...ttl
                            }
                        }, (err, data) => {
                            console.log("Hot Stream");
                            console.log(data);
                            console.log(err);
                        });
                    }
                };
            });
        } else {
            console.log("Bypass Stream Check function");
        }
    });
    return callback(null, "Finished");
};
