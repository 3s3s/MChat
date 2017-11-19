'use strict';
const utils = require("./utils");
const ruBoards = require("./childboards/ruboards");
const enBoards = require("./childboards/enboards");
const common = require("./childboards/common");

exports.Init = function()
{
    common.InitBoards();
    
}

