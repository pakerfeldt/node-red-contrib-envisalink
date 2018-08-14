'use strict'
var EnvisaLink = require('./envisalink.js')

module.exports = function (RED) {
  function EnvisaLinkControllerNode (config) {
    this.node = RED.nodes.createNode(this, config)
    var _this = this
    this.host = config.host
    this.port = config.port
    this.password = this.credentials.password
    config.password = this.password
    config.zones = config.zones
    config.atomicEvents = false
    config.partitions = config.partitions
    this.connected = false
    this.connecting = false

    this.el = new EnvisaLink(config)

    this.users = {}

    this.register = function (elNode) {
      _this.users[elNode.id] = elNode
      if (Object.keys(_this.users).length === 1) {
        if (!_this.connected && !_this.connecting) {
          _this.connecting = true
          _this.el.connect()
        }
      } else if (_this.connected) {
        elNode.status({ fill: 'green', shape: 'dot', text: 'Connected' })
      } else if (!_this.connecting) {
        _this.connecting = true
        _this.el.connect()
      }
    }

    this.deregister = function (elNode, done) {
      delete _this.users[elNode.id]
      if (_this.closing) {
        return done()
      }

      if (Object.keys(_this.users).length === 0) {
        _this.done = done
        _this.el.disconnect()
      } else {
        done()
      }
    }

    this.el.on('connected', function () {
      _this.connected = true
      _this.connecting = false
      for (var id in _this.users) {
        if (_this.users.hasOwnProperty(id)) {
          _this.users[id].status({ fill: 'green', shape: 'dot', text: 'Connected' })
        }
      }
    })

    this.el.on('error', function (ex) {
      _this.connected = false
      _this.connecting = false
      for (var id in _this.users) {
        if (_this.users.hasOwnProperty(id)) {
          _this.users[id].status({ fill: 'red', shape: 'ring', text: 'Disconnected' })
        }
      }
    })

    this.el.on('log-trace', function (text) {
      _this.trace(RED._(text))
    })

    this.el.on('log-debug', function (text) {
      _this.log(RED._(text))
    })

    this.el.on('log-warn', function (text) {
      _this.warn(RED._(text))
    })

    this.el.on('log-error', function (text) {
      _this.error(RED._(text))
    })

    this.el.on('zoneupdate', function (update) {
      for (var id in _this.users) {
        if (_this.users.hasOwnProperty(id)) {
          _this.users[id].emit('el-zoneupdate', update)
        }
      }
    })

    this.el.on('partitionupdate', function (update) {
      for (var id in _this.users) {
        if (_this.users.hasOwnProperty(id)) {
          _this.users[id].emit('el-partitionupdate', update)
        }
      }
    })

    this.el.on('partitionuserupdate', function (update) {
      for (var id in _this.users) {
        if (_this.users.hasOwnProperty(id)) {
          _this.users[id].emit('el-partitionuserupdate', update)
        }
      }
    })

    this.el.on('systemupdate', function (update) {
      for (var id in _this.users) {
        if (_this.users.hasOwnProperty(id)) {
          _this.users[id].emit('el-systemupdate', update)
        }
      }
    })

    this.sendCommand = function (command) {
      this.el.sendCommand(command)
    }.bind(this)

    this.el.on('disconnect', function () {
      if (_this.done !== undefined) {
        _this.done()
        _this.done = null
      }
      _this.connected = false
      _this.connecting = false

      _this.log(RED._('Disconnected from ' + _this.host + ':' + _this.port))
      for (var id in _this.users) {
        if (_this.users.hasOwnProperty(id)) {
          _this.users[id].status({ fill: 'red', shape: 'ring', text: 'Disconnected' })
        }
      }
    })

    this.on('close', function (done) {
      _this.log(RED._('Closing Envisalink', {}))
      _this.closing = true
      _this.connected = false
      _this.connecting = false
      _this.done = done
      var wasDisconnected = _this.el.disconnect()
      if (wasDisconnected) {
        _this.done = null
        done()
      }
    })
  }

  RED.nodes.registerType('envisalink-controller', EnvisaLinkControllerNode, {
    credentials: {
      password: { type: 'password' }
    }
  })
}
