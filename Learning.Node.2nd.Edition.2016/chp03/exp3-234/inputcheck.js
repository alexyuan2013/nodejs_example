const util = require('util')
const eventEmitter = require('events').EventEmitter
const fs = require('fs')

exports.InputChecker = InputChecker

function InputChecker(name, file) {
  this.name = name
  this.writeStream = fs.createWriteStream('./' + file + '.txt',
    {'flags': 'a',
     'encoding': 'utf8',
     'mode': 0666
    }
  )
}

util.inherits(InputChecker, eventEmitter)
InputChecker.prototype.check = function(input){
  var command = input.toString().substr(0, 3)
  if(command == 'wr:') {
    this.emit('write', input.substr(3, input.length))
  } else if(command == 'en:'){
    this.emit('end')
  } else {
    this.emit('echo', input)
  }
}