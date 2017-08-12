'use strict';

const $ = require('jquery');


exports.ModalDialog = function(id, title, body, onok, oncancel)
{
  const ok_button = $('<button type="button" class="btn btn-default" data-dismiss="modal">OK</button>');
  const close_button = $('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
  
  const footer = $('<div class="modal-footer"></div>');
  
  const strID = '#' + id;
 
  ok_button.click(function() {
      //$(strID).remove();
      if (onok) {
        jQuery(strID).modal('hide');
        setTimeout(onok, 10);
      }
  });
  
  close_button.click(function() {
      //$(strID).remove();
      if (oncancel) {
        jQuery(strID).modal('hide');
        setTimeout(oncancel, 10);
      }
  });

  if (onok) 
    footer.append(ok_button);

  footer.append(close_button);
  
  const $html = $(
        '<div class="modal fade" id="'+id+'" tabindex="-1" role="dialog" aria-labelledby="'+id+'Label"></div>').append(
          $('<div class="modal-dialog" role="document"></div>').append(
            $('<div class="modal-content"></div>').append(
              '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                '<h4 class="modal-title" id="'+id+'Label">'+title+'</h4>'+
              '</div>',
              '<div class="modal-body">'+ body + '</div>',
              footer
            )
          )
  );
    
  $('#' + id).remove();
    
  $( "body" ).append($html);

  
  return jQuery('#' + id);
};

exports.Alert = function(title, message, onok, oncancel)
{
  const strTitle = title || "";
  const strMessage = message || "";
  const id = "SimpleAlert";
  
  jQuery('#' + id).modal('hide');    

  //setTimeout(function(){
    exports.ModalDialog(id, strTitle, '<div>'+strMessage+'</div>', onok, oncancel);
    
    jQuery('#' + id).modal('show');    
  //}, 10);

}