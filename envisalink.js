'use strict'
var net = require('net')
var EventEmitter = require('events').EventEmitter
var util = require('util')
var tpidefs = require('./tpi.js')
var ciddefs = require('./cid.js');

function EnvisaLink (config) {
  EventEmitter.call(this)
  this.options = {
    host: config.host,
    port: config.port,
    password: config.password,
    zones: config.zones,
    partitions: config.partitions
  }
  this.pollId = undefined
}

util.inherits(EnvisaLink, EventEmitter)
module.exports = EnvisaLink

EnvisaLink.prototype.connect = function () {
  var _this = this;
  this.zones = {};
  this.partitions = {};
  this.users = {};
  this.systems = undefined;
  this.shouldReconnect = true;
  this.cid = {};

// CET: added log message Feb 8/2020
  this.emit('log-debug'," Making connection to host:"+ this.options.host +" port:"+ this.options.port);

  this.connection = net.createConnection({ port: this.options.port, host: this.options.host })

  this.connection.on('error', function (ex) {
    _this.emit('log-debug'," error connecting ");
    _this.emit('log-error', ' Envisalink Error connection error:' + ex)
//    _this.emit('log-error', '' + ex)
    _this.emit('error', ex)
  })

  this.connection.on('close', function (hadError) {
    clearInterval(this.pollId)
    setTimeout(function () {
      if (_this.shouldReconnect && (_this.connection === undefined || _this.connection.destroyed)) {
        _this.connect()
      }
    }, 5000)
  })

  this.connection.on('end', function () {
    _this.emit('log-debug'," Envisalink received end, disconnecting");
    _this.emit('disconnect')
  })

  this.connection.on('data', function (data) {
    var dataslice = data.toString().replace(/[\n\r]/g, '|').split('|');
    _this.emit('log-debug', " Entering on data connection... dataslice.length="+dataslice.length+" dataslice[0]='"+dataslice[0]+"'");

    for (var i = 0; i < dataslice.length; i++) {
      var datapacket = dataslice[i]
      if (datapacket !== '') {
        _this.emit('log-debug', " for Loop dataslice["+i+"]='"+dataslice[i]+"' datapacket='"+datapacket+"'");
	if ( datapacket.substring(0, 5) === 'Login' ) {
          _this.emit('log-trace', 'Login requested. Sending response. ' + _this.options.password)

  //        _this.emit('log-debug', 'Login requested. Sending response. "' + _this.options.password + '"')

          _this.sendCommand(_this.options.password)
	} else if ( ( datapacket.substring(0, 6) === 'FAILED' ) || ( datapacket.substring( 0, 9) === 'Timed Out' ) ) {
	  _this.emit('log-error', "Login failed!");
	  // The session will be closed.. not sure how to have this try and reconnect.
	} else if ( datapacket.substring(0, 2) === 'OK' ) {
	  // ignore, OK is good. or report successful connection.
          _this.emit('connected')
          _this.emit('log-trace', 'Successfully logged in. Requesting current state.')
        } else { 
	  var command_str = datapacket.match(/^%(.+)\$/); 	// pull out everything between the % and $

	  if ( command_str == null ) _this.emit('log-error', "Command format invalid! command='"+ datapacket +"'");

	  var command_array = command_str[1].split(','); 	// Element number 1 should be what was matched between the () in the above match. so everything between % and $
	  var command = command_array[0]; 			// The first part is the command.

          var tpi = tpidefs.tpicommands[command]


          if (tpi) {
	    _this.emit('log-debug', " looking up command command='"+ command +"' tpi.action='"+ tpi.action +"'");
            if (tpi.bytes === '' || tpi.bytes === 0) {
              _this.emit('log-warn', tpi.pre + ' - ' + tpi.post)
            } else {
              _this.emit('log-trace', tpi.pre + ' ' + command_str + ' ' + tpi.post)
              if (tpi.action === 'updatezone') {
// done done, not tested.
                updateZone(tpi, command_array)
              } else if (tpi.action === 'updatepartition') {
// done
                updatePartition(tpi, command_array)
              } else if (tpi.action === 'updatekeypad') {
// done callout completed, and tested.
                updateKeypad(tpi, command_array)
              } else if (tpi.action === 'cidEvent') {
// done
                cidEvent(tpi, command_array)
              } 
            }
          }
	}
      }
    }
  })

  function updateZone (tpi, data) {
// now, what I need to do here is parse the data packet for parameters, in this case it's one parameter an
// 8 byte HEX string little endian each bit represents a zone. If 1 the zone is active, 0 means not active.
    var zone_bits = data[1];
// now, zone_bits should be a hex string, little_endian of zones represented by bits.
// need to loop through, byte by byte, figure out whats Bits are set and 
// return an array of active zones.
// suggest finding the bits by taking a byte if it's not zero, do a modulo 2 on it, if the remainder is non-zero you have a bit
// then shift the remaining bits right 1, and increment your bit index count by one.
// When you do all 8 bits, move onto the next byte until no bytes exist.
// as it's little endian, you would start with the right most Byte. and move left.

 //   _this.emit('log-debug', "Starting zone_bits for loop zone_bits='"+ zone_bits +"'");

    var zone_array = []; 				// Define/initialize zone_array.
    for (var i=0; i<zone_bits.length; i=i+2) {  		// work from left to right, one byte at a time.
	var byte = parseInt( zone_bits.substr(i, 2), 16); // get the two character hex byte value into an int
	// sinze it's a byte, increment position by 8 bits, but since we're incrementing i by 2. for a 1 byte hex. 
	// we need to use a value of 4 to compensate. Then add 1, since we technically start counting our zones at 1, not zero. so but zero is zone 1.
	var position= ( i*4 )+1;  
// ( 64 - (14+2) * 4) + 1;
// ( 64 - 16*4) +1;
// ( 64 - 64) +1;
// ( 0 ) + 1;
// 1

// ( 64 - (12+2) * 4) + 1;
// ( 64 - 14*4 ) + 1;
// ( 64 - 56 ) + 1;
// ( 8 ) + 1;
// 9
    //    _this.emit('log-debug', "inside  zone_bits for loop enter subloop position="+ position +" byte='"+ byte +"' byte-original='"+ zone_bits.substr(i, 2) +"' i="+ i);
	for ( var n=byte; n>0; n=n>>1) {
		if ( ( n & 0x01 ) == 1 ) { // is the right most bit a 1?
			zone_array.push( position ); 
		}
		position++;
	}

    //    _this.emit('log-debug', "inside  zone_bits after Positio loop position="+ position +" byte='"+ byte +"'");

    }
    
  //  _this.emit('log-debug', "out of for loop, about to enter forEach loop");

    var z_string ="";
    var initialUpdate; // this isn't good. After the for each, initialUpdate will be the value of the last one... 

    zone_array.forEach( function( z,i,a ) { 
	z_string = z_string + z + ",";
	initialUpdate = _this.zones[z] === undefined;
	_this.zones[z] = { send: tpi.send, name: tpi.name, code: z };
    });
    if ( z_string.length > 0 ) {
       z_string = z_string.substring(0, z_string.length-1); // chop off last "," from string.
    } else {
       z_string = "";
    }

 //   _this.emit('log-debug', " string telling us which bits are 1 is '"+ z_string +"'");


 //   _this.emit('log-debug', "emitting zoneupdate string:{ zone: "+ z_string +", code: "+ data[0] +", status: '"+ tpi.name +"', initialUpdate: "+ initialUpdate +"}");

    _this.emit('zoneupdate',
          { zone: z_string,
            code: data[0],
            status: tpi.name,
            initialUpdate: initialUpdate 
    });
      
 //   _this.emit('log-debug', 'zone_string="'+ z_string +'"');

  }

  function updatePartition (tpi, data) {
// Unlike the code below, this Ademco pannel sends a array of bytes each one representing a partition and it's state. 
// Example:
// 0100010000000000
// so in the example above out of 8 partitions, partitions 1 and 3 are in state READY. 
// There is a table you can refer to in section 3.4 of EnvisaLink  Vista TPI programmer's document that lists
// the different values possible for each byte.

   var partition_string = data[1];
    
   for (var i=0; i<partition_string.length; i=i+2) { // Start at the begining, and move up two bytes at a time.
      var byte = parseInt( partition_string.substr(i, 2), 10); // convert hex (base 10) to int.
      var partition = (i/2)+1;
      if ( partition <= _this.options.partitions ) {
         var mode = modeToHumanReadable( byte );
         var initialUpdate = _this.partitions[partition] === undefined
         _this.partitions[partition] = { send: tpi.send, name: tpi.name, code: { "partition" : partition, "value" : mode } }
         _this.emit('partitionupdate', {
             partition: partition,
	     mode: mode,
             code: byte,
             status: tpi.name,
             initialUpdate: initialUpdate })
      }
   } 
  }

  function modeToHumanReadable (mode) {
    if (mode === 0) return 'AWAY'
    else if (mode === 1) return 'READY'
    else if (mode === 2) return 'READY-TO-ARM'
    else if (mode === 3) return 'NOT-READY'
    else if (mode === 4) return 'ARMED-STAY'
    else if (mode === 5) return 'ARMED-AWAY'
    else if (mode === 6) return 'ZERO-ENTRY-STAY'
    else if (mode === 7) return 'EXIT-DELAY'
    else if (mode === 8) return 'ALARM'
    else if (mode === 9) return 'ALARM-MEMORY'
    else return 'ZERO-ENTRY-AWAY'
  }

  function updateKeypad(tpi, data) {

    var partition = data[1]; // one byte field indicating which partition the update applies to.
    var initialUpdate = _this.partitions[partition] === undefined;
// ICON bit field is as follows:
// 15: ARMED STAY
// 14: LOW BATTERY
// 13: FIRE
// 12: READY
// 11: not used
// 10: not used
// 09: CHECK ICON - SYSTEM TROUBLE
// 08: ALARM (FIRE ZONE)
// 07: ARMED (ZERO ENTRY DELAY)
// 06: not used
// 05: CHIME
// 04: BYPASS (Zones are bypassed)
// 03: AC PRESENT
// 02: ARMED AWAY
// 01: ALARM IN MEMORY
// 00: ALARM (System is in Alarm
    var ICON = data[2]; //two byt, HEX, representation of the bitfield.
    var zone = data[3]; // one byte field, representing extra info, either the user or the zone.
    var beep = data[4]; // information for the keypad on how to beep.
    var keypad_txt = data[5]; // 32 byte ascii string, a concat of 16 byte top and 16 byte bottom of display
    var icon_array = [];
    var position = 0;// Start at the right most position, Little endian 0.

// This loop, take a two byte hex string, and for every bit set to one in the HEX string
// adds an element to an array indicating the position of the bit set to one... LittleEndian.
    for ( var n=parseInt(ICON,16); n>0; n=n>>1) {
	if ( ( n & 0x01 ) == 1 ) { // is the right most bit a 1?
		icon_array.push( position ); 
	}
	position++;
    }

    if (partition <= _this.options.partitions ) {
      var initialUpdate = _this.partitions[partition] === undefined;
      _this.partitions[partition] = { send: tpi.send, name: tpi.name, code: data };
      _this.emit('keypadupdate',
        { partition: partition,
	  code: {
	    icon: icon_array,
	    zone: zone,
	    beep: beep,
	    txt: keypad_txt
	  },
	  status: tpi.name,
	  initialUpdate: initialUpdate });
    }
  }

  function cidEvent( tpi, data ) {
	var cid = data[1];
    
	var qualifier = cid.substr(0,1);
	if ( qualifier == 1 ) { // Event
		qualifier = "Event";
	} else if ( qualifier == 3 ) { // Restoral
		qualifier = "Restoral";
	} else { // Unknown Qualifier!!
		_this.emit('log-error', " Unrecognized qualifier '"+ qualifier +"' received from Panel!");
	}
	var code = cid.substr(1,3);
	var partition = cid.substr(4,2);
	var zone_or_user = cid.substr(6,3);
	var cid_obj = ciddefs.cid_event_def[code];
	
//	_this.emit('log-debug', " code='"+ code +"' qualifier='"+ qualifier +"' partition='"+ partition +"' zone_or_user='"+ zone_or_user +"' cid_obj="+ cid_obj);


	var initialUpdate = _this.cid === undefined;
	_this.cid = { send: tpi.send, name: tpi.name, code: cid, qualifier: qualifier, code: code, type: cid_obj.type, subject: cid_obj.msg_subject, partition: partition };
	var an_object = {
		qualifier: qualifier,
                code: cid,
                partition: partition,
                type: cid_obj.type,
                subject: cid_obj.msg_subject,
                description: cid_obj.txt,
                status: tpi.name,
                initialUpdate: initialUpdate
	};
	an_object[cid_obj.type] = zone_or_user;
	_this.emit('cidupdate',an_object);
  }


}

EnvisaLink.prototype.disconnect = function () {
  clearInterval(this.pollId)
  this.shouldReconnect = false
  if (this.connection && !this.connection.destroyed) {
    this.connection.end()
    return false
  } else {
    return true
  }
}

EnvisaLink.prototype.sendCommand = function (command) {
// CET: Feb 8/2020
// Since I took this from the DSC version... the code below uses a checksum. I have commented that out
// as there is no checksum for the ademco version.
//  var checksum = 0
//  for (var i = 0; i < command.length; i++) {
//    checksum += command.charCodeAt(i)
//  }

//  checksum = checksum.toString(16).slice(-2).toUpperCase()
//  this.connection.write(command + checksum + '\r\n')
  this.connection.write(command + '\r\n')
}
