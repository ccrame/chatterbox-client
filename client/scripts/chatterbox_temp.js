var App = function(){
  this.username = window.location.search.split('=')[1];
  this.friends = {};
};

App.prototype.init = function(){};

App.prototype.send = function(message){
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};//end of send


App.prototype.fetch = function(){
  var context = this;
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      app.messages = data;
      app.showMessages(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};//end of fetch


// temporary function, do not include in final version
App.prototype.showMessages = function(messages){
  var newMessages = [];
  console.log("this = ", this);
  var tempObjectId;
  var firstNewUnique = true;

  //store new messages to newMessages array
  for(var i = 0; i < messages.results.length; ++i){
    if(messages.results[i].username !== undefined && messages.results[i].text !== undefined){
      //console.log("app.objectId = " + this.objectId + "  result objectId = " + messages.results[i].objectId);
      if(this.objectId === messages.results[i].objectId){
        break;
      } else if (this.objectId === undefined){
        this.objectId = tempObjectId = messages.results[i].objectId;
        firstNewUnique = false;
      } else if (firstNewUnique){
        firstNewUnique = false;
        tempObjectId = messages.results[i].objectId;
      }
      newMessages.push(messages.results[i]);
    }
  }

  if(!firstNewUnique){
    //console.log('swap');
    this.objectId = tempObjectId;
  }

  //insert new messages into DOM
  for(i = newMessages.length - 1; i >= 0; --i){
    var date = newMessages[i].createdAt;
    var name = newMessages[i].username === "" ? "[no name]:" : this.filterXSS(newMessages[i].username) + ':';
    var text = newMessages[i].text === "" ? "[no message]" : this.filterXSS(newMessages[i].text);
    $("#chats").prepend("<div class='message'><span><p>" + name + "   " + date + "</p><span><span><p>" + text + "</p></span></div>");
  }
}//end of showMessages


// remove any possible XSS
App.prototype.filterXSS = function(str){
  return str.replace(/(<)(.*?)(>)(.*?)(\1\/\2\3)+/g,"");
}

//create the app object
var app = new App;

//jQuery below!
$(document).ready(function(){
// NOT WORKING
  $('.submit').on("click",function(event){
    event.preventDefault();
    var text = $("#message").val();
    var message = {
      username: app.username,
      text: text,
      roomname: "temp"
    };
    app.send(message);
    app.fetch();
    app.showMessages(app.messages);
  });

  // Event Listener for adding friends
  $("#chats").on("click",".username",function(event){
    event.preventDefault();
    app.addFriend($(this).html());
  });
}); // end document.ready