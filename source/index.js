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
  {
    $('#privKey').val(savedWIF.value);
    UpdateAddress();
  }

  //UpdateAddress();
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
  
  $('#buttonCancel').on('click', (e) => {
    e.preventDefault();
    history.back();
    $('#chat_main').addClass('hidden');
  });
  
  $('#buttonGen').on('click', function(event) {
    event.preventDefault();
    
    const keyPair = bitcoin.ECPair.makeRandom({network : g_network});
   // const address = keyPair.getAddress();
    const wif = keyPair.toWIF();
    
    $('#privKey').val(wif);
    UpdateAddress();
    
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
  var data = {s:Date.now(),v:'1',t:txt};
  
  const parentBoard = utils.getItem('parentBoard');
  if (parentBoard && parentBoard.status && parentBoard.status == 'success')
    data['pb'] = parentBoard.value;
    
  data['subject'] = $('#topicNew').val() || "";
    
  var txtJSON = JSON.stringify(data);

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
      
     // const g_lastTX = utils.GetLastTX(address);
      
      var tx = new bitcoin.TransactionBuilder( g_network );
      
      var unspentData = utils.getUnspent(address);
      if (!unspentData || !unspentData.address)
        return;
          
      if (!unspentData.unspent || !unspentData.unspent.length)
      {
        $('#balance').addClass('alert-danger')
        return;
      }
        
      // INPUTS (unspent)
      var txAmount = 0.0;
      var countInputs = 0;
      for (var j=0; j<unspentData.unspent.length; j++)
      {
        var txIn = unspentData.unspent[j].tx;
        tx.addInput(unspentData.unspent[j].tx, unspentData.unspent[j].n);
          
        countInputs++;
          
        txAmount += 1.0*unspentData.unspent[j].amount;
        if (parseInt(txAmount/0.00000001)-(outs.length*1000 + 2000) > 0)
          break;
      }
        

      const change = parseInt(txAmount/0.00000001)-(outs.length*1000 + 2000)-1000;
      if (change <= 0)
      {
        alerts.Alert("Error", 'Insufficient funds');
        return;
      }
      
      var cost = (outs.length*1000 + 2000);
        
      // OUTPUTS
      tx.addOutput(address, change);
      tx.addOutput(utils.GetTopicAddress(), 1000);
      tx.addOutput(utils.GetDonateAddress(address), 1000);

      cost += 2000;
  
      for (var i=0; i<outs.length; i++)
      {
        tx.addOutput(outs[i], 1000);
        cost += 1000;
      }
  
      // SIGN TRANSACTION
      for (var i=0; i<countInputs; i++)
        tx.sign(i, keyPair);
      
      tx = tx.build();
      
      g_Transaction =  {tx: tx, address : address, amount : utils.MakeFloat(cost*0.00000001)};
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
/*      if (!step)
      {
        utils.SwapUnconfirmed();
        SendTransaction(tx, true);
        return;
      }*/
      const message = 'Push transaction failed';
      alerts.Alert("Error", (data && data.data) ? message + " " +data.data : message);
      //utils.setItem(address+'_lastTX', {id : '', amount : 0})
      return;
    }
      
    //utils.setItem(address+'_lastTX', {id : data.data, amount : amount});
      
    alerts.Alert("Success!", 'Transaction sended. ID='+data.data);
    $('#messsageNew').val('');
  });
  
}