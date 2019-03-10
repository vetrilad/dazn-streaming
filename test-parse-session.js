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
      }
    },{
        "userid": {
          S: "1235"
        },
        "streamId": {
          S: "67890343"
        }
    },{
        "userid": {
          S: "6789"
        },
        "streamId": {
          S: "67890"
        }
    },{
        "userid": {
          S: "101112"
        },
        "streamId": {
          S: "67890"
        }
    }]
  })});

  var event = {
    Records: [{
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
    TableName: "videoStream",
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
      }
    }
  };
  t.true(putItemSpy.calledWith(expectedParams))
  t.true(callback.called);
});

test('cheking for the new streams only and ignores ttl updates', t => {

});
