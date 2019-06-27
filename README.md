# Food-supply-chain--hyperledger
Food Supply Chain Blockchain platform has the potential to enhance food safety by making the system more transparent, auditable, and traceable.





A sample Node.js app to demonstrate fabric-client & fabric-ca-client Node.js SDK APIs

Prerequisites and setup:
Docker - v1.12 or higher
Docker Compose - v1.8 or higher
Golang:- 
Git client - needed for clone commands
Node.js v8.4.0 or higher
Download Docker images





Sample REST APIs Requests
Login Request
Register and enroll new users in Organization - Org1:
curl -s -X POST http://localhost:4000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=admin&orgName=Org1'

OUTPUT:

{
  "success": true,
  "secret": "RaxhMgevgJcm",
  "message": "admin enrolled Successfully",
  "token": "<put JSON Web Token here>"
}
The response contains the success/failure status, an enrollment Secret and a JSON Web Token (JWT) that is a required string in the Request Headers for subsequent requests.

Create Channel request
curl -s -X POST \
  http://localhost:4000/channels \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel",
	"channelConfigPath":"../artifacts/channel/channel.tx"
}'
Please note that the Header authorization must contain the JWT returned from the POST /users call

Join Channel request
curl -s -X POST \
  http://localhost:4000/channels/mychannel/peers \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"]
}'
Install chaincode
curl -s -X POST \
  http://localhost:4000/chaincodes \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"],
	"chaincodeName":"mycc",
	"chaincodePath":"github.com/example_cc/go",
	"chaincodeType": "golang",
	"chaincodeVersion":"v0"
}'
NOTE: chaincodeType must be set to node when node.js chaincode is used and chaincodePath must be set to the location of the node.js chaincode. Also put in the $PWD

ex:
curl -s -X POST \
  http://localhost:4000/chaincodes \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"],
	"chaincodeName":"mycc",
	"chaincodePath":"$PWD/artifacts/src/github.com/example_cc/node",
	"chaincodeType": "node",
	"chaincodeVersion":"v0"
}'
Instantiate chaincode
This is the endorsement policy defined during instantiation. This policy can be fulfilled when members from both orgs sign the transaction proposal.
  
  
  
  #Endorsement policy

{
	identities: [{
			role: {
				name: 'member',
				mspId: 'Org1MSP'
			}
		},
		{
			role: {
				name: 'member',
				mspId: 'Org2MSP'
			}
		}
	],
	policy: {
		'2-of': [{
			'signed-by': 0
		}, {
			'signed-by': 1
		}]
	}
}
curl -s -X POST \
  http://localhost:4000/channels/mychannel/chaincodes \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json" \
  -d '{
  
	"peers": ["peer0.org1.example.com"],
	"chaincodeName":"mycc",
	"chaincodeVersion":"v0",
	"chaincodeType": "golang",
	"args":["a","100","b","200"]
}'
NOTE: chaincodeType must be set to node when node.js chaincode is used

Invoke request
This invoke request is signed by peers from both orgs, org1 & org2.

curl -s -X POST \
  http://localhost:4000/channels/mychannel/chaincodes/mycc \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer0.org2.example.com"],
	"fcn":"move",
	"args":["a","b","10"]
}'
NOTE: Ensure that you save the Transaction ID from the response in order to pass this string in the subsequent query transactions.

Chaincode Query
curl -s -X GET \
  "http://localhost:4000/channels/mychannel/chaincodes/mycc?peer=peer0.org1.example.com&fcn=query&args=%5B%22a%22%5D" \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json"
Query Block by BlockNumber
curl -s -X GET \
  "http://localhost:4000/channels/mychannel/blocks/1?peer=peer0.org1.example.com" \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json"
Query Transaction by TransactionID
curl -s -X GET http://localhost:4000/channels/mychannel/transactions/<put transaction id here>?peer=peer0.org1.example.com \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json"
NOTE: The transaction id can be from any previous invoke transaction, see results of the invoke request, will look something like 8a95b1794cb17e7772164c3f1292f8410fcfdc1943955a35c9764a21fcd1d1b3.

Query ChainInfo
curl -s -X GET \
  "http://localhost:4000/channels/mychannel?peer=peer0.org1.example.com" \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json"
Query Installed chaincodes
curl -s -X GET \
  "http://localhost:4000/chaincodes?peer=peer0.org1.example.com&type=installed" \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json"
Query Instantiated chaincodes
curl -s -X GET \
  "http://localhost:4000/chaincodes?peer=peer0.org1.example.com&type=instantiated" \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json"
Query Channels
curl -s -X GET \
  "http://localhost:4000/channels?peer=peer0.org1.example.com" \
  -H "authorization: Bearer <put JSON Web Token here>" \
  -H "content-type: application/json"
Clean the network
The network will still be running at this point. Before starting the network manually again, here are the commands which cleans the containers and artifacts.

docker rm -f $(docker ps -aq)
docker rmi -f $(docker images | grep dev | awk '{print $3}')
rm -rf fabric-client-kv-org[1-2]
