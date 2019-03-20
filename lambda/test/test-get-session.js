import test from "ava";
import sinon from "sinon";
import AWS from "aws-sdk-mock";

import { handler } from "../src/get-session.js";
import { validUserSession, apiGatewayGETRequest } from "./constants.js";

test.afterEach(() => {
	AWS.restore("DynamoDB");
});

test.serial("send \"Session ttl updated\" message response when item updated", async t => {
    AWS.mock("DynamoDB", "query", (params, callback) => {
        callback(null, validUserSession);
    });
    AWS.mock("DynamoDB", "updateItem", (params, callback) => {
        callback(null, "OK");
    });

    const response = await handler(apiGatewayGETRequest);
    t.is(response.statusCode, "200");
    t.is(response.body, "{\"session\":{\"valid\":true,\"message\":\"HOT\"},\"streamId\":\"1235\",\"message\":\"Session ttl updated\"}");
    t.deepEqual(response.headers, { "Content-Type": "application/json" });
});

test.serial("updated the record with a ttl when session found", async t => {
    const updateItemSpy = sinon.spy();

    AWS.mock("DynamoDB", "query", (params, callback) => {
        callback(null, validUserSession);
    });
    AWS.mock("DynamoDB", "updateItem", (params, callback) => {
        updateItemSpy(params);
        callback(null, "OK");
    });

    await handler(apiGatewayGETRequest);
    t.deepEqual(
        updateItemSpy.lastCall.lastArg.ExpressionAttributeValues,
        { ":t": { N: (Math.floor(Date.now() / 1000) + 5).toString() } }
    );
});
