var mqtt    = require('mqtt');
var mongoClient = require('mongodb').MongoClient;
var uuid = require('uuid');

var mqttClient  = mqtt.connect('ws://atliot.com:8080', {clientId: 'mongoClient_' + uuid.v1()});

var insertDocument = function(db, document, callback) {
  var collection = db.collection('rawdata');
  collection.insert(document, function(err, result) {
    callback(result);
  })
}
 
mqttClient.on('connect', function () {
  console.log('mongoClient connected to mosquitto broker.')
  mqttClient.subscribe('motion');
});
 
mqttClient.on('message', function (topic, message) {
  var jsonDoc = JSON.parse(message);
  mongoClient.connect('mongodb://localhost:27017/motionsensor', function(err, db) {
    insertDocument(db, jsonDoc, function(result){
      db.close();
    });
  });
});

mqttClient.on('close', function() {
  console.log('mongoClient disconnected from mosquitto broker')
});
