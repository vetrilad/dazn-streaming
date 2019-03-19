import test from "ava";
import sinon from "sinon";
import AWS from "aws-sdk-mock";

import { handler } from "../src/check-session.js";
import { invalidUserSessions, validUserSession, insertEvent, updateEvent } from "./constants.js";

test.afterEach(() => {
	AWS.restore("DynamoDB");
});

test.serial("check active session for user and blocks new streaming", async t => {
    const putItemSpy = sinon.spy();

    AWS.mock("DynamoDB", "putItem", (params, callback) => {
        putItemSpy(params);
        callback(null, "Item inserted");
    });

    AWS.mock("DynamoDB", "query", (params, callback) => {
        callback(null, invalidUserSessions);
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
	t.deepEqual(response, ["Item inserted"]);
    t.true(putItemSpy.calledWithMatch(expectedParams));
});

test.serial("check for the new streams only and ignores ttl updates", async t => {
	const putItemSpy = sinon.spy();

    AWS.mock("DynamoDB", "putItem", (params, callback) => {
        putItemSpy(params);
        callback(null, "Item inserted");
    });

    AWS.mock("DynamoDB", "query", (params, callback) => {
        callback(null, invalidUserSessions);
    });

    const response = await handler(updateEvent);
    t.deepEqual(response, []);
});

test.serial("ignore non insert events when more then one record is passed from the stream", async t => {
    AWS.mock("DynamoDB", "putItem", (params, callback) => {
        callback(null, "Item inserted");
    });

    AWS.mock("DynamoDB", "query", (params, callback) => {
        callback(null, validUserSession);
    });

	updateEvent.Records.push(insertEvent.Records);
    const response = await handler(updateEvent);
    t.deepEqual(response, []);
});
