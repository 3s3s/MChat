'use strict';
const utils = require("../utils");
const g_constants = require("../constants");
const chat = require("../chat");
const g_crypto = require('crypto');
const bitcoin = require('multicoinjs-lib');
const g_network = bitcoin.networks[g_constants.network];

exports.topParentBoard = $('<a id="topParent" href="#">Boards</a>');

const mapMainBoards = {
    en : 'English', 
    ru : 'Русский (Russian)'
};

const header_en = [
    "Development & Technical Discussion",
    "Politics & Society",
    "Off-topic"
    ];

const header_ru = [
    "Разработка и технические вопросы",
    "Политика",
    "Разное"
    ];


exports.InitBoards = function()
{
    var new_topic_button = $('<a id="id_new_topic" href="#'+g_constants.NEW_TOPIC+'">New topic</a>').on('click', (e) => {
        e.preventDefault();
        history.pushState({}, "", e.currentTarget.hash);
        $('#chat_main').removeClass('hidden');
    });
    
    $('#clientCommands').append(new_topic_button);
    
    exports.ShowTopParentBoard();

    $('#bodyEnChildBoards').empty();
    $('#bodyRuChildBoards').empty();
    
    for (var i=0; i<header_en.length; i++)
    {
        const a = $("<a id='board_en_"+i+"' href='#en_"+i+"'>"+header_en[i]+"</a>");
        const tr = $('<tr></tr>').append($('<td></td>').append(a));
        
        a.on('click', (e) => {
            e.preventDefault();
            history.pushState({}, "", e.currentTarget.hash);
            exports.ShowBoardChild();
        })
        
        $('#bodyEnChildBoards').append(tr);
    }
    
    for (var i=0; i<header_ru.length; i++)
    {
        const a = $("<a id='board_ru_"+i+"' href='#ru_"+i+"'>"+header_ru[i]+"</a>");
        const tr = $('<tr></tr>').append($('<td></td>').append(a));
        
        a.on('click', (e) => {
            e.preventDefault();
            history.pushState({}, "", e.currentTarget.hash);
            exports.ShowBoardChild();
        })
            
        $('#bodyRuChildBoards').append(tr);
    }
    
    const board = window.location.hash.substr(1);
    
    if (!board.length)  
        return;
    exports.ShowBoard();
    
    if (board.indexOf('_') == -1)   
        return;
    exports.ShowBoardChild();
    
    if (board.indexOf('__') == -1)   
        return;
    exports.ShowCurrentBranch();
}

exports.HideAllTables = function()
{
    utils.setItem('donateAddress', g_constants.donateAddress);
    
    $('#parentBoards').addClass('hidden');
    $('#parentBoards').empty();
    
    $('#clientCommands').addClass('hidden');

    $('#tableForum').addClass('hidden');
    $('#tableChatRu').addClass('hidden');
    $('#tableChatEn').addClass('hidden');
    $('#chat_main').addClass('hidden');
    $('#tableChildBoards_en').addClass('hidden');
    $('#tableChildBoards_ru').addClass('hidden');
    $('#tableMessages').addClass('hidden');
    
    $('#id_table_en_0').addClass('hidden');
    $('#id_table_en_1').addClass('hidden');
    $('#id_table_en_2').addClass('hidden');
    $('#id_table_ru_0').addClass('hidden');
    $('#id_table_ru_1').addClass('hidden');
    $('#id_table_ru_2').addClass('hidden');
    
    exports.topParentBoard.on('click', (e) => {
        e.preventDefault();
        history.pushState({}, "", "#");
        exports.ShowTopParentBoard();
    })


}

exports.ShowTopParentBoard = function()
{
    exports.HideAllTables();
    
    $('#tableForum').removeClass('hidden');
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li>Boards</li>'));
    
    $('#bodyForum').empty();
    for (var key in mapMainBoards)
    {
        const a = $('<a id="board_'+key+'" href="#'+key+'">'+mapMainBoards[key]+'</a>');
        const tr = $('<tr></tr>').append($('<td></td>').append(a));

        //const c_key = key;
        a.on('click', (e) => {
            e.preventDefault();
            history.pushState({}, "", e.currentTarget.hash);
            exports.ShowBoard();
        })
        
        $('#bodyForum').append(tr)
    }
}

