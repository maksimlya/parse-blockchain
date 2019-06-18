// Cloud Code entry point
const security = require('./security/encryption');
const axios = require("axios");
var sha256 = require('js-sha256');

const blockchainUrl = 'https://blockchain-layer.herokuapp.com/';


let keyPair = security.GenerateKey('ThisIsBallotNumber1');
let myKey = '33b02183dba1d072dc7f337013b6bb191fb168b86971feb48f5b5ca3a7da1952c75558bea8b7d1bdf5396fcc7099';



Parse.Cloud.define("createPoll", async  (request) => {

    console.log('IN CREATE POLL ========');
    let pollTag = request.params.tag;


    let user = request.user.get('username');

    let polls = Parse.Object.extend('Polls');
    let choiceDescriptions = Parse.Object.extend('ChoiceDescriptions');

    let query = new Parse.Query(polls);

    query.equalTo('pollTag',pollTag);

    let result = await query.find();
    console.log(result);
    if(result.length > 0)
        return 'Poll with same tag already exists... Aborting......';


    let users = await getUsersByGroup(request.params.group);
    console.log(users);
    let sha = sha256.create();
    let ss = users.join(",");
    sha.update(ss);
    let mySha = sha.hex();

    console.log(ss);

    let signature = security.sign(keyPair.privKey, mySha);


    let pollName = request.params.name;
    let description = request.params.desc;
    let choices = request.params.choices;


    let url = blockchainUrl + '/generateTokens';
    let data = {
        "Tag": pollTag ,
        "Voters": users,
        "Signature": signature

    };
    let log = await axios({  // TODO - veify poll creation on blockchain.
        method: 'post',
        url: url,
        data: data
    });



    let poll = new polls();

    let choiceNames = []

    for(let choice of choices){
        let desc = new choiceDescriptions();
        desc.set('choice',choice.name);
        desc.set('description',choice.description);
        desc.set('image',choice.img);
        desc.save();
        choiceNames.push(choice.name);
    }

    poll.set('pollName',pollName);
    poll.set('creator',user);
    poll.set('pollTag', pollTag);
    poll.set('pollGroup', request.params.group);
    poll.set('description', description);
    poll.set('choices', choiceNames);
    poll.save();

    return 'Poll was created successfully.';

});


Parse.Cloud.define('largeBlock', async (request) => {
    let pollTag = request.params.tag;

    let user = request.user.get('username');

    let polls = Parse.Object.extend('Polls');

    let query = new Parse.Query(polls);

    query.equalTo('pollTag',pollTag);

    let result = await query.find();
    console.log(result);
    if(result.length > 0)
        return 'Poll with same tag already exists... Aborting......';


    let users = await getUsersByGroup(request.params.group);
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    users = users.concat(users)
    console.log(users);
    let sha = sha256.create();
    let ss = users.join(",");
    sha.update(ss);
    let mySha = sha.hex();

    console.log(ss);

    let signature = security.sign(keyPair.privKey, mySha);


    let pollName = request.params.name;
    let description = request.params.desc;
    let choices = request.params.choices;


    let url = blockchainUrl + '/generateTokens';
    let data = {
        "Tag": pollTag ,
        "Voters": users,
        "Signature": signature

    };
    let log = await axios({  // TODO - veify poll creation on blockchain.
        method: 'post',
        url: url,
        data: data
    });



    let poll = new polls();

    poll.set('pollName',pollName);
    poll.set('creator',user);
    poll.set('pollTag', pollTag);
    poll.set('pollGroup', request.params.group);
    poll.set('description', description);
    poll.set('choices', choices);
    poll.save();

    return 'Poll was created successfully.';
})



// Parse.Cloud.define('getUsersByGroup', async(request) => {
//     let grpName = request.params.group;
//
//     let users = Parse.Object.extend('User');
//
//     let pubKeys = [];
//
//     let query = new Parse.Query(users);
//     console.log(grpName);
//     query.containedIn('groups',[grpName]);
//     let result = await query.find();
//
//     for( let i of result) {
//         pubKeys.push(i.get('pubKey'));
//     }
//
//     return pubKeys;
//
//
// });


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

