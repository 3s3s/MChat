'use strict';
const utils = require("../utils");

exports.topParentBoard = $('<a id="topParent" href="#">Boards</a>');
exports.topParentRuBoard = $('<a id="topParentRu" href="#">Русский</a>');
exports.topParentEnBoard = $('<a id="topParentEn" href="#">English</a>');

exports.HideAllTables = function()
{
    $('#parentBoards').addClass('hidden');
    $('#parentBoards').empty();
    
    $('#tableForum').addClass('hidden');
    $('#tableChatRu').addClass('hidden');
    $('#tableChatEn').addClass('hidden');
    $('#chat_main').addClass('hidden');
    $('#tableEnChildBoards').addClass('hidden');
    $('#tableRuChildBoards').addClass('hidden');
}
