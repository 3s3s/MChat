'use strict';

const $ = require('jquery');
const utils = require("./utils");
const g_constants = require("./constants");
const bitcoin = require('multicoinjs-lib');
const g_network = bitcoin.networks[g_constants.network];
const zlib = require('zlib');
const alerts = require("./alerts");
const api = require("./api");
const common = require("./childboards/common");

var chatSaved = {};

var queryAddress = {};
exports.Update = function(address)
{
    const addr = address || g_constants.GetTopForumAddress();
    
    if (queryAddress[addr] && queryAddress[addr] > Date.now()-30000)
        return;
    queryAddress[addr] = Date.now();
    
    GetUnconfirmedTXs(addr, ret1 => {
        const unconfirmed = ret1;
        GetUnspentTXs(addr, ret2 => {
            ret2.sort((a,b)=>{return a.confirmations - b.confirmations});
            const txs = unconfirmed.concat(ret2);
            
            //utils.ForEachSync(txs, SaveTx, () => {
            //    UpdateChatTable();
            //});
            setTimeout(SaveTx, 1, txs, 0);
            delete queryAddress[addr];
        });
    });
    UpdateChatTable();
    
    var aMessages = [];
    for(var key in chatSaved)
    {
        if (!chatSaved[key]['txtData'])
            continue;
            
        aMessages.push(chatSaved[key]['txtData']);
    }
    
    ShowChatTable(aMessages);
    
    RemoveOldKeys();
}

function RemoveOldKeys()
{
    var tmp = {};
    for(var key in chatSaved)
    {
        if (chatSaved[key].info.confirmations && chatSaved[key].info.confirmations > 2000 && Object.keys(chatSaved).length > 200)
            continue;
        tmp[key] = chatSaved[key]; 
    }
    chatSaved = tmp;
}
function SaveTx(aTXs, nIndex)
{
    if (!aTXs || !aTXs.length || aTXs.length <= nIndex)
        return;

    const info = aTXs[nIndex];
    if (chatSaved[info.tx] && chatSaved[info.tx]['data'])
    {
        setTimeout(SaveTx, 1, aTXs, nIndex+1);
        return;
    }

    if (!chatSaved[info.tx])
        chatSaved[info.tx] = {info : info};
    
    /*api.GetTransaction(info.tx, (data)=>{
        
    });*/
    
    utils.getJSON(g_constants.API+"gettransaction?hash="+info.tx, (code, data)=>{
        if (!data || !data.status || data.status.localeCompare('success') != 0)
        {
            setTimeout(SaveTx, 1, aTXs, nIndex+1);
            return;
        }
        
        try
        {
            chatSaved[info.tx]['data'] = JSON.parse(unescape(data.data));
        }
        catch(e)
        {
            chatSaved[info.tx]['data'] = data.data;
        }
        setTimeout(SaveTx, 1, aTXs, nIndex+1);
    });
}

function UpdateChatTable()
{
    //var tmp = {};
    for(var key in chatSaved)
    {
        if (!chatSaved[key]['data'] || !chatSaved[key]['data'].length || !chatSaved[key]['data'][0].vout)
            continue;
        
        if (chatSaved[key]['txtData'])   
            continue;
            
        try
        {
            const outs = JSON.parse(unescape(chatSaved[key]['data'][0].vout));
            
            //const initKey = key;
            let message = chatSaved[key];
            DecodeOuts(outs, (textJSON) => {
                if (!textJSON || textJSON.result != 'success')
                    return;
                    
                message['txtData'] = textJSON.data;
            });
        }
        catch(e)
        {
            continue;
        }
            
    }
}

function ShowChatTable(aMessages)
{
    if (!aMessages.length)
    {
        ShowInitMessage();
        return;
    }
    aMessages.sort((a, b) => {return parseInt(b.s) - parseInt(a.s);});

    $('#bodyChatEn').html('');    
    $('#bodyChatRu').html('');    
    
    if (aMessages.length < Object.keys(chatSaved).length)
        ShowInitMessage();
 
    for (var i = 0; i < aMessages.length; i++)
    {
        if (aMessages[i].t.length == 0)
            continue;
            
        const old = utils.getItem((aMessages[i].pb || '.')+'_messages').status == 'false' ? [] : utils.getItem(aMessages[i].pb+'_messages').value || [];
        
        var next = (typeof old === 'object' && !Array.isArray(old)) ? old : {}; //Array.isArray(old) ? old : [];

        if (!next[aMessages[i].s])
            next[aMessages[i].s] = {};
            
        next[aMessages[i].s][aMessages[i].from] = aMessages[i];

        utils.setItem(aMessages[i].pb+'_messages', next);
            
    }
    
    common.ShowCurrentBranch();
    
    function ShowInitMessage()
    {
        $('#bodyChatEn').html(''); 
        $('#bodyChatRu').html(''); 
        
        var trEn = $('<tr></tr>').append($('<td>Loading messages...</td>'));
        var trRu = $('<tr></tr>').append($('<td>Загрузка сообщений...</td>'));
        
        $('#bodyChatEn').append(trEn);
        $('#bodyChatRu').append(trRu);
    }
}

function DecodeOuts(outs, callback)
{
    var ret = {result : 'success', data : {s:0,t:"",raw:""}};
    
    if (!outs[0].scriptPubKey.addresses.length)
        return ret;
        
    ret.data['from'] = outs[0].scriptPubKey.addresses[0];
    ret.data['topic'] = outs[1].scriptPubKey.addresses[0];
    ret.data['donate'] = outs[2].scriptPubKey.addresses[0];
    
    var allBuffs = {array: [], length: 0};
    for (var i=3; i<outs.length; i++)
    {
        const checkBuff = bitcoin.address.fromBase58Check(outs[i].scriptPubKey.addresses[0]).hash;
        allBuffs.array.push(checkBuff);
        allBuffs.length += checkBuff.length;
    }
    const all = {buf : Buffer.concat(allBuffs.array, allBuffs.length), ret : ret};
    zlib.unzip(all.buf, (err, buffer) => {
        if (!err) {
          //console.log(buffer.toString());
          //check += buffer.toString();
          all.ret.data.raw = buffer.toString();
        } else {
          // handle error
          all.ret.data.raw = JSON.stringify({s:0,t:"",v:"1"});
        }
        
        try
        {
            const parsed = JSON.parse(ret.data.raw);
            all.ret.data.s = parsed.s || 0;
            all.ret.data.t = parsed.t || "";
            all.ret.data.pb = parsed.pb || ".";
            all.ret.data.subject = parsed.subject || "???";
        }
        catch(e)
        {
            
        }
        callback(all.ret);
    });  
}

function GetUnconfirmedTXs(address, callback)
{
    try
    {
        //const address = g_constants.GetTopForumAddress();
        
        utils.getJSON(g_constants.API+"address/unconfirmed/"+address, (code, data)=>{
            if (!data || !data.status || data.status.localeCompare('success') != 0)
            {
                callback([]);
                return;
            }
            
            callback(data.data.unconfirmed);
        })
        
    }
    catch(e)
    {
        alerts.Alert("Error", "GetUnconfirmedTXs error: "+e.message);
    }
    
}

function GetUnspentTXs(address, callback)
{
    try
    {
        //const address = g_constants.GetTopForumAddress();
        
        utils.getJSON(g_constants.API+"address/unspent/"+address, (code, data)=>{
            if (!data || !data.status || data.status.localeCompare('success') != 0)
            {
                callback([]);
                return;
            }
            
            callback(data.data.unspent);
        })
        
    }
    catch(e)
    {
        alerts.Alert("Error", "GetUnspentTXs error: "+e.message);
    }
    
}