let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let loop = async () => {
  for (let i = 0; i < 6; i++) {
    console.log(i)
    await sleep(1000)
  } 
}
loop()
