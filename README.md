# Video Streaming Service

## Getting Started
The service is deployed to a personal AWS test environment using master branch of this repo. You can run a quick check of the system by running the simulator script. Run multiple instances of the scipt to simulate concurrent streaming session. Use `./simulate.js -u 123` to reproduce the scenario for one user consuming multiple streams, otherwise you will get random user on each run.
```
chmod u+x simulator.js
./simulate.js --help
```

## Behaviour

## Architecture
## Infrastructure

## Unit tests
```
nvm use 8
yarn
yarn test
```
and to run the streaming simulation
```
chmod u+x simulator.js
./simulate.js
```
## Build
```
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

Deployment via terraform. Local Development in javascript and testing with ava.
Leverage DynamoDB high availability and autoscaling.

TODO:
 + ~~node.js api~~
 + ~~any client~~ (API gateway)
 + ~~threshold 3~~
 + ~~git full history~~
 + ~~source code/ buildable viewable~~
 + ~~external libs~~
 + ~~instalation and deployment instructions~~
 + URL for testing the service online
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
