import test from "ava";
import AWS from "aws-sdk-mock";

import { handler } from "../src/put-session.js";
import { validUserSession, apiGatewayGETRequest, unprocessedUserSession } from "./constants.js";

test.afterEach(() => {
	AWS.restore("DynamoDB");
});

test.serial("send \"Session ttl updated\" message response when item updated", async t => {
    AWS.mock("DynamoDB", "query", (params, callback) => {
        callback(null, validUserSession);
    });
    AWS.mock("DynamoDB", "putItem", (params, callback) => {
        callback(null, "OK");
    });

    const response = await handler(apiGatewayGETRequest);

    t.is(response.statusCode, "200");
    t.is(response.body, "{\"message\":\"Inserted unprocessed session\"}");
    t.deepEqual(response.headers, { "Content-Type": "application/json" });
});

test.serial("send error when user has unprocessed records in the streaming table", async t => {
    AWS.mock("DynamoDB", "query", (params, callback) => {
        callback(null, unprocessedUserSession);
    });

    const response = await handler(apiGatewayGETRequest);

    t.is(response.statusCode, "400");
    t.is(response.body, "\"Found Unprocessed records for user\"");
    t.deepEqual(response.headers, { "Content-Type": "application/json" });
});
