import test from 'ava';
import sinon from "sinon";
import AWS from "aws-sdk-mock";

import { handler } from "./check-session.js";

const callback = sinon.spy();
const putItemSpy = sinon.spy();
const black_function = () => {};

test('when there are over the threshold sessions it sets status field to errored and reasons field to threshold exided', t => {
    AWS.mock('DynamoDB', 'putItem', putItemSpy);
    AWS.mock('DynamoDB', 'query', (params, callback) => {
        callback(null, {Items: [
            {
                "userid": {
                    S: "1235"
                },
                "streamId": {
                    S: "67890"
                },
                "status": {
                    S: "UNPROCESSED"
                },
                "ttl": {
                    N: (Math.floor(Date.now() / 1000) + 5).toString()
                }
            },{
                "userid": {
                    S: "1235"
                },
                "streamId": {
                    S: "67890343"
                },
                "status": {
                    S: "HOT"
                },
                "ttl": {
                    N: (Math.floor(Date.now() / 1000) + 5).toString()
                }
            },{
                "userid": {
                    S: "6789"
                },
                "streamId": {
                    S: "67890"
                },
                "status": {
                    S: "HOT"
                },
                "ttl": {
                    N: (Math.floor(Date.now() / 1000) + 5).toString()
                }
            },{
                "userid": {
                    S: "101112"
                },
                "streamId": {
                    S: "67890"
                },
                "status": {
                    S: "HOT"
                },
                "ttl": {
                    N: (Math.floor(Date.now() / 1000) + 5).toString()
                }
            }]
        })});

    var event = {
        Records: [{
            eventName: "INSERT",
            dynamodb: {
                Keys: {
                    userid: {S:"101112"},
                    streamId: {S:"67890"}
                }
            }
        }]
    }

    handler(event, black_function, callback);
    var expectedParams = {
        TableName: "VideoStreams",
        Item: {
            userid: {
                S: "101112"
            },
            streamId: {
                S: "67890"
            },
            status: {
                S: "DROPPED"
            },
            reason: {
                S: "Threshold Limit reached"
            },
            ttl: {
                N: (Math.floor(Date.now() / 1000) + 5).toString()
            }
        }
    };
    t.true(putItemSpy.calledWithMatch(expectedParams));
});

test('cheking for the new streams only and ignores ttl updates', t => {
    var event = {
        Records: [{
            eventName: "UPDATE",
            dynamodb: {
                Keys: {
                    userid: {S:"101112"},
                    streamId: {S:"67890"}
                }
            }
        }]
    }

    handler(event, black_function, callback);
    t.true(callback.calledWith(null, "Bypass Stream Check function"));
});
