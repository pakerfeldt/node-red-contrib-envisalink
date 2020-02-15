exports.applicationcommands = {
  '000': {
    'name': 'Poll',
    'pre': 'Polled',
    'bytes': 0,
    'post': '',
    'send': '500000',
    'action': 'forward'
  },
  '001': {
    'name': 'Status Report',
    'pre': 'Status Report Requested',
    'bytes': 0,
    'post': '',
    'send': '500001',
    'action': 'forward'
  },
  '008': {
    'name': 'Dump Zone Timers',
    'pre': 'Request Dump of Zone Timers',
    'bytes': 0,
    'post': '',
    'send': '500008',
    'action': 'forward'
  },
  '005': {
    'name': 'Network Login',
    'pre': 'Checking password...',
    'bytes': '1-6',
    'post': '',
    'send': '500005',
    'action': 'checkpassword'
  },
  '010': {
    'name': 'Set Time and Date',
    'pre': 'Setting time and date to:',
    'bytes': 10,
    'post': '',
    'send': '500010',
    'action': 'forward'
  },
  '020': {
    'name': 'Command Output Control',
    'pre': 'Activating',
    'bytes': 2,
    'post': 'Command Output',
    'send': '500020',
    'action': 'forward'
  },
  '030': {
    'name': 'Partition Arm Control',
    'pre': 'Arming Partition',
    'bytes': 1,
    'post': '',
    'send': '500030',
    'action': 'forward'
  },
  '031': {
    'name': 'Partition Arm Control - Stay Arm',
    'pre': 'Arming Partition',
    'bytes': 1,
    'post': 'to STAY.',
    'send': '500031',
    'action': 'forward'
  },
  '032': {
    'name': 'Partition Arm Control - Zero Entry Delay',
    'pre': 'Arming Partition',
    'bytes': 1,
    'post': 'with ZERO Entry Delay',
    'send': '500032',
    'action': 'forward'
  },
  '033': {
    'name': 'Partition Arm Control - With Code',
    'pre': 'Arming Parition',
    'bytes': 7,
    'post': 'with Code',
    'send': '500033',
    'action': 'forward'
  },
  '040': {
    'name': 'Partition Disarm Control',
    'pre': 'Disarming Partition',
    'bytes': 7,
    'post': '',
    'send': '500040',
    'action': 'forward'
  },
  '055': {
    'name': 'Time Stamp Control',
    'pre': 'Time Stamp Control to:',
    'bytes': 1,
    'post': '',
    'send': '500055',
    'action': 'forward'
  },
  '056': {
    'name': 'Time Broadcast Control',
    'pre': 'Time Broadcast Control to:',
    'bytes': 1,
    'post': '',
    'send': '500056',
    'action': 'forward'
  },
  '057': {
    'name': 'Temperature Broadcast Control',
    'pre': 'Temperature Broadcast Control to:',
    'bytes': 1,
    'post': '',
    'send': '500057',
    'action': 'forward'
  },
  '060': {
    'name': 'Trigger Panic Alarm',
    'pre': 'TRIGGERING PANIC ALARM:',
    'bytes': 1,
    'post': '',
    'send': '500060',
    'action': 'forward'
  },
  '070': {
    'name': 'Single Keystroke - Partition 1',
    'pre': 'Partition 1 keystroke:',
    'bytes': 1,
    'post': 'requested.',
    'send': '500070',
    'action': 'forward'
  },
  '071': {
    'name': 'Send Keystroke String',
    'pre': 'Paritition 1 keystroke string:',
    'bytes': '2-7',
    'post': 'requested',
    'send': '500071',
    'action': 'forward'
  },
  '072': {
    'name': 'Enter User Code Programming (*5)',
    'pre': 'User Code Programming',
    'bytes': 1,
    'post': 'requested.',
    'send': '500072',
    'action': 'forward'
  },
  '073': {
    'name': 'Enter User Programming (*6)',
    'pre': 'User Programming',
    'bytes': 1,
    'post': 'requested.',
    'send': '500073',
    'action': 'forward'
  },
  '074': {
    'name': 'Keep Alive',
    'pre': 'Keeping Alive Partition',
    'bytes': 1,
    'post': '.',
    'send': '500074',
    'action': 'forward'
  },
  '200': {
    'name': 'Code Send',
    'pre': 'Send',
    'bytes': '4-6',
    'post': 'Code in Response to Request',
    'send': '500200',
    'action': 'forward'
  }
}

exports.tpicommands = {
  '00': {
    'name': 'Virtual Keypad Update',
    'pre': 'Command',
    'bytes': -1,
    'post': 'Acknowledged',
    'send': '',
    'action': 'updatekeypad'
  },
  '01': {
    'name': 'Zone Status Change',
    'pre': 'Zone Update',
    'bytes': 8,
    'post': 'has been detected.',
    'send': '',
    'action': 'updatezone'
  },
  '02': {
    'name': 'Partition State Change',
    'pre': 'Partition Change',
    'bytes': 8,
    'post': 'has been detected.',
    'send': '',
    'action': 'updatepartition'
  },
  '03': {
    'name': 'Realtime CID Event',
    'pre': 'CID Event:',
    'bytes': 5,
    'post': '',
    'send': '',
    'action': 'cidEvent'
  },
  'FF': {
    'name': 'Envisalink Zone Timer Dump',
    'pre': 'Zone Timer Dump:',
    'bytes': 256,
    'post': '',
    'send': '',
    'action': ''
  }
}
