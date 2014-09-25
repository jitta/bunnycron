console.log('Normal 1')
console.error('Error 2')
setTimeout(function (){
  console.log('Normal 3')
  console.error('Error 4')
}, 10)

setTimeout(function (){
  console.error('Error 5')
  console.log('Normal 6')
}, 20)
