var AWS = require('aws-sdk');
const TTL = 5;
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
                ConsistentRead: true,
                KeyConditionExpression: "userid = :v1"
            }, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    var items = data.Items.filter(item => {
                        return item.ttl.N >= Math.floor(Date.now() / 1000) &&
                            (item.status.S == "HOT" || item.status.S == "UNPROCESSED");
                    })
                    var ttl = {
                        "ttl": {
                            N: (Math.floor(Date.now() / 1000) + TTL).toString()
                        }
                    };
                    console.log(items);
                    if (items.length > 3 ) {
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
                            if (data) {
                                console.log("data: ", data);
                                callback(null, data)
                            };
                            if (err) {
                                console.log("Error: ", err);
                                callback(err)
                            };
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
                            if (data) {
                                console.log("data: ", data);
                                callback(null, data)
                            };
                            if (err) {
                                console.log("Error: ", err);
                                callback(err)
                            };
                        });
                    }
                };
            });
        } else {
            callback(null, "Bypass Stream Check function");
        }
    });
};
