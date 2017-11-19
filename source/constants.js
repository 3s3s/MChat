'use strict';
const g_crypto = require('crypto');
const bitcoin = require('multicoinjs-lib');

exports.network = "marycoin";
const g_network = bitcoin.networks[exports.network];

exports.GetTopForumAddress = function()
{
    const hash = g_crypto.createHash("sha256").update('NewTopicMChat').digest('base64');
    const buf = Buffer.from(hash.substr(0, 20));
    
    return bitcoin.address.toBase58Check(buf, g_network.pubKeyHash)
}
exports.donateAddress = "MSA5VGiA9QMLha9yATRPKpERsbRCnb8FSA"; //MDL951uivwqKNitE63rGde4PhRQ9TxWaXM
exports.API = "https://mc.multicoins.org/api/v1/";

exports.NEW_TOPIC = "NewTopic";