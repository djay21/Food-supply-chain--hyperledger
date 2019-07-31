var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util'); 
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');




require('../../config.js');
require('../../app.js');

var hfc = require('fabric-client');

helper = require('../../app/helper.js');
createChannel = require('../../app/create-channel.js');
join = require('../../app/join-channel.js');
updateAnchorPeers = require('../../app/update-anchor-peers.js');
install = require('../../app/install-chaincode.js');
instantiate = require('../../app/instantiate-chaincode.js');
invoke = require('../../app/invoke-transaction.js');
query = require('../../app/query.js');



app.set('secret', 'thisismysecret');
app.use(expressJWT({
	secret: 'thisismysecret'
}).unless({
	path: ['/users']
}));


exports.tokengenerator= async (req,res) => {
    var username = req.body.username;
    var orgName = req.body.orgName;
    console.log('End point : /users');
    console.log('User name : ' + username);
    console.log('Org name  : ' + orgName);
    if (!username) {
      res.json(getErrorMessage('\'username\''));
      return;
    }
    if (!orgName) {
      res.json(getErrorMessage('\'orgName\''));
      return;
    }
    var token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
      username: username,
      orgName: orgName
    }, app.get('secret'));
    let response = await helper.getRegisteredUser(username, orgName, true);

    console.log('-- returned from registering the username %s for organization %s',username,orgName);
    if (response && typeof response !== 'string') {
      console.log('Successfully registered the username %s for organization %s',username,orgName);
      response.token = token;
      res.json(response);
    } else {
      console.log('Failed to register the username %s for organization %s with::%s',username,orgName,response);
      res.json({success: false, message: response});
    }
  };





  exports.createchannel = async (req,res) =>{
      logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
      console.log('End point : /channels');
      var channelName = req.body.channelName;
      var channelConfigPath = req.body.channelConfigPath;
      console.log('Channel name : ' + channelName);
      console.log('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/channel.tx
      if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
      }
      if (!channelConfigPath) {
        res.json(getErrorMessage('\'channelConfigPath\''));
        return;
      }
    
      let message = await createChannel.createChannel(channelName, channelConfigPath, req.username, req.orgname);
      res.send(message);
    };











exports.joinchannel = async  (req,res)=> {
    logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
    var channelName = req.params.channelName;
    var peers = req.body.peers;
    console.log('channelName : ' + channelName);
    console.log('peers : ' + peers);
    console.log('username :' + req.username);
    console.log('orgname:' + req.orgname);
  
    if (!channelName) {
      res.json(getErrorMessage('\'channelName\''));
      return;
    }
    if (!peers || peers.length == 0) {
      res.json(getErrorMessage('\'peers\''));
      return;
    }
  
    let message =  await join.joinChannel(channelName, peers, req.username, req.orgname);
    res.send(message);
};




exports.installchaincode = async (req,res)=>{
    console.log('==================== INSTALL CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.body.chaincodeName;
    var chaincodePath = req.body.chaincodePath;
    var chaincodeVersion = req.body.chaincodeVersion;
    var chaincodeType = req.body.chaincodeType;
    console.log('peers : ' + peers); // target peers list
    console.log('chaincodeName : ' + chaincodeName);
    console.log('chaincodePath  : ' + chaincodePath);
    console.log('chaincodeVersion  : ' + chaincodeVersion);
    console.log('chaincodeType  : ' + chaincodeType);
    if (!peers || peers.length == 0) {
      res.json(getErrorMessage('\'peers\''));
      return;
    }
    if (!chaincodeName) {
      res.json(getErrorMessage('\'chaincodeName\''));
      return;
    }
    if (!chaincodePath) {
      res.json(getErrorMessage('\'chaincodePath\''));
      return;
    }
    if (!chaincodeVersion) {
      res.json(getErrorMessage('\'chaincodeVersion\''));
      return;
    }
    if (!chaincodeType) {
      res.json(getErrorMessage('\'chaincodeType\''));
      return;
    }
    let message = await install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, req.username, req.orgname)
    res.send(message);
};

exports.instantiatechaincode= async (req,res)=> {
    console.log('==================== INSTANTIATE CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.body.chaincodeName;
    var chaincodeVersion = req.body.chaincodeVersion;
    var channelName = req.params.channelName;
    var chaincodeType = req.body.chaincodeType;
    var fcn = req.body.fcn;
    var args = req.body.args;
    console.log('peers  : ' + peers);
    console.log('channelName  : ' + channelName);
    console.log('chaincodeName : ' + chaincodeName);
    console.log('chaincodeVersion  : ' + chaincodeVersion);
    console.log('chaincodeType  : ' + chaincodeType);
    console.log('fcn  : ' + fcn);
    console.log('args  : ' + args);
    if (!chaincodeName) {
      res.json(getErrorMessage('\'chaincodeName\''));
      return;
    }
    if (!chaincodeVersion) {
      res.json(getErrorMessage('\'chaincodeVersion\''));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage('\'channelName\''));
      return;
    }
    if (!chaincodeType) {
      res.json(getErrorMessage('\'chaincodeType\''));
      return;
    }
    if (!args) {
      res.json(getErrorMessage('\'args\''));
      return;
    }
  
    let message = await instantiate.instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, req.username, req.orgname);
    res.send(message);
};