exports.ShowBoard = function()
{
    exports.HideAllTables();
        
    const board = window.location.hash.substr(1);
    const id = (board.indexOf('_') != -1) ? board.split('_')[0] : board;

    utils.setItem('parentBoard', id);
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li></li>').append(exports.topParentBoard));
    $('#parentBoards').append($('<li>'+mapMainBoards[id]+'</li>'));

    $('#tableChildBoards_'+id).removeClass('hidden');


}   


exports.ShowBoardChild = function()
{
    exports.HideAllTables();
    
    const id = window.location.hash.substr(1);
    const parent = $('#board_'+id);
    
    utils.setItem('parentBoard', id);
    
    const parentID = id.indexOf('ru') == 0 ? 'ru' : 'en';
    
    const parentA = $('<a id="board_'+parentID+'" href="#'+parentID+'">'+mapMainBoards[parentID]+'</a>');

    parentA.on('click', (e) => {
        e.preventDefault();
        history.pushState({}, "", e.currentTarget.hash);
        exports.ShowBoard();
    })
        
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li></li>').append(exports.topParentBoard));
    $('#parentBoards').append($('<li></li>').append(parentA));
    $('#parentBoards').append($('<li>'+parent.html()+'</li>'));

    $('#id_table_'+id).removeClass('hidden');
    
    $('#clientCommands').removeClass('hidden');
    
    exports.ShowCurrentBranch();
}

exports.ShowCurrentBranch = function()
{
    const id = window.location.hash.substr(1);
    if (id == '.' || id == 'en' || id == 'ru')
        return;
    
    if (id.indexOf('__0') == id.length-3)
    {
        //id = GetTopicAddress();
        exports.ShowMessages();
        return;
    }
        
    const all = utils.getItem(id+'_messages').status == 'false' ? [] : utils.getItem(id+'_messages').value || [];
    
    $('#id_table_'+id+' > thead').empty();
    $('#id_table_'+id+' > thead').append($('<th></th>'));
    $('#id_table_'+id+' > thead').append($('<th>Subject</th>'));
    $('#id_table_'+id+' > thead').append($('<th>Started by</th>'));
    $('#id_table_'+id+' > thead').append($('<th>Last post</th>'));

    $('#bodyChildBoard_'+id+' > tr').remove();
    
    var rows = [];
    for (var key in all)
    {
        for (var sub in all[key])
        {
            if (all[key][sub].subject.length < 2)
                continue;
                
            if (all[key][sub].topic != g_constants.GetTopForumAddress())
                continue;
                
            var message = all[key][sub].t
                .replace(/</g, "&lt")
                .replace(/>/g, "&gt")
                .replace(/\n/g, "<br>")
                .replace(/\[b\]/gi, "<b>")
                .replace(/\[\/b\]/gi, "</b>")
                .replace(/\[i\]/gi, "<i>")
                .replace(/\[\/i\]/gi, "</i>")
                .replace(/\[img/gi, "<img ")
                .replace(/\[\/img\]/gi, "</img>")
                .replace(/\]/g, ">")
                ;
            
            var subject = CreateSubject(id, key, sub);
            var tr = $('<tr></tr>')
                .append($('<td></td>'))
                .append($('<td></td>').append(subject))
                .append($('<td>'+all[key][sub].from+'</td>'))
                .append($('<td>'+(new Date(all[key][sub].s)).toLocaleString()+'</td>'));
                //.append($('<td>'+all[key][sub].from+'</td>'))
                //.append($('<td>'+message+'</td>'));
            
            rows.push({id: id, tr: tr, time: all[key][sub].s*1})    
            //$('#bodyChildBoard_'+id).append(tr);
        }
    }
    
    rows.sort((a, b) => {return b.time - a.time});
    
    for (var i=0; i<rows.length; i++)
        $('#bodyChildBoard_'+rows[i].id).append(rows[i].tr);
}

function CreateSubject(id, key, sub)
{
    const all = utils.getItem(id+'_messages').status == 'false' ? [] : utils.getItem(id+'_messages').value || [];
    
    if (!all[key] || !all[key][sub] || !all[key][sub].subject)
        return $('???');

    const href = "#"+id+"__"+key+"__"+sub+"__0";
    const a = $('<a href="'+href+'">'+all[key][sub].subject+'</a>');
    
    a.on('click', (e) => {
        e.preventDefault();
        history.pushState({}, "", e.currentTarget.hash);
        exports.ShowMessages(href);
    })
    return a;
}

