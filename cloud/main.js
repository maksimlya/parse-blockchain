// Cloud Code entry point
var security = require('./security/encryption');

Parse.Cloud.define("createPoll", async  (request) => {
   let a = security.GenerateKey('Mirthrttttttttttttttttttteyerthrhrthrhtca');
    let b = security.GenerateKey('Miiii');
    let c = security.GenerateKey('totototo');


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
    }
    else return new Parse.Error("Group already exists..");
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
    var user = new Parse.User();
    user.set("username", request.params.username);
    user.set("password", request.params.password);
    //user.set("email", "email@example.com");

// other fields can be set just like with Parse.Object
    user.set("city", request.params.city);
    user.set("age", request.params.age);
    user.set("origin", request.params.origin);
    user.set('pubKey', key.publicKey);
    let groups = request.params.groups;
    user.set("groups", request.params.groups);
    try {
        await user.signUp();
        return "Success!";
    } catch (error) {
        // Show the error message somewhere and let the user try again.
        return new Parse.Error("Error: " + error.code + " " + error.message);
    }
});
