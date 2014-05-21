mode = process.argv[process.argv.length-1]
if (mode === 'ok'){
  process.exit(0)
}else{
  process.exit(1)
}