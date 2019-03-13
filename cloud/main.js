// Cloud Code entry point
var security = require('./security/encryption')


var encryptor = require('./security/encryption')

Parse.Cloud.define("createPoll", async  (request) => {
   let a = security.GenerateKey('Mirthrttttttttttttttttttteyerthrhrthrhtca');

    console.log(a);
   // security.GenerateKey('momo');
   //  security.GenerateKey('moadsasfafsafmo');
   // security.GenerateKey('mofasfagweweqemo');
   //  security.GenerateKey('d');
   // console.log(request.params.pollName, request.params.pollGroup);
})
