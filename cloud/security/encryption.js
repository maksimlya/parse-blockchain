var sha256 = require('js-sha256');
var bigInt = require('big-integer');

function GenerateKey(hash) {
    let sha = sha256.create();
    sha.update(hash);
    let mySha = sha.array();



    let y = bigInt(0);
    let one = bigInt(1);

     for (let i = 0 ; i < mySha.length ; i ++) {
         let tmp = bigInt(mySha[i]);
         let exp = bigInt(22);

         let lol = tmp.pow(exp);
         y = y.add(tmp.pow(exp));

     }



     let aNum = y;
     let bNum = y.divide(bigInt(2));



     while(!aNum.isPrime()){

         aNum = aNum.add(bigInt.one);
     }



     while (!bNum.isPrime()){
         bNum = bNum.add(bigInt.one);
     }

   // console.log(aNum,bNum);

     let n = aNum.multiply(bNum);
     let f = aNum.subtract(bigInt.one).multiply(bNum.subtract(bigInt.one));
   // console.log(f,n);
     let e = bigInt(13);

     let z = bigInt.gcd(e,f);

     while (!z.eq(bigInt.one) && e.lt(f)) {
         e =  e.add(bigInt.one)
            z = bigInt.gcd(e,f);

        }

        let d = e.modInv(f);

    let nFunc = n.toString(16);
    let publicValue = e.toString(16);
    let publicLength = e.toString(16).length;
    let privateValue = d.toString(16);
    let privateLength = d.toString(16).length;

    let pKey = [];

    pKey.push(nFunc.substr(0,10));
    pKey.push(privateLength);
    pKey.push(privateValue);
    pKey.push(nFunc.substr(10,nFunc.length-10));

    let privKey = pKey.join('');

    let pubKey = [];

    pubKey.push(nFunc.substr(0,10));
    pubKey.push(publicLength);
    pubKey.push(publicValue);
    pubKey.push(nFunc.substr(10,nFunc.length-10));


    let publicKey = pubKey.join('');



    return {publicKey,privKey};


}
//
// function ascii_to_hexa(str)
// {
//     var arr1 = [];
//     for (var n = 0, l = str.length; n < l; n ++)
//     {
//         var hex = Number(str.charCodeAt(n)).toString(16);
//         arr1.push(hex);
//     }
//     return arr1.join('');
// }

exports.GenerateKey =  GenerateKey
