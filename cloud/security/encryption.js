var sha256 = require('js-sha256');
var bigInt = require('big-integer');

function GenerateKey(hash) {
    let sha = sha256.create();
    sha256.update(hash);
    let mySha = sha.hex();
    console.log((mySha));

    let y = bigInt(0);
    let one = bigInt(1);

    for(let i = 0 ; i < mySha.length ; i ++){
        console.log(parseInt(mySha[i],16));
    }
}

exports.GenerateKey =  GenerateKey