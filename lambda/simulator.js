#!/usr/bin/env node

const axios = require("axios");
const uuidv4 = require("uuid/v4");
var program = require("commander");
var fs = require("fs");

program
    .version("0.1.0")
    .option("-u, --user [user]", "Account id")
    .parse(process.argv);

console.log("Reading Terraform outputs for API URL");
var API;
try {
    var obj = JSON.parse(fs.readFileSync("../terraform/dev/terraform.tfstate", "utf8"));
    API = obj.modules[0].outputs.api_url.value + "/streaming";
} catch (error) {
    console.log("Terraform file not found");
    API = "https://ixgpgxyuhh.execute-api.eu-west-1.amazonaws.com/test/streaming";
}

const params = {
    account: program.user || uuidv4().toString(),
    streamId: uuidv4().toString()
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
        callback();
    })
    .catch(err => console.log("Check Streaming error", err));
};

const sleep5secs = () => {
    setTimeout(() => {
        checkStreaming(params.account, params.streamId, sleep5secs);
    }, 1000);
};

startStreaming(params.account, params.streamId).then((res) => {
    checkStreaming(params.account, params.streamId, sleep5secs);
});
