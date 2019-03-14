// Cloud Code entry point
var security = require('./security/encryption');

Parse.Cloud.define("createPoll", async  (request) => {
   let a = security.GenerateKey('Mirthrttttttttttttttttttteyerthrhrthrhtca');
    let b = security.GenerateKey('Miiii');
    let c = security.GenerateKey('totototo');


    let encrypted = security.sign(a.privKey, '0123hello');


    let decrypted = security.verifySignature(a.publicKey,encrypted, '0123hello');

    console.log(decrypted);

   // security.GenerateKey('momo');
   //  security.GenerateKey('moadsasfafsafmo');
   // security.GenerateKey('mofasfagweweqemo');
   //  security.GenerateKey('d');
   // console.log(request.params.pollName, request.params.pollGroup);
})
