const TTL  = 5;
let timeNow = () => Math.floor(Date.now() / 1000);

const blockedStream = {
    status: {
        S: "DROPPED"
    },
    reason: {
        S: "Threshold Limit reached"
    }
};

const hotStream = {
    status: {
        S: "HOT"
    }
};

const ttlStream = () => {
    return {
        ttl: {
            N: (timeNow() + TTL).toString()
        }
    };
};

module.exports = { TTL, blockedStream, hotStream, ttlStream, timeNow };
