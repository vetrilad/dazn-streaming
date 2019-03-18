import test from 'ava';
import sinon from "sinon";
import AWS from "aws-sdk-mock";

import { handler } from "../src/check-session.js";
import { invalidUserSessions, insertEvent, updateEvent } from "./constants.js";

test.afterEach(() => {
	AWS.restore('DynamoDB');
});

test.serial('when there are over the threshold sessions it sets status field to errored and reasons field to threshold exided', async t => {
    const putItemSpy = sinon.spy();

    AWS.mock('DynamoDB', 'putItem', (params, callback) => {
        putItemSpy(params);
        callback(null, "Item inserted");
    });

    AWS.mock('DynamoDB', 'query', (params, callback) => {
        callback(null, invalidUserSessions)
    });

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

    const response = await handler(insertEvent);
    t.true(putItemSpy.calledWithMatch(expectedParams));
    t.is(response, "Item inserted")
});

test.serial('cheking for the new streams only and ignores ttl updates', async t => {
    const response = await handler(updateEvent);
    t.is(response, "Bypass Stream Check function");
});
