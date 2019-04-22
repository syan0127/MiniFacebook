/**
 * http://usejsdoc.org/
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = {};   // socketid -> username
var users = {};     // username -> socketid
var uuid = require('uuid/v4');
var db = require('./chat_db.js');
var friend_db = require('./schema.js');


var channels = {}; // chatName --> messages TODO replace this with an actual database
//var messages = {}; // channelId -> {timestamp, user, message}
// channel object schema
// {
//   channelName: string
//   members: [usernames]
// }


var init = function() {
    http.listen(3000, function() {
        console.log('listening on :3000');
    });
    io.on('connection', connection_handle);
    db.initChatTable();
};

var connection_handle = function(socket) {
    var username = socket.handshake.query.username;
    var userId = socket.handshake.query.userId;
    notify_friends_login(username);
    //io.to(socket.id).emit('login', Object.keys(users));
    sockets[socket.id] = username;
    users[username] = socket.id;
    console.log('Adding user: ' + socket.id + '; ' + username);

    socket.on('message', function(msg) { message_handle(socket, msg); });
    socket.on('join_channel', function(msg){ join_channel_handle(socket, msg); });
    socket.on('request_channel', function(msg) { request_channel_handle(socket, msg); });
    socket.on('create_channel', function(msg) { create_channel_handle(socket, msg); });
    socket.on('leave_channel', function(msg) { leave_channel_handle(socket, msg) });
    socket.on('ping_active', function(msg) { ping_handle(socket, msg); });
    socket.on('online_check', function(msg) { online_check_handle(socket, msg); });
    socket.on('disconnect', function() { disconnect_handle(socket); });
    socket.on('request_channel_data', function(msg) { request_channel_data_handle(socket, msg) });
    socket.on('invite_user', function(msg) { invite_user_handle(socket, msg); });

    friend_online_check(userId, socket.id);
    
    db.updateActive(userId, username, Date.now(), function(err, post) {
        if (err) console.log('updateActive err, '+ err);
    });
};

var notify_friends_login = function(login_username) {
    for (socketid in sockets) {
        io.to(socketid).emit('friend_login', {username: login_username});
    }
}

// save and pass incoming message to all members in the chat
// timestamp of the message is attached on server side
// msg: {channelId: string, message: string}
// output: {channelId, channelName, user, timestamp, message}
var message_handle = function(socket, msg) {
    var channelId = msg.channelId;
    var messageObj = {channelId: channelId, user: sockets[socket.id], timestamp: Date.now(), message: msg.message};
    //messages[channelId].push(messageObj);
    db.addMessage(messageObj);
    var members = channels[channelId].members;
    for (var i=0; i<members.length; i++) {
        var member = members[i];
        if (users[member] && users[member] != socket.id) {
            io.to(users[member]).emit('message', messageObj);
        }
    }
}

// join an existing channel, or a new dm channel (we consider dm channels 'existing' because the channelId can be determined)
// msg: {channelId: string, (only for dms) member: username of the other user}
var join_channel_handle = function(socket, msg) {
    var channelId = msg.channelId;
    var channelName;
    var requestedUser = sockets[socket.id];
    if (requestedUser < msg.member) {
        channelName = requestedUser + ', ' + msg.member;
    } else {
        channelName = msg.member + ', ' + requestedUser;
    }
    // add the dm channel to persistent storage
    if ('member' in msg && !(channelId in channels)) {
        channels[channelId] = {
            channelId: channelId,
            channelName: channelName,
            members: [sockets[socket.id], msg.member]
        };
        db.addChannel(channels[channelId]);
        db.getMessage(channelId, 1, function(err, data) {
            if (err) console.log('get message dynamo error, ' + err);
            if (data) {
                socket.emit('get_messages', data);
            } else {
                socket.emit('get_messages', []);
            }
        });
        socket.emit('get_channel', channels[channelId]);
        return;
    }
    db.getChannel(channelId, function(err, data) {
        if (err) console.log("dynamo get channel err, " + err);
        if (data) {
            socket.emit('get_channel', data);
        }
    });
    db.getMessage(channelId, 1, function(err, data) {
        if (err) console.log("dynamo get channel err " + err);
        if (data) {
            socket.emit('get_messages', data);
        }
    });
    
}

// create a new group chat; server returns the channel id
// msg: {channelName: string, members: [string] (include requester)}
var create_channel_handle = function(socket, msg) {
    var channelId = uuid();
    var channelObj = {
        channelId: channelId,
        channelName: msg.channelName,
        members: msg.members
    }
    channels[channelId] = channelObj;
    db.addChannel(channelObj, function(err, post) {
        if (err) console.log('addChannel err, '+err);
    });
    socket.emit('get_channel', channelObj);
    socket.emit('get_messages', []);
}

// send requested channel object. msg: {channelId: string}
var request_channel_handle = function(socket, msg) {
    db.getChannel(msg.channelId, function (err, data) {
        if (err) console.log ('getchannel error, '+err);
        else socket.emit('get_channel', data);
    });
    db.getMessage(msg.channelId, 1, function (err, data) {
        if (err) console.log ('getmessage error, '+err);
        else socket.emit('get_messages', data);
    });
}

// msg: {channelId}
var leave_channel_handle = function(socket, msg) {
    var channelId = msg.channelId;
    if (channelId in channels) {
        var members = channels[channelId].members;
        var index = members.indexOf(sockets[socket.id]);
        if (index >= 0) {
            members.splice(index, 1);
        }
        db.removeMember(channelId, sockets[socket.id], function(err, post) {
            if (err) console.log('removeMember error, '+err);
            else {
                console.log(JSON.stringify(post));
                // TODO remove chat if everyone has left
            }
        });
        // destroy the chatroom if everyone has left
        //if (members.length == 0) {
            // remove from persistent storage as well
        //    delete channels[channelId];
        //}
    }
}

var ping_handle = function(socket, msg) {
    console.log('Ping received by ' + sockets[socket.id]);
    db.updateActive(msg.userId, sockets[socket.id], Date.now(), function(err, post) {
        if (err) console.log('updateActive err, '+ err);
    });
}

var online_check_handle = function(socket, msg) {
    console.log('Online check received');
    friend_online_check(msg.userId, socket.id);
}

var disconnect_handle = function(socket) {
    var logout_username = sockets[socket.id];
    delete sockets[socket.id];
    delete users[logout_username];
    //notify_friends_logout(logout_username);
}

var request_channel_data_handle = function(socket, msg) {
    var channelId = msg.channelId;
    db.getChannel(channelId, function(err, data) {
        if (err) console.log("dynamo get channel err, " + err);
        if (data) {
            socket.emit('get_channel_data', data);
        }
    });
}

var invite_user_handle = function(socket, msg) {
    var channelId = msg.channelId;
    var toInvite = msg.members;
    db.addMember(channelId, toInvite, function(err, data) {
        if (err) console.log('addmember error, ' + err);
    });
    for(var i=0; i<toInvite.length; i++) {
        channels[channelId].members.push(toInvite[i]);
    }
}

var notify_friends_logout = function(logout_username) {
    for (socketid in sockets) {
        io.to(socketid).emit('friend_logout', {username: logout_username});
    }
}

var friend_online_check = function(userId, socketId) {
    // send online friend list here
    friend_db.getFriends(userId, function(err, data) {
        if (err) console.log ("chat getFriends err, " + err);
        else if (data) {
            // Items: [list of friends ids]
            var friendIds = [];
            for (var i=0; i<data.Items.length; i++) {
                var array = data.Items;
                friendIds.push(array[i].attrs.friendId);
            }
            //console.log('List of friends: ' + JSON.stringify(friendIds));
            db.batchGetActive(friendIds, function(err, data) {
                if (err) console.log('batchgetActiv err, '+err);
                else if (data) {
                    var activeUsers = [];
                    var time = Date.now();
                    for (var i=0; i<data.length; i++) {
                        console.log('Comparing ' + time + ' and ' + data[i].attrs.timestamp);
                        if (data[i].attrs.timestamp + 10*1000 >= time) {
                            console.log('User ' + data[i].attrs.username + ' is active.');
                            activeUsers.push(data[i].attrs.username);
                        }
                    }
                    io.to(socketId).emit('login', activeUsers);
                }
            });
        }
    });
}

var chat = { 
    init: init
};

module.exports = chat;