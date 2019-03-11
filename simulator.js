#!/usr/bin/env node

const axios = require('axios');
const uuidv4 = require('uuid/v4');

const apiGatewayUrl = "https://ss7qkykh4i.execute-api.eu-west-1.amazonaws.com/test/streaming";
const params = {
    account: uuidv4().toString(),
    streamId: uuidv4().toString()
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

axios.put(apiGatewayUrl + "?account=" + params.account + "&streamId=" + params.streamId)
.then(data => console.log(data))
.catch(err => console.log(err))
sleep(50000)
axios.put(apiGatewayUrl + "?account=" + params.account + "&streamId=" + uuidv4().toString())
.then(data => console.log(data))
.catch(err => console.log(err))
sleep(50000)
axios.put(apiGatewayUrl + "?account=" + params.account + "&streamId=" + uuidv4().toString())
.then(data => console.log(data))
.catch(err => console.log(err))
sleep(50000)
axios.put(apiGatewayUrl + "?account=" + params.account + "&streamId=" + uuidv4().toString())
.then(data => console.log(data))
.catch(err => console.log(err))

// axios.get(apiGatewayUrl, session)
// .then(date => console.log("GET" + data))
// .catch(err => console.log(err))
