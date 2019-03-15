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

