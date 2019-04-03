var sha256 = require('js-sha256');
var bigInt = require('big-integer');
var base64js = require('js-base64').Base64;

const expSize = 22;


function sign(privKey, value){
    let length = privKey.substr(11,2);

    let dValue = privKey.substr(13,length);
    let nValue = [];
    nValue.push(privKey.substr(0,10));

    nValue.push(privKey.substr(13+parseInt(length),privKey.length));

    let nFunc = nValue.join('');

    let nNum = bigInt(nFunc,16);
    let dNum = bigInt(dValue,16);


    let newValue = bigInt(value,16);



    let encrypted = newValue.modPow(dNum,nNum);


    // Returns Signature
    return base64js.encode(encrypted);

}



function decrypt(key, value){

        let length = key[11];


        let eValue = key.substr(12,length);
        let nValue = [];
        nValue.push(key.substr(0,10));

        nValue.push(key.substr(12+parseInt(length),key.length));

        let nFunc = nValue.join('');

        let nNum = bigInt(nFunc,16);
        let eNum = bigInt(eValue,16);

        let val = base64js.decode(value);



         // let arr=[];
         // for(let i=0; i<val.length; i++) {
         //     arr.push(bigInt(val[i],16));
         // }


         let decrypted = bigInt(val);

        // for(let i = 0 ; i < arr.length ; i++) {
        //     decrypted.push(String.fromCharCode(arr[i].modPow(eNum,nNum)));
        // }
        // return decrypted.join('');

        decrypted = decrypted.modPow(eNum,nNum);
        return decrypted.toString(16);
}


function verifySignature(pubKey, signature, message){

    let length = pubKey[11];


    let eValue = pubKey.substr(12,length);
    let nValue = [];
    nValue.push(pubKey.substr(0,10));

    nValue.push(pubKey.substr(12+parseInt(length),pubKey.length));

    let nFunc = nValue.join('');

    let nNum = bigInt(nFunc,16);
    let eNum = bigInt(eValue,16);
    let val = bigInt(base64js.decode(signature));



    // let arr=[];
    // for(let i=0; i<val.length; i++) {
    //     arr.push(bigInt(val[i],16));
    // }


    let decrypted = val.modPow(eNum,nNum);
   // console.log(decrypted);

    // for(let i = 0 ; i < arr.length ; i++) {
    //     decrypted.push(String.fromCharCode(arr[i].modPow(eNum,nNum)));
    // }


    return decrypted.toString(16) === message;
}

function GenerateKey(hash) {
    let sha = sha256.create();
    sha.update(hash);
    let mySha = sha.array();


    let y = bigInt(0);
    let one = bigInt(1);

     for (let i = 0 ; i < mySha.length ; i ++) {
         let tmp = bigInt(mySha[i]);
         let exp = bigInt(expSize);

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


     let n = aNum.multiply(bNum);
     let f = aNum.subtract(bigInt.one).multiply(bNum.subtract(bigInt.one));

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

    //console.log(d,e)

    pKey.push(nFunc.substr(0,10));
    pKey.push('g');
    pKey.push(privateLength);
    pKey.push(privateValue);
    pKey.push(nFunc.substr(10,nFunc.length-10));


    let privKey = pKey.join('');

    let pubKey = [];

    pubKey.push(nFunc.substr(0,10));
    pubKey.push('a');
    pubKey.push(publicLength);
    pubKey.push(publicValue);
    pubKey.push(nFunc.substr(10,nFunc.length-10));

    let publicKey = pubKey.join('');

    return {publicKey,privKey};


}

exports.GenerateKey =  GenerateKey;
exports.sign =  sign;
exports.decrypt = decrypt;
exports.verifySignature = verifySignature;
