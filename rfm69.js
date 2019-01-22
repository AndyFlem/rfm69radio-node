module.exports = function(RED) {
  "use strict";

  const RFM69RADIO = require('rfm69radio'); 

  function RFM69In(config) {
    RED.nodes.createNode(this,config);
    var node = this;

    node.radio_node=RED.nodes.getNode(config.radio);
    var radio=node.radio_node.radio;

    radio.registerPacketReceivedCallback(function(packet){
      node.send(packet);
    });      
  }
  RED.nodes.registerType("rfm69-in",RFM69In);

  function RFM69Out(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    
    node.radio_node=RED.nodes.getNode(config.radio);
    var radio=node.radio_node.radio;

    node.toAddress=numberOrDefault(config.toAddress, 255);
    node.attempts=numberOrDefault(config.attempts, 3);

    node.on('input', function(msg) {
      if (node.toAddress === 255){
        radio.broadcast(msg.payload)
        .catch(err=>this.error(`Error sending packet.  (${err})`));
      } else {
        radio.send({toAddress: node.toAddress, attempts: node.attempts, payload: msg.payload})
        .catch(err=>this.error(`Error sending packet.  (${err})`));
      }      
    });
  }
  RED.nodes.registerType("rfm69-out",RFM69Out);

  function RFM69Radio(config) {
    RED.nodes.createNode(this,config);
    
    this.radio = new RFM69RADIO();
    
    this.address=numberOrDefault(config.address, 1);
    this.networkID=numberOrDefault(config.networkID, 100);
    this.spiBus=numberOrDefault(config.spiBus, 0);
    this.spiDevice=numberOrDefault(config.spiDevice, 0);
    this.isRFM69HW=config.isRFM69HW;
    if (typeof this.isRFM69HW === 'undefined') {
      this.isRFM69HW = true;
    } 
    this.powerLevelPercent=numberOrDefault(config.powerLevelPercent, 70);
    this.interruptPin=numberOrDefault(config.interruptPin, 24);
    this.resetPin=numberOrDefault(config.resetPin, 5);
    this.promiscuousMode=config.promiscuousMode;
    if (typeof this.promiscuousMode === 'undefined') {
      this.promiscuousMode = true;
    } 
    this.encryptionKey=config.encryptionKey
    if (typeof this.encryptionKey === 'undefined') {
      this.encryptionKey=0;
    }
    this.autoAcknowledge=config.autoAcknowledge;
    if (typeof this.autoAcknowledge === 'undefined') {
      this.autoAcknowledge = true;
    } 

    const setup={
      address: this.address,
      networkID: this.networkID,
      spiBus: this.spiBus,
      spiDevice: this.spiDevice,
      isRFM69HW: this.isRFM69HW,
      powerLevelPercent: this.powerLevelPercent,
      interruptPin: this.interruptPin,
      resetPin: this.resetPin,
      promiscuousMode: this.promiscuousMode,
      encryptionKey: this.encryptionKey,
      autoAcknowledge: this.autoAcknowledge,
      verbose:false,
    }

    this.radio.initialize(setup)
    .catch(err=>this.error(`Error connecting to rfm69 radio. Check your wiring, SPI bus and device numbers and pin settings. (${err})`));

    
  }
  RED.nodes.registerType("rfm69-radio",RFM69Radio);
}

function numberOrDefault(val, defaultVal){
  if (typeof val === 'undefined') {
    val = defaultVal;
  } else if (typeof val === 'string') {
    val = Number(val);
    if (isNaN(val)) {
      val = defaultVal;
    }
  }
  return val;
}