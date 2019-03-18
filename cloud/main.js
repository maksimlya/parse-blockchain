// Cloud Code entry point
const security = require('./security/encryption');
const axios = require("axios");

Parse.Cloud.define("createPoll", async  () => {
   let a = security.GenerateKey('Mirthrttttttttttttttttttteyerthrhrthrhtca');
  //  let b = security.GenerateKey('Miiii');
   // let c = security.GenerateKey('totototo');


    let encrypted = security.sign(a.privKey, '0123hello');


    return security.verifySignature(a.publicKey,encrypted, '0123hello');

});

Parse.Cloud.define('createGroup', async (request) => {
   let groupName = request.params.groupName;
   const groups = Parse.Object.extend("Groups");
   const query = new Parse.Query(groups);

    query.equalTo("name", groupName);
    const results = await query.find();

    if(results.length === 0) {
        let group = new groups();
        group.set("name", groupName);
        group.save();
        return "Success";
    }
    else return new Parse.Error("Group already exists..");
});

Parse.Cloud.define('getSortedUsers', async (request) => {
    let users = [];
    const getter = Parse.Object.extend("User");
    const query = new Parse.Query(getter);

    if(request.params.age) {
        let sign = request.params.age[0];
        let age = request.params.age.substr(1,request.params.age.length);
        if(sign === '>')
            query.greaterThanOrEqualTo('age', age);
        if(sign === '<')
            query.lessThanOrEqualTo('age', age);
    }
    if(request.params.origin)
        query.equalTo('origin', request.params.origin);
    if(request.params.group)
        query.contains('groups', request.params.group);
    if(request.params.city)
        query.equalTo('city', request.params.city);
    if(request.params.gender)
        query.equalTo('gender', request.params.gender);

    const result = await query.find();
    result.map(function (res) {
        console.log(res.get('username'), res.get('age'));
    });


});

Parse.Cloud.define('getGroups', async (request) => {
    let groupsArr = [];
    const groups = Parse.Object.extend("Groups");
    const query = new Parse.Query(groups);

    const results = await query.find();

    if(results.length !== 0) {
        for(let group of results){
            groupsArr.push(group.get('name'));
        }
        return groupsArr;
    }
    else return new Parse.Error("No Groups exist....");
});

Parse.Cloud.define('createUser', async (request) => {
    let hashString = request.params.username + request.params.password + request.params.city + request.params.age + request.params.origin + request.params.id + request.params.secret;
    console.log(hashString);
    let key = security.GenerateKey(hashString);
    console.log(key)
    var user = new Parse.User();
    user.set('username', request.params.username);
    user.set('password', request.params.password);
    user.set('gender', request.params.gender);
    //user.set("email", "email@example.com");

// other fields can be set just like with Parse.Object
    user.set('city', request.params.city);
    user.set('age', request.params.age);
    user.set('origin', request.params.origin);
    user.set('pubKey', key.publicKey);
    let groups = request.params.groups;
    user.set('groups', request.params.groups);
    try {
        await user.signUp();
        return 'Success!';
    } catch (error) {
        // Show the error message somewhere and let the user try again.
        return new Parse.Error('Error: ' + error.code + " " + error.message);
    }
});

Parse.Cloud.define('sendVote', async (request) => {
    let hashString = request.params.username + request.params.password + request.params.city + request.params.age + request.params.origin + request.params.id + request.params.secret;
    let key = security.GenerateKey(hashString);
    let pubKey = key.publicKey;
    let url = 'http://localhost:8080/newTransaction';
    let data = {
        "From": pubKey ,
        "To": request.params.voteTarget,
        "Amount": 1,
        "Tag" : request.params.tag
    };
    let log = await axios({
        method: 'post',
        url: url,
        data: data
    });
   // let signature = await security.sign(key.privKey,log.data.TxHash);
    let signature = await security.sign(key.privKey,log.data.TxHash);
console.log(signature)
    url = 'http://localhost:8080/addTransaction';
    data = {
        "TxHash": log.data.TxHash,
        "Signature": signature
    };

    let result = await axios({
        method: 'post',
        url: url,
        data: data
    });

    // console.log(key.publicKey,key.privKey);
    // console.log(log.data.TxHash);
    //
    // console.log(security.verifySignature(key.publicKey,signature,log.data.TxHash));
});

Parse.Cloud.define('verifySignature', async (request) => {
    let pubKey = request.params.pubKey;
    let signature = request.params.signature;
    let ckeckHash = request.params.hash;
    return security.verifySignature(pubKey,signature,ckeckHash);
});
