'use strict';
var EnvisaLink = require('./envisalink.js');

module.exports = function (RED) {
  function EnvisaLinkOutNode(config) {
    RED.nodes.createNode(this, config);
    var _this = this;
    this.controller = config.controller,
    this.controllerConn = RED.nodes.getNode(this.controller);

    if (this.controllerConn) {
      this.status({ fill: 'orange', shape: 'ring', text: 'Connecting...' });
      this.controllerConn.register(this);
    } else {
      this.error(RED._('Missing controller configuration'));
    }

    this.on('input', function (msg) {
      _this.controllerConn.sendCommand(msg.payload);
      _this.send(msg);
    });

    this.on('close', function (done) {
       if (_this.controllerConn) {
         _this.controllerConn.deregister(_this, done);
       }
     });
  }

  RED.nodes.registerType('envisalink out', EnvisaLinkOutNode);
}
