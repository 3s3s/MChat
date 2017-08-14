'use strict';

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
        $('#tableForum').addClass('hidden');
        $('#parentBoards').removeClass('hidden');
        
        $('#tableChatEn').removeClass('hidden');
        $('#tableChatRu').addClass('hidden');
            
        $('#parentBoards').append($('<li></li>').append(topParentBoard));
    }   
    
    function ShowRuBoard()
    {
        $('#tableForum').addClass('hidden');
        $('#parentBoards').removeClass('hidden');
        
        $('#tableChatEn').addClass('hidden');
        $('#tableChatRu').removeClass('hidden');

        $('#parentBoards').append($('<li></li>').append(topParentBoard));
    }    
}

function ShowTopParentBoard()
{
    $('#parentBoards').addClass('hidden');
    
    $('#tableForum').removeClass('hidden');
    $('#chat_main').removeClass('hidden');
    $('#tableChatEn').addClass('hidden');
    $('#tableChatRu').addClass('hidden');
}

