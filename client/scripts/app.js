var App = function(){
  this.username = window.location.search.split('=')[1];
  this.server = "https://api.parse.com/1/classes/chatterbox";
  this.friends = {};

};

App.prototype.init = function(){};
App.prototype.send = function(message){

  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: this.server,
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
};

App.prototype.fetch = function(){
  // Store correct 'this' context
  var thisApp = this;
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: this.server,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      // Parse fetched messages
      _.each(data.results,function(message){
        // Filter based on selected room
        thisApp.addMessage(message);
      });
      console.log('chatterbox: Message retrieved - ' + data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to retrieve message');
    }
  });
};//end of fetch

App.prototype.clearMessages = function(){
  $('#chats').children().remove();
};

App.prototype.addMessage = function(message){
  // Add message without createdAt
  $('#chats').append("<div class='message'><span><p>text: "+ this.clean(message.text) +"</p></span><span><a href='#' class='username'>"+ this.clean(message.username) +"</a></span></div>");
  // Add message with createdAt
  // $('#chats').append("<div class='message'><span><p>"+ message.text +"</p></span><span><p>"+ message.username +"</p><p>"+ parseDateTime(message.createdAt) +"</p></span></div>");
};

App.prototype.addRoom = function(room){
  $('#roomSelect').append("<option value=" + room + ">" + room + "</option>");
};

App.prototype.addFriend = function(friend){
  this.friends[friend] = friend;
};

App.prototype.handleSubmit = function(){
  var text = $("#message").val();
  var roomname = $("#roomSelect").val();
  var message = {
    "username": this.username,
    "text" : text,
    "roomname" : roomname
  };
  //call send function
  app.send(message);
  console.log(message);
};

App.prototype.clean = function(string) {
  if (string) {
    return string.replace(/(<)(.*?)(>)(.*?)(\1\/\2\3)+/g,"");
  } else {
    return "";
  }
};

var app = new App();
app.fetch();

$(document).ready(function(){
// NOT WORKING
  $('.submit').on("trigger",function(event){
    //event.preventDefault();
    app.handleSumbit();
  });

  // Event Listener for adding friends
  $("#chats").on("click",".username",function(event){
    event.preventDefault();
    app.addFriend($(this).html());
  });



}); // end document.ready