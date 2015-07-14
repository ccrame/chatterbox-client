var App = function(){
  this.username = window.location.search.split('=')[1];
  this.server = "https://api.parse.com/1/classes/chatterbox/";
  this.friends = {};
  this.rooms = {};
  this.messages = {};
  this.objectId = 1;

};

App.prototype.init = function(){
  // get messages
  // set interval for fetch
  setInterval(function(){
    app.fetch();
    //app.fetchRooms(app.rooms);
  },1000);
};

// POST message to server
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

//AddRoom to pass SpecRunner
App.prototype.addRoom = function(roomname){
  $("#roomSelect").append("<option value=" + roomname + ">" + roomname + "</option>");
};

// Retrieve messages from server
App.prototype.fetch = function(){
  // Store correct 'this' context
  $(".spinner").css({"display":"inline"});
  var thisApp = this;
  var tempObjectId;
  var firstNewUnique = true;
  var currentRoom = $("#selectedRoom").val();

  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: this.server,
    type: 'GET',
    contentType: 'application/json',
    success: function (messages) {
      //console.log(messages);
      var reversedMessages = _.sortBy(messages.results, 'createdAt');
      // Parse fetched messages

      for(var i = 0; i < reversedMessages.length; ++i){
        // Filter based on selected room
        if (reversedMessages[i].objectId === thisApp.objectId) {
          break;
        } else if (thisApp.objectId === 1) {
          thisApp.objectId = tempObjectId = reversedMessages[i].objectId;
          firstNewUnique = false;
        } else if (firstNewUnique){
          firstNewUnique = false;
          tempObjectId = reversedMessages[i].objectId;
        }
        // Append Messges to global message object
        thisApp.messages[reversedMessages[i].objectId] = reversedMessages[i];
      }

      if(!firstNewUnique){
        //console.log('swap');
        thisApp.objectId = tempObjectId;
      }

      // remove current messages
      thisApp.clearMessages();
      //console.log(thisApp.messages.length);
      _.each(thisApp.messages, function(message){
        // Filter for rooms
          //console.log(message);
          thisApp.addMessage(message);
      });

      console.log('chatterbox: Message retrieved - ' + messages);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to retrieve message');
    },
    complete: function(){
      $(".spinner").css({"display":"none"});
    }
  });
};//end of fetch

// Clear Messages from board
App.prototype.clearMessages = function(){
  $('#chats').children().remove();
};

// Add messages to board
App.prototype.addMessage = function(message){
  // Check friends list and add bold tag if message is from friend
  if (this.friends[message.username]) {
      $('#chats').prepend("<div class='message'><span><b><p>"+ app.clean(message.text) +"</p></span><span><a href='#' class='username'>"+ app.clean(message.username) +"</a><p>"+ message.createdAt +"</p></span></b></div>");
  } else {
    $('#chats').prepend("<div class='message'><span><p>"+ app.clean(message.text) +"</p></span><span><a href='#' class='username'>"+ app.clean(message.username) +"</a><p>"+ message.createdAt +"</p></span></div>");
  }

};

// Find Rooms and populate room selector
App.prototype.fetchRooms = function(room){
  // Ajax call via https://api.parse.com/1/classes/rooms/

  _.each(room,function(obj){
    // Check if roomname is in rooms obj
    if(true){
      $('#roomSelect').append("<option value=" + obj + ">" + obj + "</option>");
    }
  });

};



// Add friend to use's friends list
App.prototype.addFriend = function(friend){
  this.friends[friend] = friend;

};

// Process message to send to server
App.prototype.handleSubmit = function(){
  var text = $("#message").val();
  var roomname = $("#newRoom").val() === "" ? $("#roomSelect").val() : $("#newRoom").val();
  // check local rooms and store if not present
  if(!this.rooms[roomname]){
    this.rooms[roomname] = roomname;
    $('#roomSelect').append("<option value=" + roomname + ">" + roomname + "</option>");
  }

  var message = {
    "username": this.username,
    "text" : text,
    "roomname" : roomname
  };
  //call send function
  app.send(message);
};

// Basic cleaning used on retireved messages
App.prototype.clean = function(string) {
  if (string) {
    return string.replace(/(<)(.*?)(>)(.*?)(\1\/\2\3)+/g,"");
  } else {
    return "";
  }
};

// Parse Date-time to user-friendly format
App.prototype.parseDateTime = function(timeValue){
  var milliseconds = Math.floor( (new Date()).getTime() - timeValue );
  var currentTime = Math.round(milliseconds / 1000);
  var timeString, time;
  switch(true){
  //If currentTime is greater than 2 days
    case (currentTime > 172800):
      time = Math.floor(currentTime / 86400);
      timeString = time + " days ago";
      break;
  //If currentTime is greater than one day and less than two days
    case ( currentTime > 86400 && currentTime < 127800):
      timeString = "1 day ago";
      break;
  //If currentTime is greater than 1 hour and less than 24 hours
    case ( currentTime > 3600 && currentTime < 86400):
      time = Math.floor(currentTime / 3600);
      timeString = time + " hours ago";
      break;
  //If currentTime is greater than 1 minute and less than 1 hour
    case ( currentTime > 60 && currentTime < 3600):
      time = Math.floor(currentTime / 60);
      timeString = time + " minutes ago";
      break;
  //If currentTime is greater than 5 seconds and less than 60 seconds
    case ( currentTime > 5 && currentTime < 60):
      timeString = currentTime + " seconds ago";
      break;
  //Default case - currentTime is less than 5 seconds
    default:
      timeString = "Moments Ago";
  }
  return timeString;
};

var app = new App();


// Event Handlers
$(document).ready(function(){
  // NOT WORKING
  $('#send').on('submit', function(event){
    event.preventDefault();
    app.handleSubmit();
    $("#message").val("");
  });

  // Event Listener for adding friends
  $("#chats").on("click",".username",function(event){
    event.preventDefault();
    app.addFriend($(this).html());
    console.log(this.friends);
  });

  app.init();
}); // end document.ready