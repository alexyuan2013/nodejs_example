
process.stdin.setEncoding('utf-8')

process.stdin.on('readable', function(){
  let input = process.stdin.read()
  if(input !== null){
    process.stdout.write(input)
    let command = input.trim()
    if(command == 'exit'){
      process.exit(0)
    }
  }
})