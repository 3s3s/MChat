'use strict';

const $ = require('jquery');
const utils = require("./utils");
const g_constants = require("./constants");
const bitcoin = require('multicoinjs-lib');
const g_network = bitcoin.networks[g_constants.network];
const zlib = require('zlib');
const alerts = require("./alerts");

var chatSaved = {};

exports.Update = function()
{
    GetUnconfirmedTXs((ret1)=>{
        const unconfirmed = ret1;
        GetUnspentTXs((ret2)=>{
            //ret2.sort((a,b)=>{return a.confirmations - b.confirmations});
            const txs = unconfirmed.concat(ret2);
            
            //utils.ForEachSync(txs, SaveTx, () => {
            //    UpdateChatTable();
            //});
            setTimeout(SaveTx, 1, txs, 0);
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
        if (chatSaved[key].info.confirmations && chatSaved[key].info.confirmations > 200)
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
            
            const initKey = key;
            DecodeOuts(outs, (textJSON) => {
                if (!textJSON || textJSON.result != 'success')
                    return;
                    
                chatSaved[initKey]['txtData'] = textJSON.data;
            });
            //const textJSON = DecodeOuts(outs);
            
            //if (!textJSON || textJSON.result != 'success')
            //    continue;
            
            //tmp[key] = chatSaved[key];    
            //txtArray.push(textJSON.data);
        }
        catch(e)
        {
            continue;
        }
            
        //var tr = $('<tr id="tr_'+key+'"></tr>').append($('<td id="td_'+key+'">'+key+'</td>'));
        //$('#tableChat').append(tr);
    }
    
    //chatSaved = tmp;
    
    //ShowChatTable(txtArray);
}

function ShowChatTable(aMessages)
{
    if (!aMessages.length)
    {
        ShowInitMessage();
        return;
    }
    aMessages.sort((a, b) => {return parseInt(b.s) - parseInt(a.s);});

    $('#bodyChat').html('');    
    
 /*   if (aMessages.length < Object.keys(chatSaved).length)
    {
        
    }*/
    for (var i = 0; i < aMessages.length; i++)
    {
        if (aMessages[i].t.length == 0)
            continue;
            
        var message = aMessages[i].t
            .replace(/</g, "&lt")
            .replace(/>/g, "&gt")
            .replace(/\n/g, "<br>")
            .replace(/\[b\]/gi, "<b>")
            .replace(/\[\/b\]/gi, "</b>")
            .replace(/\[i\]/gi, "<i>")
            .replace(/\[\/i\]/gi, "</i>")
            .replace(/\[img\]/gi, "<img ")
            .replace(/\[\/img\]/gi, "/>")
            ;
            
        var tr = $('<tr></tr>')
            .append($('<td>'+(new Date(aMessages[i].s)).toLocaleString()+'</td>'))
            .append($('<td>'+aMessages[i].from+'</td>'))
            .append($('<td>'+message+'</td>'));
        $('#tableChat').append(tr);
    }
    
    function ShowInitMessage()
    {
        $('#bodyChat').html(''); 
        var tr = $('<tr></tr>').append($('<td>Loading messages...</td>'));
        $('#tableChat').append(tr);
    }
}

function DecodeOuts(outs, callback)
{
    var ret = {result : 'success', data : {s:0,t:"",raw:""}};
    
    if (!outs[0].scriptPubKey.addresses.length)
        return ret;
        
    ret.data['from'] = outs[0].scriptPubKey.addresses[0];
    
    var allBuffs = {array: [], length: 0};
    for (var i=2; i<outs.length; i++)
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
        const parsed = JSON.parse(ret.data.raw);
        all.ret.data.s = parsed.s
        all.ret.data.t = parsed.t;
        callback(all.ret);
    });  
}

function GetUnconfirmedTXs(callback)
{
    try
    {
        const address = g_constants.chatAddress;
        
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

function GetUnspentTXs(callback)
{
    try
    {
        const address = g_constants.chatAddress;
        
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