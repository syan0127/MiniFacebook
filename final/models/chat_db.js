var vogels = require('vogels');
vogels.AWS.config.loadFromPath('credentials.json');
var Joi = require('joi');

var ChatMessage = vogels.define('ChatMessage', {
    hashKey: 'channelId',
    rangeKey: 'timestamp',
    schema: {
        channelId: Joi.string(),
        timestamp: Joi.number(),
        user: Joi.string(),
        message: Joi.string()
    }
});

var Channel = vogels.define('Channel', {
    hashKey: 'channelId',
    timestamps: true,
    schema: {
        channelId: Joi.string(),
        channelName: Joi.string(),
        members: vogels.types.stringSet()
    }
});

var Active = vogels.define('Active', {
    hashKey: 'userId',
    schema: {
        userId: Joi.string(),
        username: Joi.string(),
        timestamp: Joi.number()
    }
});

var initChatTable = function() {
    // Because uuid is uniquely generated any table with key uuid grows
    // infinitely

    vogels.createTables(function(err) {
        if (err) {
            console.log('Error creating table: ' + err);
        } else {
            console.log('Chat Tables initialized');
        }
    });
};

var getChannel = function(channelId, callback) {
    Channel.get(channelId, callback);
};

// rewind = 0 gets the 50 most recent messages
// rewind = 1 gets the 51 - 100 most recent messages, and so on
var getMessage = function(channelId, rewind, callback) {
    ChatMessage
        .query(channelId)
        .descending().limit(50*rewind).ascending().exec(callback);
};

var addChannel = function(channelObj, callback) {
    Channel.create(channelObj, {overwrite: false}, callback);
};

var addMessage = function(messageObj, callback) {
    ChatMessage.create(messageObj, callback);
};

var addMember = function(channelId, user, callback) {
    Channel.update({
        channelId: channelId,
        members: {$add: user}
    }, callback);
};

var removeMember = function(channelId, user, callback) {
    Channel.update({
        channelId: channelId,
        members: {$del: [user]}
    }, callback);
};

// input: list of userIds to fetch
// output: list of usernames of active users
var batchGetActive = function(friends, callback) {
    Active.getItems(friends, callback);
}

var updateActive = function(userId, username, time, callback) {
    Active.create({
        userId: userId,
        username: username,
        timestamp: time
    }, callback);
}

var chat_db = {
    initChatTable: initChatTable,
    getChannel: getChannel,
    getMessage: getMessage,
    addChannel: addChannel,
    addMessage: addMessage,
    addMember: addMember,
    removeMember: removeMember,
    batchGetActive: batchGetActive,
    updateActive: updateActive
}
module.exports = chat_db;