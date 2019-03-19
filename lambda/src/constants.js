const TTL  = 5;
const timeNow = Math.floor(Date.now() / 1000);

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

const ttlStream = {
    ttl: {
        N: (timeNow + TTL).toString()
    }
}

module.exports = { TTL, blockedStream, hotStream, ttlStream, timeNow };
