'use strict';

//browserify --debug ./source/index.js > ./js/index.js

const $ = require('jquery');
const bitcoin = require('multicoinjs-lib');
const utils = require("./utils");
const chat = require("./chat");
const g_constants = require("./constants");
const zlib = require('zlib');
const alerts = require("./alerts");
const forum = require("./forum");


const g_network = bitcoin.networks[g_constants.network];

var g_Transaction = {tx: "", address : "", amount : 0};

$(function() {
  
  setInterval(utils.UpdateBalance, 10000);
  setInterval(utils.UpdateUnspent, 10000);
  setInterval(chat.Update, 10000);
  
  forum.Init();
  
  $('#formRegister').submit(function(e) {
    event.preventDefault();
  });
  
  const savedWIF = utils.getItem('wif');
  if (savedWIF && savedWIF.status && savedWIF.status == 'success')
    $('#privKey').val(savedWIF.value);

  UpdateAddress();
  $('#privKey').on('change textInput input', function(event) {
    UpdateAddress();
  })
  
  var oldVal2;
  $('#messsageNew').on('change textInput input', function(event) {
    var val = this.value;
    if (val === oldVal2) return;
    oldVal2 = val;
    
    CreateTransaction(val);
    
  });
  
  $('#buttonNewMessage').on('click', function(event) {
    event.preventDefault();
    SendTransaction(g_Transaction);
  });
  
  $('#buttonGen').on('click', function(event) {
    event.preventDefault();
    
   // $('#chat_main').addClass('hidden');
  //  $('#chatArea').addClass('hidden');
    
    const keyPair = bitcoin.ECPair.makeRandom({network : g_network});
   // const address = keyPair.getAddress();
    const wif = keyPair.toWIF();
    
    $('#privKey').val(wif);
    UpdateAddress();
    
   // utils.setItem('address', address);
  //  utils.setItem('wif', wif);
  })
  
});

function UpdateAddress()
{
  $('#pubKey').html('');  
  try {
      const wif = $('#privKey').val();
      const keyPair = bitcoin.ECPair.fromWIF( wif, g_network );
      const address = keyPair.getAddress();
      
      utils.setItem('address', address);
      utils.setItem('wif', wif);
      
      $('#pubKey').html(address);
      $('#pubKey').removeClass('hidden');
  }
  catch(e) {
      alerts.Alert("Error", e.message);
  }
  
  utils.UpdateBalance();
  utils.UpdateUnspent();
  chat.Update();
}

function CreateOutputs(txt, callback)
{
  var txtJSON = JSON.stringify({s:Date.now(),v:'1',pb:parentBoard,t:txt});
  
  const parentBoard = utils.getItem('parentBoard');
  if (parentBoard && parentBoard.status && parentBoard.status == 'success')
    txtJSON['pb'] = parentBoard.value;

  zlib.deflate(txtJSON, (err, buffer) => {
    if (!err) {
      //console.log(buffer.toString('base64'));
      var ret = [];
      //var check = "";
      try
      {
        for (var i=0; i<buffer.length; i+=20)
        {
          const buf1 = Buffer.allocUnsafe(20);
          buffer.copy(buf1, 0, i, i+20);
          
          ret.push(bitcoin.address.toBase58Check(buf1, g_network.pubKeyHash));
        }
        
      }
      catch(e)
      {
        alerts.Alert("Error", e.message);
      }
      
      callback(ret);
    } else {
      // handle error
    }
  });
  
  //var publicKeyHash = Buffer.from(utils.hexEncode(txtJSON));
  
}

function CreateTransaction(txt)
{
  CreateOutputs(txt, (outs) => {
    var address = "";
    g_Transaction = {tx: "", address : "", amount : 0};
    try
    {
      const wif = $('#privKey').val();
      const keyPair = bitcoin.ECPair.fromWIF( wif, g_network );
      address = keyPair.getAddress();
      
      const g_lastTX = utils.GetLastTX(address);
      
      var tx = new bitcoin.TransactionBuilder( g_network );
      
      var txIn = g_lastTX.id;
      var txAmount = g_lastTX.amount;
      
      if (!txIn.length && !txAmount)
      {
        var unspentData = utils.getUnspent(address);
        if (!unspentData || !unspentData.address)
          return;
          
        if (!unspentData.unspent || !unspentData.unspent.length)
        {
          $('#balance').addClass('alert-danger')
          return;
        }
          
        txIn = unspentData.unspent[0].tx;
        txAmount = unspentData.unspent[0].amount;
      }
      
      const amount = parseInt(txAmount/0.00000001)-(outs.length*1000 + 2000);
      if (amount <= 0)
      {
        alerts.Alert("Error", 'Insufficient funds');
        return;
      }
      var cost = (outs.length*1000 + 2000);
        
  
      tx.addInput(txIn, 0);
      tx.addOutput(address, amount);
      tx.addOutput(g_constants.chatAddress, 1000);
      
      cost += 1000;
  
      for (var i=0; i<outs.length; i++)
      {
        tx.addOutput(outs[i], 1000);
        cost += 1000;
      }
  
      tx.sign(0, keyPair);
      
      tx = tx.build();
      
      //utils.setItem(address+'_lastTX', {id : tx.getId(), amount : utils.MakeFloat(amount)});
      //SendTransaction(tx, address, utils.MakeFloat(amount*0.00000001));
      g_Transaction =  {tx: tx, address : address, amount : utils.MakeFloat(amount*0.00000001)};
      $('#txInfo').html('Transaction will cost: '+(cost*0.00000001).toFixed(8)+' MC')
    }
    catch(e) {
      alerts.Alert("Error", e.message);
      //if (address.length)
      //  utils.setItem(address+'_lastTX', {id : '', amount : 0})
    }
    
  });
}

function SendTransaction(transaction)
{
  const tx = transaction.tx;
  const address = transaction.address;
  const amount = transaction.amount;
  
  if (!amount || amount < 1000*0.00000001)
  {
    alerts.Alert("Error", 'Bad transaction amount');
    return;
  }
  
  utils.pushTransaction(tx.toHex(), function(e, data) {
    if (!data || !data.status || data.status != 'success')
    {
      const message = 'Push transaction failed';
      alerts.Alert("Error", (data && data.data) ? message + " " +data.data : message);
      //utils.setItem(address+'_lastTX', {id : '', amount : 0})
      return;
    }
      
    utils.setItem(address+'_lastTX', {id : data.data, amount : amount});
      
    alerts.Alert("Success!", 'Transaction sended. ID='+data.data);
    $('#messsageNew').val('');
  });
  
}