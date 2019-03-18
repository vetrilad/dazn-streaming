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

const buildRequestItem = ({ dynamodb: {Keys: keys} }, dynamoDb) => {
    var userid = keys.userid.S;
    var pr = new Promise((resolve, reject) => {

        getUserSessions(userid, dynamoDb).then((data) => {
            var currentSessions = data.Items.filter(item => {
                return item.ttl.N >= Math.floor(Date.now() / 1000) &&
                   (item.status.S == "HOT" || item.status.S == "UNPROCESSED");
            });

            resolve({
                userid: userid,
                streamId: keys.streamId.S,
                numberOfActiveSession: currentSessions.length
            });
        }).catch(e => reject(e));
    });

    return pr;
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
    params = {
        TableName: "VideoStreams",
        Item: newStreamingSession
    };
    return dynamoDb.putItem(params).promise();
};

exports.handler = (event) => {
    const dynamoDb = new AWS.DynamoDB();
    return new Promise((resolve, reject) => {
        event.Records.forEach((record) => {
            try {
                if (record.eventName == "INSERT") {
                    buildRequestItem(record, dynamoDb).then(requestItem => {
                        const newStreamingSession = requestNewSession(requestItem);

                        updateStreamingSession(newStreamingSession, dynamoDb).then(resp => {
                            resolve(resp);
                        }).catch(e => console.log(e));
                    }).catch(e => console.log(e));
                } else {
                    resolve("Bypass Stream Check function")
                };
            }
            catch(error) {
                reject(error)
            };
        });
    });
};
