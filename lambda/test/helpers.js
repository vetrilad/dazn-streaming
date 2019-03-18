exports.invalidUserSessions = {
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

exports.insertEvent = {
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

exports.updateEvent = {
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

exports.apiGatewayGETRequest = {
    httpMethod: "GET",
    queryStringParameters: {
        streamId: "1235",
        userid: "67890343"
    }
};

exports.apiGatewayPUTRequest = {
    httpMethod: "PUT",
    queryStringParameters: {
        streamId: "1235",
        userid: "67890343"
    }
};

exports.validUserSession = {
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