exports.invoketransaction=  async (req,res) =>{
    console.log('==================== INVOKE ON CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.params.chaincodeName;
    var channelName = req.params.channelName;
    var fcn = req.body.fcn;
    
    var arg = req.body.args;
    var args=[arg.pid];
    console.log("args",args);
    console.log('channelName  : ' + channelName);
    console.log('chaincodeName : ' + chaincodeName);
    console.log('fcn  : ' + fcn);
    console.log('args  : ' , args);
    if (!chaincodeName) {
      res.json(getErrorMessage('\'chaincodeName\''));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage('\'channelName\''));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage('\'fcn\''));
      return;
    }
    if (!args) {
      res.json(getErrorMessage('\'args\''));
      return;
    }
  
    let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname);
    res.send(message);
};

  exports.querychaincode=  async(req,res) => {
      console.log('==================== QUERY BY CHAINCODE ==================');
      var channelName = req.params.channelName;
       var chaincodeName = req.params.chaincodeName;
      let args = req.query.args;
      let fcn = req.query.fcn;
      let peer = req.query.peer;
    
      console.log('channelName : ' + channelName);
      console.log('chaincodeName : ' + chaincodeName);
      console.log('fcn : ' + fcn);
      console.log('args : ' + args);
    
      if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
      }
      if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
      }
      if (!fcn) {
        res.json(getErrorMessage('\'fcn\''));
        return;
      }
      if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
      }
      args = args.replace(/'/g, '"');
      args = JSON.parse(args);
      console.log(args);
    
      let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
      res.send(message);
  };



  exports.queryBlock= async (req,res) =>  {
      console.log('==================== GET BLOCK BY NUMBER ==================');
      let blockId = req.params.blockId;
      let peer = req.query.peer;
      console.log('channelName : ' + req.params.channelName);
      console.log('BlockID : ' + blockId);
      console.log('Peer : ' + peer);
      if (!blockId) {
        res.json(getErrorMessage('\'blockId\''));
        return;
      }
    
      let message = await query.getBlockByNumber(peer, req.params.channelName, blockId, req.username, req.orgname);
      res.send(message);
  };



  exports.querybytransactionid= async (req, res) =>  {
    console.log('================ GET TRANSACTION BY TRANSACTION_ID ======================');
    console.log('channelName : ' + req.params.channelName);
    let trxnId = req.params.trxnId;
    let peer = req.query.peer;
    if (!trxnId) {
      res.json(getErrorMessage('\'trxnId\''));
      return;
    }
  
    let message = await query.getTransactionByID(peer, req.params.channelName, trxnId, req.username, req.orgname);
    res.send(message);
  };




  exports.querygetblockbyhash= async (req,res) => {
      console.log('================ GET BLOCK BY HASH ======================');
      console.log('channelName : ' + req.params.channelName);
      let hash = req.query.hash;
      let peer = req.query.peer;
      if (!hash) {
        res.json(getErrorMessage('\'hash\''));
        return;
      }
    
      let message = await query.getBlockByHash(peer, req.params.channelName, hash, req.username, req.orgname);
      res.send(message);
    };



    exports.querychannelinformation= async(req, res) =>  {
      console.log('================ GET CHANNEL INFORMATION ======================');
      console.log('channelName : ' + req.params.channelName);
      let peer = req.query.peer;
    
      let message = await query.getChainInfo(peer, req.params.channelName, req.username, req.orgname);
      res.send(message);
    };



    exports.getinstantiatedchaincode= async (req, res) =>  {
      console.log('================ GET INSTANTIATED CHAINCODES ======================');
      console.log('channelName : ' + req.params.channelName);
      let peer = req.query.peer;
    
      let message = await query.getInstalledChaincodes(peer, req.params.channelName, 'instantiated', req.username, req.orgname);
      res.send(message);
    };


 exports.fetchingchannels= async(req,res) =>  {
    console.log('================ GET CHANNELS ======================');
    console.log('peer: ' + req.query.peer);
    var peer = req.query.peer;
    if (!peer) {
      res.json(getErrorMessage('\'peer\''));
      return;
    }
  
    let message = await query.getChannels(peer, req.username, req.orgname);
    res.send(message);
  };


    exports.fetchingchaincodes = async (req, res) =>  {
      console.log('================ GET INSTANTIATED CHAINCODES ======================');
      console.log('channelName : ' + req.params.channelName);
      let peer = req.query.peer;
    
      let message = await query.getInstalledChaincodes(peer, req.params.channelName, 'instantiated', req.username, req.orgname);
      res.send(message);
    };


    function getErrorMessage(field) {
      var response = {
       success: false,
       message: field + ' field is missing or Invalid in the request'
     };
     return response;
    }