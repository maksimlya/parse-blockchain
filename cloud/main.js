// Cloud Code entry point

var encryptor = require('./security/encryption')

Parse.Cloud.define("createPoll", async  (request) => {
    console.log((security.GenerateKey('momo')));
})
