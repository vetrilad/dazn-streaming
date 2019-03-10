var AWS = require('aws-sdk');
const TTL = 60;

exports.handler = (event, context, callback) => {
  var dynamoDb = new AWS.DynamoDB();
  // TODO: investigate if event can contain more then one record.
  event.Records.forEach((record) => {
    // console.log(record.eventID);
    // console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
    var userid = record.dynamodb.Keys.userid.S;
    var streamId = record.dynamodb.Keys.streamId.S;
    dynamoDb.query({ TableName: "videoStream", ExpressionAttributeValues: {":v1": {S: userid}}, KeyConditionExpression: "userid = :v1" }, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        if (data.Items.length > 3) {
          var blocked = {
            "status": {
              S: "DROPPED"
            },
            "reason": {
              S: "Threshold Limit reached"
            }
          };
          dynamoDb.putItem({ TableName: "videoStream", Item: {"userid": {S: userid}, "streamId": {S: streamId}, ...blocked}}, (err, data) => {
            console.log("Blocked Stream");
            console.log(err);
            return callback(null, data);
          });
        } else {
          var hot = {
            "status": {
              S: "HOT"
            }
          };
          var t = new Date();
          t.setSeconds(t.getSeconds() + TTL);
          const ttl = {
            "ttl": {
              S: Math.floor(t / 1000)
            }
          };
          dynamoDb.putItem({ TableName: "videoStream", Item: {"userid": {S: userid}, "streamId": {S: streamId}, ...hot, ...ttl}}, (err, data) => {
            console.log("Hot Stream");
            console.log(data);
          });
        }
      };
    });
  });
  return callback(null, "Finished");
};
