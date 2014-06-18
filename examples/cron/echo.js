var i = 0;
a = new Date();
fn = function() {
  i++
  // console.log('Hello world from echo.js:'+i)
  console.log('Hello world from echo.js:'+ new Date())
  if(i == 20) process.exit()
}
setInterval(fn,3000)


