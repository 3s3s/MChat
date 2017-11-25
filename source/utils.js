'use strict';

const $ = require('jquery');
const url = require('url');
const http = require("http");
const https = require("https");
const request = require('request');
const g_constants = require("./constants");

exports.MakeFloat = function(str)
{
    const f = parseFloat(str);
    if (isNaN(f) || Math.abs(f) < 1.e-12)
        return 0;
            
    const ret = parseFloat(f.toPrecision(12));
    if (Math.abs(ret) < 1.e-12)
        return 0;
    return ret;
}

exports.hexEncode = function(str){
    var hex, i;

    var result = "";
    for (i=0; i<str.length; i++) {
        hex = str.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

exports.hexDecode = function(str){
    var j;
    var hexes = str.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

exports.JSONreturn = function(success, message)
{
    return {status: success, message: message};
};


exports.getItem = function (key)
{
    var storage;
    if (window.content != undefined)
        storage = window.content.localStorage;
    else
        storage = localStorage;

    var str = storage.getItem(key);
    if (str == undefined)
        return exports.JSONreturn('false', '');
    
    try {
        return JSON.parse(str);
    }
    catch(e) {
        return exports.JSONreturn('false', e.message);
    }
};

exports.setItem = function (key, value)
{
    //console.log('setItem key='+key+'; value='+JSON.stringify(value));
    var oldValue = exports.getItem(key);
    
    oldValue.status = 'success';
    oldValue.value = value;
    
    var storage;
    if (window.content != undefined)
        storage = window.content.localStorage;
    else
        storage = localStorage;

    //storage.clear();
	storage.setItem(key, JSON.stringify(oldValue));
};

exports.deleteKey = function(parent, key)
{
    var jsonSaved =exports.getItem(parent).value || {}; 

    if (jsonSaved[key] == undefined)
        return;
        
    delete jsonSaved[key];

    exports.setItem(parent, jsonSaved);
};

exports.getJSON = function(query, callback)
{
    const parsed = url.parse(query, true);
    const options = {
        host: parsed.host,
        port: parsed.port || parsed.protocol=='https:' ? 443 : 80,
        path: parsed.path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    exports.getHTTP(options, callback);
};

exports.postJSON = function(query, body, callback)
{
    const parsed = url.parse(query, true);
    const options = {
        host: parsed.hostname,
        port: parsed.port || (parsed.protocol=='https:' ? 443 : 80),
        path: parsed.path,
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (parsed.auth)
        options['auth'] = parsed.auth;
    exports.getHTTP(options, callback);
};



exports.getHTTP = function(options, onResult)
{
    console.log("rest::getJSON");

    const port = options.port || 80;
    const prot = port == 443 ? https : http;
    
    if (!options.method)
        options.method = 'GET';
    if (!options.headers)
        options.headers = {'Content-Type': 'application/json'};
        
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            if (options.headers['Content-Type'] == 'application/json')
            {
                try {
                    var obj = JSON.parse(output);
                    onResult(res.statusCode, obj);

                }catch(e) {
                    console.log(e.message);
                    onResult(res.statusCode, e);
                }
                
                return;
            }
            onResult(res.statusCode, output);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};

exports.GetLastTX = function(address)
{
   // const savedLastTx = exports.getItem(address+'_lastTX');
  //  if (savedLastTx && savedLastTx.status && savedLastTx.status == 'success')
   //   return savedLastTx.value;
   // else
      return {id : '', amount : 0};
  
}


exports.UpdateBalance = function()
{
    const savedAddr = exports.getItem('address');
    if (!savedAddr || !savedAddr.status || savedAddr.status != 'success')
      return;
      
    exports.getJSON( g_constants.API+'address/balance/'+savedAddr.value, (code, data) => {
        if (!data || !data.status || data.status.localeCompare('success') != 0)
        {
            $('#balance').html(data.message);
            return;
        }
        /*var amount = "";
        const g_lastTX = exports.GetLastTX(savedAddr.value);
        if (g_lastTX && g_lastTX.amount)
            amount = ' (available '+g_lastTX.amount+')';*/
            
        const unspentData = exports.getUnspent(savedAddr.value);
        
        var availableBalance = 0.0;
        if (unspentData && unspentData.unspent)
        {
            for (var i=0; i<unspentData.unspent.length; i++)
                availableBalance += 1.0*unspentData.unspent[i].amount;
        }

        $('#balance').html(data.data.balance+' (available: '+exports.MakeFloat(availableBalance)+') MC');
    });
}

exports.UpdateUnspent = function()
{
    const savedAddr = exports.getItem('address');
    if (!savedAddr || !savedAddr.status || savedAddr.status != 'success')
      return;

    exports.getJSON( g_constants.API+"address/unspent/" + savedAddr.value, (code, data)=>{
        if (!data || !data.status || data.status.localeCompare('success') != 0)
            return;

        exports.setItem(savedAddr.value+'_unspent', data.data);
        
        UpdateUnconfirmed();
    });
    
    function UpdateUnconfirmed()
    {
        exports.getJSON( g_constants.API+"address/unconfirmed/" + savedAddr.value, (code, data)=>{
            if (!data || !data.status || data.status.localeCompare('success') != 0)
                return;
    
            exports.setItem(savedAddr.value+'_unconfirmed', data.data);
            
        });
        
    }
}

exports.SwapUnconfirmed = function()
{
    const savedAddr = exports.getItem('address');
    if (!savedAddr || !savedAddr.status || savedAddr.status != 'success')
      return;
    
    const data = exports.getItem(savedAddr.value+'_unconfirmed');
    if (!data || !data.status || data.status != 'success')
        return;
        
    exports.setItem(savedAddr.value+'_unspent', data.value);
}

exports.getUnspent = function(address)
{
   // const unconfirmed = exports.getItem(address+'_unconfirmed');
   // if (unconfirmed && unconfirmed.status && unconfirmed.status == 'success' && unconfirmed.value.unconfirmed.length)
   //     return unconfirmed.value;
        
    return exports.getItem(address+'_unspent').value;
}

exports.pushTransaction = function(hexTX, callback)
{
    console.log("pushTransaction hex=" + hexTX);
    
    var myJSONObject = { hex: hexTX };
    request({
        url: g_constants.API+"tx/push",
        method: "POST",
        json: true,   // <--Very important!!!
        body: myJSONObject
    }, function (error, response, body){
        callback(error, body);
    });

};

exports.GetTopicAddress = function()
{
    const id = window.location.hash.substr(1);
    
    if (id == g_constants.NEW_TOPIC)
        return g_constants.GetTopForumAddress();
    
    const arr = id.split('_');
    if (!arr || !arr.length || arr.length != 2)
        return g_constants.GetTopForumAddress();
        
    return arr[1];
}

exports.GetDonateAddress = function(address)
{
    const id = window.location.hash.substr(1);
    
    if (exports.getItem('donateAddress').status != 'false')
        return exports.getItem('donateAddress').value;

    return address || g_constants.donateAddress;
}

/*exports.convertUTCDateToLocalDate = function (date) {
    var newDate = new Date(date.getTime()-date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours + offset);

    return newDate;   
}*/

exports.ForEachSync = function(array, func, cbEndAll, cbEndOne)
{
    if (!array || !array.length)
    {
        console.log('success: ForEachAsync (!array || !array.length)');
        cbEndAll(false);
        return;
    }
    
    Run(0);
    
    function Run(nIndex)
    {
        if (nIndex >= array.length) throw 'error: ForEachSync_Run (nIndex >= array.length)';
        func(array, nIndex, onEndOne);
        
        function onEndOne(err, params)
        {
            if (!cbEndOne)
            {
                if (nIndex+1 < array.length)
                    Run(nIndex+1);
                else
                    cbEndAll(false); //if all processed then stop and return from 'ForEachSync'
                return;
            }
            
            if (!params) params = {};
            
            params.nIndex = nIndex;
            
            cbEndOne(err, params, function(error) {
                if (error) {
                    //if func return error, then stop and return from 'ForEachSync'
                    console.log('error: ForEachSync_Run_cbEndOne return error');
                    cbEndAll(true);
                    return;
                }
                if (nIndex+1 < array.length)
                    Run(nIndex+1);
                else
                    cbEndAll(false); //if all processed then stop and return from 'ForEachSync'
            });
        }
    }
};