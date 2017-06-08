//callback的设计示例

var fib = function(n){
  if(n<2) return n
  return fib(n-1) + fib(n-2)
}

var Obj = function(){}

Obj.prototype.doSomething = function(arg1_){
  var callback_ = arguments[arguments.length - 1] //取最后一个参数
  callback = (typeof(callback_) == 'function' ? callback_ : null) //判断
  var arg1 = typeof arg1_ === 'number' ? arg1_ : null
  if(!arg1) {
    return callback(new Error('first arg missing or not a number')) //callback执行error情况
  }
  //异步执行，避免阻塞同步语句
  process.nextTick(function(){
    var data = fib(arg1)
    callback(null, data) //正确执行callback, error为null
  })
  console.log('doing calculation...')
}

var test = new Obj()
var number = 10

test.doSomething(number, function(error, value){
  if(error){
    console.error(error)
  } else {
    console.log('fibonaci value for %d is %d', number, value)
  }
})

console.log('called doSomething')