exports.ShowMessages = function(subjectHREF)
{
    const href = subjectHREF ? subjectHREF : window.location.hash
    const id = href.substr(1).split('__');
    
    const all = utils.getItem(id[0]+'_messages').status == 'false' ? [] : utils.getItem(id[0]+'_messages').value || [];
    const key = id[1];
    const sub = id[2];
    const m = id[3];
    
    if (m != 0)
        return;
    
    const parent1 = id[0].indexOf('ru') == 0 ? $('#board_ru').clone() : $('#board_en').clone();
    const parent2 = $('#board_'+id[0]).clone();

    exports.HideAllTables();

    parent1.on('click', (e) => {
        e.preventDefault();
        history.pushState({}, "", "#"+e.currentTarget.id.split('_')[1]);
        exports.ShowBoard();
    })
    parent2.on('click', (e) => {
        e.preventDefault();
        history.pushState({}, "", "#"+e.currentTarget.id.split('_')[1]+"_"+e.currentTarget.id.split('_')[2]);
        exports.ShowBoardChild();
    })
    
    const subject = all[key] && all[key][sub] ? all[key][sub].subject || "???" : "???";
    
    $('#parentBoards').removeClass('hidden');
    $('#parentBoards').append($('<li></li>').append(exports.topParentBoard));
    $('#parentBoards').append($('<li></li>').append(parent1));
    $('#parentBoards').append($('<li></li>').append(parent2));
    $('#parentBoards').append($('<li>'+subject+'</li>'));

    $('#tableMessages').removeClass('hidden');
    
    $('#tableMessages > thead').empty();
    $('#tableMessages > thead').append($('<th>Author</th>'))
    $('#tableMessages > thead').append($('<th>Topic:'+subject+'</th>'));
   
    $('#tableMessages > tbody').empty();
    
    const topicAddress = GetTopicAddress();
    setTimeout(chat.Update, 1000, topicAddress);
    
    ShowMessage(all[key][sub]);
    
    const allMessages = utils.getItem(topicAddress+'_messages').status == 'false' ? [] : utils.getItem(topicAddress+'_messages').value || [];

    var messages = [];
    for (var key1 in allMessages)
    {
        for (var sub1 in allMessages[key1])
        {
            messages.push({message: allMessages[key1][sub1], time: allMessages[key1][sub1].s*1});
            //ShowMessage(allMessages[key1][sub1]);    
        }
    }
    
    messages.sort((a, b) => {return a.time - b.time;});
    
    for (var i=0; i<messages.length; i++)
        ShowMessage(messages[i].message);
}

function GetTopicAddress()
{
    const hash = g_crypto.createHash("sha256").update(window.location.hash).digest('base64');
    const buf = Buffer.from(hash.substr(0, 20));
    
    return bitcoin.address.toBase58Check(buf, g_network.pubKeyHash);
}
function ShowMessage(message)
{
    var reply = $('<div></div>');
    const topicAddress = GetTopicAddress();

    reply = $('<a id="id_reply" href="#Reply_'+topicAddress+'">'+'Reply'+'</a>');

    const donate = message.donate;
        
    reply.on('click', (e)=>{
            e.preventDefault();
            window.location.hash == e.currentTarget.hash ? {} : history.pushState({}, "", e.currentTarget.hash);
            $('#chat_main').removeClass('hidden');
            utils.setItem('donateAddress', donate);
            utils.setItem('parentBoard', topicAddress);
        })

    const headMessage = $('<tr></tr>').append($('<td>'+message.subject+'<br><small>'+(new Date(message.s)).toLocaleString()+'</small></td>')).append($('<td align="right"></td>').append(reply));
    const row = $('<tr></tr>')
        .append($('<td width="15%">'+message.from+'</td>'))
        .append($('<td></td>').append($('<table width="100%" border="0"></table>').append(headMessage)).append($('<hr style="margin-top: 4px;">')).append($('<div>'+message.t+'</div>')));
        

    $('#tableMessages > tbody').append(row);
}

