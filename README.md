# Food-supply-chain--hyperledger
Food Supply Chain Blockchain platform has the potential to enhance food safety by making the system more transparent, auditable, and traceable.





A sample Node.js app to demonstrate fabric-client & fabric-ca-client Node.js SDK APIs

Prerequisites and setup:
Docker - v1.12 or higher
Docker Compose - v1.8 or higher
Golang:- 
Git client - needed for clone commands
Node.js v8.4.0 or higher
Download docker images 

To Download latest docker images for fabric

**curl -sSL http://bit.ly/2ysbOFE | bash -s**



		*********************Run following commands to get started**********************


     				****To up the Fabric network ****
#    docker-compose -f .\artifacts\docker-compose.yaml up 


					****To start Node Api****
#    Nodemon app									







Now you are ready to hit your Api's to get/post data in the **Hyperledger fabric network**

Kindly Refer to the attached file.
**postman commands **








To lean the network
The network will still be running at this point. Before starting the network manually again, here are the commands which cleans the containers and artifacts.

**docker rm -f $(docker ps -aq)**

