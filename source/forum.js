'use strict';
const utils = require("./utils");
const ruBoards = require("./childboards/ruboards");
const enBoards = require("./childboards/enboards");
const common = require("./childboards/common");

exports.Init = function()
{
    ShowTopParentBoard();

    common.topParentBoard.on('click', (e) => {
        e.preventDefault();
        ShowTopParentBoard();
    })
    
    $('#board_en').on('click', (e) => {
        e.preventDefault();
        enBoards.ShowEnBoard();
    })
    $('#board_en_1').on('click', (e) => {
        e.preventDefault();
        enBoards.ShowEnBoardChild('en_1');
    })
    $('#board_en_2').on('click', (e) => {
        e.preventDefault();
        enBoards.ShowEnBoardChild('en_2');
    })
    $('#board_en_3').on('click', (e) => {
        e.preventDefault();
        enBoards.ShowEnBoardChild('en_3');
    })
    
    $('#board_ru').on('click', (e) => {
        e.preventDefault();
        ruBoards.ShowRuBoard();
    })    
    $('#board_ru_1').on('click', (e) => {
        e.preventDefault();
        ruBoards.ShowRuBoardChild('ru_1');
    })
    $('#board_ru_2').on('click', (e) => {
        e.preventDefault();
        ruBoards.ShowRuBoardChild('ru_2');
    })
    $('#board_ru_3').on('click', (e) => {
        e.preventDefault();
        ruBoards.ShowRuBoardChild('ru_3');
    })

}

function ShowTopParentBoard()
{
    common.HideAllTables();
    
    utils.setItem('parentBoard', ".");
    
    $('#tableForum').removeClass('hidden');
}

