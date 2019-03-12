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
    account: uuidv4().toString(),
    streamId: uuidv4().toString()
};

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const startStreaming = (account, streamId) => {
    axios.put(API + "?account=" + account + "&streamId=" + streamId)
    .then(data => {
        return console.log(data.data);
    })
    .catch(err => console.log(err));
};

const checkStreaming = (account, streamId) => {
    axios.get(API + "?account=" + account + "&streamId=" + streamId)
    .then(data => {
        return console.log(data.data);
    })
    .catch(err => console.log(err));
};

console.log(program.user);
// startStreaming(program.user = params.account, params.streamId);


// checkStreaming(program.user = params.account, params.streamId);

// axios.get(apiGatewayUrl, session)
// .then(date => console.log("GET" + data))
// .catch(err => console.log(err))
