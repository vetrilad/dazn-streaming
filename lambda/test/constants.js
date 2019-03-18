module.exports.invalidUserSessions = {
    Items: [
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
        }
    ]
};

module.exports.insertEvent = {
    Records: [{
        eventName: "INSERT",
        dynamodb: {
            Keys: {
                userid: {S:"101112"},
                streamId: {S:"67890"}
            }
        }
    }]
};

module.exports.updateEvent = {
    Records: [{
        eventName: "UPDATE",
        dynamodb: {
            Keys: {
                userid: {S:"101112"},
                streamId: {S:"67890"}
            }
        }
    }]
};

module.exports.apiGatewayGETRequest = {
    httpMethod: "GET",
    queryStringParameters: {
        streamId: "1235",
        userid: "67890343"
    }
};

module.exports.apiGatewayPUTRequest = {
    httpMethod: "PUT",
    queryStringParameters: {
        streamId: "1235",
        userid: "67890343"
    }
};

module.exports.validUserSession = {
    Items: [
        {
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
        }
    ]
};

module.exports.unprocessedUserSession = {
    Items: [
        {
            "userid": {
                S: "1235"
            },
            "streamId": {
                S: "67890343"
            },
            "status": {
                S: "UNPROCESSED"
            },
            "ttl": {
                N: (Math.floor(Date.now() / 1000) + 5).toString()
            }
        }
    ]
};
