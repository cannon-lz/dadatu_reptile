async function test() {
  return 'Hello word';
}

async function doIt() {
  const result = await test();
  console.log(result);
}

doIt();
console.log("block");




