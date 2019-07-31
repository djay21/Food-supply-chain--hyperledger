var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

var file = 'network-config%s.yaml';

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');
// indicate to the application where the setup file is located so it able
// to have the hfc load it to initalize the fabric client instance
hfc.setConfigSetting('network-connection-profile-path',path.join(__dirname, 'artifacts' ,file));
hfc.setConfigSetting('foodproducer-connection-profile-path',path.join(__dirname, 'artifacts', 'foodproducer.yaml'));
hfc.setConfigSetting('distributor-connection-profile-path',path.join(__dirname, 'artifacts', 'distributor.yaml'));
hfc.setConfigSetting('foodprocessor-connection-profile-path',path.join(__dirname, 'artifacts', 'foodprocessor.yaml'));
hfc.setConfigSetting('retailer-connection-profile-path',path.join(__dirname, 'artifacts', 'retailer.yaml'));
hfc.setConfigSetting('consumer-connection-profile-path',path.join(__dirname, 'artifacts', 'consumer.yaml'));

// some other settings the application might need to know
hfc.addConfigFile(path.join(__dirname, 'config.json'));