'use strict';
const utils = require("../utils");
const common = require("./common");

exports.ShowRuBoard = function()
{
    common.HideAllTables();
        
    utils.setItem('parentBoard', "ru");
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li></li>').append(common.topParentBoard));

    $('#tableRuChildBoards').removeClass('hidden');

}    

exports.ShowRuBoardChild = function(id)
{
    common.HideAllTables();
    
    utils.setItem('parentBoard', id);
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li></li>').append(common.topParentBoard));
    $('#parentBoards').append($('<li></li>').append(common.topParentRuBoard));
}
