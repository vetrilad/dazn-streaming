const done = (err, res) => {
    return {
        statusCode: err ? "400" : "200",
        body: err ? JSON.stringify(err.message) : JSON.stringify(res),
        headers: {
            "Content-Type": "application/json",
        }
    };
};

const buildRequestItem = (event) => {
    return {
        userid: event.queryStringParameters.account,
        streamId: event.queryStringParameters.streamId
    };
};

module.exports = {done, buildRequestItem};
