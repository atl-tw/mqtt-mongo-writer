var mqtt    = require('mqtt');
var mongoClient = require('mongodb').MongoClient;

//TODO verify whether PINGREQ packets are sent
var mqttClient  = mqtt.connect('ws://atliot.com:8080');

var insertDocument = function(db, document, callback) {
  var collection = db.collection('rawdata');
  collection.insert(document, function(err, result) {
    console.log("error is: " + err);
    callback(result);
  })
}
 
mqttClient.on('connect', function () {
  console.log('connected to mqtt message broker');
  mqttClient.subscribe('motion');
});
 
mqttClient.on('message', function (topic, message) {
  console.log('message received: ' + message);
  var jsonDoc = JSON.parse(message);
  mongoClient.connect('mongodb://localhost:27017/motionsensor', function(err, db) {
    console.log('connected to mongodb');
    insertDocument(db, jsonDoc, function(result){
      if (result === null) {
        console.log('successfully inserted document.');
      }

      //TODO don't believe this is how to properly close the connection.
      db.close();
    });
  });
});