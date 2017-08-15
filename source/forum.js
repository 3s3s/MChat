'use strict';
const utils = require("./utils");

exports.Init = function()
{
    ShowTopParentBoard();

    const topParentBoard = $('<a id="topParent" href="#">Boards</a>');
    
    topParentBoard.on('click', (e) => {
        e.preventDefault();
        ShowTopParentBoard();
    })
    
    $('#board_en').on('click', (e) => {
        e.preventDefault();
        ShowEnBoard();
    })
    
    $('#board_ru').on('click', (e) => {
        e.preventDefault();
        ShowRuBoard();
    })    

    function ShowEnBoard()
    {
        utils.setItem('parentBoard', "en");
        $('#tableForum').addClass('hidden');
        $('#parentBoards').removeClass('hidden');
        
        $('#tableChatEn').removeClass('hidden');
        $('#tableChatRu').addClass('hidden');
            
        $('#parentBoards').append($('<li></li>').append(topParentBoard));
    }   
    
    function ShowRuBoard()
    {
        utils.setItem('parentBoard', "ru");
        $('#tableForum').addClass('hidden');
        $('#parentBoards').removeClass('hidden');
        
        $('#tableChatEn').addClass('hidden');
        $('#tableChatRu').removeClass('hidden');

        $('#parentBoards').append($('<li></li>').append(topParentBoard));
    }    
}

function ShowTopParentBoard()
{
    utils.setItem('parentBoard', ".");
    $('#parentBoards').addClass('hidden');
    
    $('#tableForum').removeClass('hidden');
    $('#chat_main').removeClass('hidden');
    $('#tableChatEn').addClass('hidden');
    $('#tableChatRu').addClass('hidden');
}

