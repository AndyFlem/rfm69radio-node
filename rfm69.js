module.exports = function(RED) {
  "use strict";

  const RFM69RADIO = require('rfm69radio');
  const rfm69radio = new RFM69RADIO();

  rfm69radio.initialize({
    address: 1,
    //encryptionKey: '0123456789abcdef', 
    verbose:false, 
  }); 

  function RFM69In(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    rfm69radio.registerPacketReceivedCallback(function(packet){
      node.send(packet);
    });      
  }
  RED.nodes.registerType("rfm69-in",RFM69In);

  function RFM69Out(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    node.on('input', function(msg) {       
      rfm69radio.broadcast(msg);
    });
  }
  RED.nodes.registerType("rfm69-out",RFM69Out);

  function RFM69Radio(config) {
    RED.nodes.createNode(this,config);
    this.spiBus=config.spiBus;
  }
  RED.nodes.registerType("rfm69-radio",RFM69Radio);
}
