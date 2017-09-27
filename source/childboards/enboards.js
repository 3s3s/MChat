'use strict';
const utils = require("../utils");
const common = require("./common");

exports.ShowEnBoard = function()
{
    common.HideAllTables();
        
    utils.setItem('parentBoard', "en");
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li></li>').append(common.topParentBoard));

    $('#tableEnChildBoards').removeClass('hidden');

}   

exports.ShowEnBoardChild = function(id)
{
    common.HideAllTables();
    
    utils.setItem('parentBoard', id);
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li></li>').append(common.topParentBoard));
    $('#parentBoards').append($('<li></li>').append(common.topParentEnBoard));
}