Parse.Cloud.define('getUsers', async() => {
    let users = [];
    const getter = Parse.Object.extend('User');
    let query = new Parse.Query(getter);
    let res = await query.find();

    for (user of res){
        let us;
        us = {username: user.get('username'), birthday: user.get('birthday'), gender: user.get('gender'),religion: user.get('religion'), country: user.get('country'),  city: user.get('city')};
        users.push(us);
    }
    console.log(users);
   return users;
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

Parse.Cloud.define('getCities', async() => {
    let citiesArr = [];
    const cities = Parse.Object.extend('Cities');
    const query = new Parse.Query(cities);

    const results = await query.find();

    if(results.length !== 0) {
        for( let city of results){
            // let tmp = [];
            // tmp.push(city.get('Name'));
            // tmp.push(city.get('Region'));
            citiesArr.push(city.get('Name'));
        }
        return citiesArr;
    }
});

Parse.Cloud.define('getCountries', async(request) => {
    let countriesArr = [];
    let countries = Parse.Object.extend('Countries');
    let query = new Parse.Query(countries);

    let res = await query.find();
    res.map(name => {
        countriesArr.push(name.get('name'));
    });

    return countriesArr;
});

Parse.Cloud.define('createUser', async (request) => {

    let hashString = request.params.username + request.params.password + request.params.city + request.params.birthDate + request.params.gender + request.params.country + request.params.religion + request.params.secret;
    console.log(hashString);
    let key = security.GenerateKey(hashString);
    console.log(key)
    var user = new Parse.User();
    user.set('username', request.params.username);
    user.set('password', request.params.password);

    user.set('city', request.params.city);
    user.set('birthDate', request.params.birthDate);
    user.set('gender', request.params.gender);
    user.set('country', request.params.country);
    user.set('religion', request.params.religion);
    user.set('pubKey', key.publicKey);
    user.set('groups', request.params.groups);
    try {
        return await user.signUp();
    } catch (error) {
        // Show the error message somewhere and let the user try again.
        return new Parse.Error('Error: ' + error.code + " " + error.message);
    }
});

Parse.Cloud.define('sendVote', async (request) => {         // TODO - Simplify
    let hashString = request.params.username + request.params.password + request.params.city + request.params.birthDate + request.params.gender + request.params.country + request.params.religion + request.params.secret;
    let key = security.GenerateKey(hashString);
    let pubKey = key.publicKey;

    if(request.params.pubKey !== pubKey)
        return "Failed to vote - Wrong params....";

    let sha = sha256.create();
    let timestamp = new Date().getTime();
    sha.update(pubKey+request.params.voteTarget+1+request.params.tag + timestamp);
    let txHash = sha.hex();


    let signature = await security.sign(key.privKey, txHash);



    let url = blockchainUrl + '/addTransaction';
    let data = {
        "Sender": pubKey,
        "Receiver": request.params.voteTarget,
        "Amount": 1,
        "Tag": request.params.tag,
        "Timestamp": timestamp.toString(),
        "Signature": signature
    };


    let result = await axios({
        method: 'post',
        url: url,
        data: data
    });

   // console.log(result)

    return result.data.Message;

});

Parse.Cloud.define('hash',async(request) => {
   let target = request.params.target;
    let sha = sha256.create();
    sha.update(target);


    return sha.hex();;
});

Parse.Cloud.define('genKeyPair',async(request) => {
    let target = request.params.target;


    return security.GenerateKey(target);
});

Parse.Cloud.define('sign', async (request) => {
    return security.sign(request.params.privKey,request.params.hash);
});

Parse.Cloud.define('verify', async (request) => {
   return security.verifySignature(request.params.pubKey, request.params.signature);
});

// Parse.Cloud.define('saveCountry', async (request) => {
//
//     let url = 'https://restcountries.eu/rest/v2/all';
//     let log = await axios({
//         method: 'get',
//         url: url
//     });
//
//     // for(let country of Object.keys(log)){
//     //     console.log(country);
//     // }
//     let Countries = Parse.Object.extend("Countries");
//
//     log.data.map((country) => {
//         console.log(country.name);
//         let newCountry = new Countries();
//         newCountry.set('name',country.name);
//         newCountry.save();
//     })
//
// });

Parse.Cloud.define('verifySignature', async (request) => {
    let pubKey = request.params.pubKey;
    let signature = request.params.signature;
    //let ckeckHash = request.params.hash;
    return security.verifySignature(pubKey,signature);
});



Parse.Cloud.define('getResults', async(request) => {
    let pollTag = request.params.pollTag;
    let user = request.params.pubKey;

    let pollChoices = await getPollChoices(pollTag);

    let url = blockchainUrl + '/getResults';
    let data = {
        "PollTag": pollTag,
        "Choices": pollChoices,
        "User": user
    };


    let result = await axios({
        method: 'post',
        url: url,
        data: data
    });


    return result.data;
});

Parse.Cloud.define('getMyPolls', async (request) => {
   let myPolls = [];
   let userGroups = request.user.get('groups');
   let params = {pubKey: request.user.get('pubKey')};
   let allPolls = await Parse.Cloud.run('getAllResults',params);

   for (let poll of allPolls){
       if(userGroups.includes(poll.group)) {
            if(poll.results.VoteBalance === 0){
                for(let i in poll.choices){
                    if(poll.choices[i] === poll.results.VoteTarget)
                        poll.results.VoteTarget = parseInt(i);
                }
            }


           myPolls.push(poll);


       }
              }
   return myPolls;
});

Parse.Cloud.define('getAllResults', async(request) => {

    let polls = Parse.Object.extend('Polls');
    let opts = Parse.Object.extend('ChoiceDescriptions');
    let optsQuery = new Parse.Query(opts);
    let query = new Parse.Query(polls);
    let res = await query.find();




    let allPollsData = [];

    for (let poll of res){
        let optDetails = [];
        for(let opt of poll.get('choices')){
            console.log(poll.get('choices'));
            optsQuery.equalTo('choice',opt);
             let res = await optsQuery.find();
             if(res)
                optDetails.push({name:res[0].get('choice'),description: res[0].get('description'), img: res[0].get('image')});
        }



        let params = {pollTag: poll.get('pollTag'), pubKey: request.params.pubKey};
        console.log(params);
        let tmpResult = await Parse.Cloud.run('getResults',params);

        let tmpData = {tag: poll.get('pollTag'), name: poll.get('pollName'), description: poll.get('description'),choices: poll.get('choices'), choiceDetails: optDetails, creator: poll.get('creator'), results: tmpResult, group: poll.get('pollGroup')};


        allPollsData.push(tmpData);
    }
    console.log(allPollsData);
    return allPollsData;
});

Parse.Cloud.define('getBalance', async (request) => {
    let pollTag = request.params.pollTag;
    let sender = request.user.get('pubKey');


    let url = blockchainUrl + '/getBalance';
    let data = {
        "Tag": pollTag,
        "Sender": sender
    };


    let result = await axios({
        method: 'get',
        url: url,
        data: data
    });

    console.log(result);

    return result.data;
});





//================================================================================//
                            // Utility Functions //
//================================================================================//

Parse.Cloud.define('getReligionVoters', async (request) => {
   let pollTag = request.params.pollTag;

   let params = {pollTag: pollTag}
  let results = await Parse.Cloud.run('getResults',params);

   let data = new Map();

   for(let choice in results.Results){
       console.log(choice)
   }

   return results;
});


async function getPollChoices(pollTag) {
    let polls = Parse.Object.extend('Polls');
    let query = new Parse.Query(polls);
    query.equalTo('pollTag',pollTag);
    let res = await query.find();
    return res[0].get('choices');

}


async function getUsersByGroup(grpName) {


    let users = Parse.Object.extend('User');

    let pubKeys = [];

    let query = new Parse.Query(users);
    console.log(grpName);
    query.containedIn('groups', [grpName]);
    let result = await query.find();

    for (let i of result) {
        pubKeys.push(i.get('pubKey'));
    }

    return pubKeys;
}




// GetPollsForUser(pubKey) => all polls the user voted for
// GetAvailablePollsForUser(pubKey) => get polls the user CAN vote in.

// GetTransactionsForUser(pubKey) => Json {{PollName: "Name", From: "Sender", To: "Decision", TimeStamp: "Time"},{PollName: "Name", From: "Sender", To: "Decision", TimeStamp: "Time"}};

// GetUsersByCity(pollTag, city, to) => amount
// GetVotingPercentage(pollTag) => % of ppl that voted compared to amount of valid voters.
// GetVotingPercentageByCities(pollTag) => {city1: %, city2: %,....}
// GetVotingPercentageForCandidate(pollTag,city)
