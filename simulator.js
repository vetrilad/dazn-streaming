#!/usr/bin/env node

const axios = require('axios');
const uuidv4 = require('uuid/v4');
var program = require('commander');

program
  .version('0.1.0')
  .option('-u, --user [user]', 'Account id')
  .parse(process.argv);


const API = "https://ixgpgxyuhh.execute-api.eu-west-1.amazonaws.com/test/streaming";
const params = {
    account: program.user || uuidv4().toString(),
    streamId: uuidv4().toString()
};

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const startStreaming = (account, streamId) => {
    return axios.put(API + "?account=" + account + "&streamId=" + streamId)
    .then(data => {
        console.log("Start Streaming OK", data.data);
    })
    .catch(err => console.log("Start Streaming error", err));
};

const checkStreaming = (account, streamId, callback) => {
    return axios.get(API + "?account=" + account + "&streamId=" + streamId)
    .then(data => {
        console.log("Check streaming OK ", data.data);
        callback()
    })
    .catch(err => console.log("Check Streaming error", err));
};

const sleep5secs = () => {
    setTimeout(() => {
        checkStreaming(params.account, params.streamId, sleep5secs)
    }, 1000)
};

startStreaming(params.account, params.streamId).then((res) => {
    checkStreaming(params.account, params.streamId, sleep5secs);
});


// axios.get(apiGatewayUrl, session)
// .then(date => console.log("GET" + data))
// .catch(err => console.log(err))
