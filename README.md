# Video Streaming Service

## Getting Started
The service is deployed to a personal AWS test environment using master branch of this repo. You can run a quick check of the system by running the simulator script. Run multiple instances of the scipt to simulate concurrent streaming session. Use `./simulate.js -u 123` to reproduce the scenario for one user consuming multiple streams, otherwise you will get random user on each run.

`API = https://ixgpgxyuhh.execute-api.eu-west-1.amazonaws.com/test/streaming`

```
Create Session - PUT https://ixgpgxyuhh.execute-api.eu-west-1.amazonaws.com/test/streaming?account={string}&streamId={string}
Get Session - GET https://ixgpgxyuhh.execute-api.eu-west-1.amazonaws.com/test/streaming?account={string}&streamId={string}
```

```
chmod u+x simulator.js
./simulate.js --help
```

## Behaviour
To improve the user experience, the system is designed to return a session ID and then to validate the session and cut the streaming in case of an issue. This should improve the experience for valid streamers. This design makes room for other validation tasks which might have increased latency.

## Scaling
This solution leverages DynamoDB high availability and autoscaling and lambda dynamic charging. If it because a high velocity application it might require migration to a EC2 and loadbalancers alternative to the lambda functions.
Typical Streaming session will require `1RCU and 1WCU` and that will scale directly proportionally with any new streaming session which will require scaling on dynamoDB and can use reserve capacity for upcoming events.

## Unit tests
```
cd lambda
nvm use 8
yarn
yarn test
```
and to run the streaming simulation (need to deploy the system)
```
chmod u+x simulator.js
./simulate.js
```
## Build
```
cd lambda
yarn build
```
## Deployment
```
cd ./terraform/dev
Edit or add secrets to .example.variables.tfvars
terraform plan
terraform apply
```

## Future work
It is a high velocity application and lambda might not be the cost optimal solution and could be replaced with EC2 and load balancers.

TODO:
 + ~~node.js api~~
 + ~~any client~~ (API gateway)
 + ~~threshold 3~~
 + ~~git full history~~
 + ~~source code/ buildable viewable~~
 + ~~external libs~~
 + ~~instalation and deployment instructions~~
 + ~~URL for testing the service online~~
 + ~~put session lambda~~
 + ~~check session lambda~~
 + ~~get session lambda~~
 + ~~dynamodb streaming~~
 + ~~dynamodb automatic ttl~~
 + ~~deployment scripts~~
 + ~~integration tests scripts to simulate streaming~~
 + refactoring javascript/deployment (webpack maybe) / terraform policies
 + Create more granular IAM roles for lambda execution.
 + Add Webpack build and include streamId uuid creation into the putStreaming
 + Authentication/authorisation
