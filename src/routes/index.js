m = require("../controllers/chainController");
var cors = require('cors');
var express = require('express');
var app = express();
var router = express.Router();


exports.appRoute = router => {


router.post("/users", m.tokengenerator);

router.post('/channels', m.createchannel);

router.post('/channels/:channelName/peers', m.joinchannel);

router.post('/chaincodes', m.installchaincode);

router.post('/channels/:channelName/chaincodes', m.instantiatechaincode);

router.post('/channels/:channelName/chaincodes/:chaincodeName', m.invoketransaction);

};














