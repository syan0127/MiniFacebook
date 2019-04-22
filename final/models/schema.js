/**
 * http://usejsdoc.org/
 */
var fs = require('fs');
var vogels = require('vogels');
vogels.AWS.config.loadFromPath('credentials.json');
var Joi = require('joi');

var User = vogels.define('User', {
	hashKey : 'username',
	timestamps : true,
	schema : {
		username : Joi.string(),
		password : Joi.string(),
		userId : vogels.types.uuid()
	}
});

var Profile = vogels.define('Profile', {
	hashKey : 'userId',
	schema : {
		userId : vogels.types.uuid(),
		firstname : Joi.string(),
		lastname : Joi.string(),
		email : Joi.string().email(),
		affiliation : Joi.string(),
		interests : vogels.types.stringSet(),
		birthday : Joi.date()
	}
});

var Friends = vogels.define('Friends', {
	hashKey : 'userId',
	rangeKey : 'friendId',
	schema : {
		// changed to string for easier testing
		userId : Joi.string(),
		friendId : Joi.string(),
		// 1: requested, 2: pending, 3: accepted
		status : Joi.number()
	}
});

var Status = vogels.define('Status', {
	hashKey : 'postId',
	timestamps : true,
	schema : {
		postId : vogels.types.uuid(),
		content : Joi.string(),
		userId : vogels.types.uuid(),
		comment : [ {
			userId : vogels.types.uuid(),
			content : Joi.string(),
			time: Joi.string()
		} ],
	}
});

var Message = vogels.define('Message', {
	hashKey : 'postId',
	timestamps : true,
	schema : {
		postId: vogels.types.uuid(),
		userId : vogels.types.uuid(),
		sender: Joi.string(),
		content: Joi.string(),
		comment : [{
			sender : Joi.string(),
			content: Joi.string(),
			time: Joi.string()
		}]
	}
})


var Notification = vogels.define('Notification', { 
	hashKey: 'userId', 
	schema: {
		userId: vogels.types.uuid(), 
		updates: Joi.array().items(Joi.object().keys({
			//Joi.array().includes(Joi.object().keys({
			postId : vogels.types.uuid()
		}))
	} 
});


var Wall = vogels.define('Wall', {
	hashKey : 'userId',
	schema : {
		userId : vogels.types.uuid(),
		posts : //Joi.array().includes(Joi.object().keys({
		Joi.array().items(Joi.object().keys({//Joi.array().includes(Joi.object().keys({
			userId : vogels.types.uuid(),
			content : Joi.string()
		}))
	}
});

// Friend Recommendation Table
var Recommendation = vogels.define('Recommendation', {
	hashKey : 'userId',
	schema : {
		userId : vogels.types.uuid(),
		friends : Joi.array()
	}
});

var initTables = function() {
	// Because uuid is uniquely generated any table with key uuid grows
	// infinitely

	vogels.createTables(function(err) {
		if (err) {
			console.log('Error creating table: ' + err);
		} else {

			console.log('Tables initialized');
			
			console.log('Filling Database for friend recommendation');

			//loadExamples();
		}
	});
};

// search users whose usernames begin with given term
var getUsers = function(term, routes_callback) {
	User.scan().where('username').beginsWith(term).exec(routes_callback);
}

var getCurrentUser = function(username, routes_callback) {
	User.get(username, routes_callback);
}

// get the wall
var getWall = function(targetUserId, routes_callback) {
	Wall.get(targetUserId, routes_callback);
}

// get the friends
var getFriends = function(currentUserId, routes_callback) {
	Friends.scan().where('userId').equals(currentUserId).exec(routes_callback);
}

// add friendship between two users
var addFriend = function(userId, friendId, routes_callback) {
	var friendsArr = [ {
		userId : userId,
		friendId : friendId,
		status : 1
	}, {
		userId : friendId,
		friendId : userId,
		status : 2
	} ]
	Friends.create(friendsArr, routes_callback);
}

// update friendship between two users
var acceptFriend = function(userId, friendId, routes_callback) {
	Friends.update({
		userId : userId,
		friendId : friendId,
		status : 3
	}, routes_callback);
	Friends.update({
		userId : friendId,
		friendId : userId,
		status : 3
	}, routes_callback);
}

var addUser = function(username, password, routes_callback) {
	var obj = {
		username : username,
		password : password
	};
	User.create(obj, {
		overwrite : false
	}, function(err, user) {
		console.log("New user added:", user.get('username'));
		routes_callback(user, err);
	});
};

var getUser = function(username, callback) {
	User.get(username, function(err, user) {
		if (user) {
			var us = {
				password : user.get('password'),
				username : user.get('username'),
				userId : user.get('userId')
			}
			// console.log("getuser: ", us);
			callback(us, err);
		} else {
			callback(null, null);
		}
	});
};

var addProfile = function(userId, fname, lname, email, aff, dob, ints) {
	var array = ints.toString().split(',');

	console.log('array: ' + array);
	var temp = [ 'b', 'c' ];
	console.log('temp: ' + temp);
	for (var i = 0; i < array.length; i++) {
		array[i] = array[i].trim().replace(/\s\s+/g, ' ').toString();
	}

	var params = {
		userId : userId,
		firstname : fname,
		lastname : lname,
		email : email,
		affiliation : aff,
		interests : array,
		birthday : dob
	};
	Profile.create(params, {
		overwrite : false
	}, function(err, profile) {
		//console.log("New profile added:", profile.get('userId'));
		//console.log('params: ' + params);
		//console.log('err: ' + err);
	});

};

var getProfile = function(userId, callback) {

	Profile.get(userId, function(err, profile) {
		if (profile) {
			var pf = {
				userId : profile.get('userId'),
				firstname : profile.get('firstname'),
				lastname : profile.get('lastname'),
				email : profile.get('email'),
				affiliation : profile.get('affiliation'),
				interests : profile.get('interests'),
				birthday : profile.get('birthday')
			}
			callback(pf, err);
		} else {
			callback(null, null);
		}
	});
};

var deleteProfile = function(userId) {
	Profile.destroy(userId, function(err) {
		console.log('profile deleted');
	});
}

var updateProfile = function(userId, fname, lname, email, aff, dob, ints) {
	var array = ints.toString().split(',');
	// console.log('array: ' + array);
	// var temp = ['b', 'c'];
	// console.log('temp: ' + temp);
	for (var i = 0; i < array.length; i++) {
		array[i] = array[i].trim().replace(/\s\s+/g, ' ').toString();
	}

	var params = {
//<<<<<<< HEAD
			userId: userId,
			firstname: fname,
			lastname: lname,
			email: email,
			affiliation: aff,
			interests: array,
			birthday: dob
	    };
	    Profile.update(params, {overwrite: false}, function (err, profile) {
	        console.log("Profile updated:", profile.get('userId'));
	        console.log('params: ' + params);
	        console.log('err: ' + err);
	    });   
};



var addStatus = function(userId, content, callback) {

	console.log("addstatus: " + content);

	Status.create({content: content, userId: userId}, function (err, st) {
	  callback(st, err);

	});
};

var getStatuses = function(currentUserId, routes_callback) {
	var userId = currentUserId.substring(1);
	console.log("gettingstatuses: " + userId);
	Status.scan().where('userId').equals(userId).exec(routes_callback);

//	Status.scan().where('userId').equals('771ca460-5d1a-40fe-8a83-ecf828765e0b').exec(routes_callback);
}

var updateStatus = function(postId, comment) {
	
	console.log("adding comment: " + comment);
	
	var params = {};
    params.UpdateExpression = "SET #comment = list_append(if_not_exists(#comment, :empty), :comment)";
    params.ExpressionAttributeNames = {
        '#comment': 'comment'
    };
    params.ExpressionAttributeValues = {
        ':comment': [{
            comment
        }],
        ':empty': []
    };
    
	Status.update({postId: postId}, params, function (err, status) {
		console.log('comment added');
	});
}
// get notifications by currentuser's id
var getNotifications = function(currentUserId, routes_callback) {
	Notification.get(currentUserId, routes_callback);
}
// get status by postId
var getStatus = function(postId, routes_callback) {
	Status.get(postId.postId, routes_callback);
}

// add notification if not exist and update if exist
var updateNotification = function(friendId, updatedStatus, routes_callback) {
	console.log("UPDATING NOTIFICATION");
	Notification.get(friendId, function(err, noti) {
		if (err) {
			console.log(err);
		}
		else if (noti == null) {
			console.log("CREATING NOTIFICATION");
			var temp = [];
			var item = {
					postId: updatedStatus.postId
			}
			temp.push(item);
			Notification.create({ userId: friendId, updates: temp }, function (err, res) {
				routes_callback(err, res);
			});
		}
		else {
			
			var statusArr = noti.get('updates');
			statusArr.push({ postId: updatedStatus.postId });
			Notification.update({ userId: friendId, updates: statusArr }, function (err, res) {
				routes_callback(err, res);
			})
		}
	})
};

var addMessage = function(userId, sender, content, callback) {
	console.log("addmessage: " + content);
	Message.create({content: content, userId: userId, sender: sender}, function (err, msg) {
	  callback(msg, err);

	});
};

var getMessages = function(userId, routes_callback) {
	userId = userId.substring(1);
	console.log("gettingmessages: " + userId);
	Message.scan().where('userId').equals(userId).exec(routes_callback);
}

var getMessage = function(postId, routes_callback) {
	Message.get(postId.postId, routes_callback);
}

var updateMessage = function(postId, comment) {
	
	console.log("adding msg comment: " + comment);
	
	var params = {};
    params.UpdateExpression = "SET #comment = list_append(if_not_exists(#comment, :empty), :comment)";
    params.ExpressionAttributeNames = {
        '#comment': 'comment'
    };
    params.ExpressionAttributeValues = {
        ':comment': [{
            comment
        }],
        ':empty': []
    };
    
	Message.update({postId: postId}, params, function (err, status) {
		console.log('comment added');
	});
}


var deletePost = function(userId, postId, routes_callback) {
	Notification.get(userId, function(err, noti) {
		if (err) {
			console.log(err);
		}
		else {
			var statusArr = noti.get('updates');
			for (var i = 0; i < statusArr.length; i++) {
				if (statusArr[i].postId == postId) {
					statusArr.splice(i, 1);
					Notification.update({ userId: userId, updates: statusArr }, function (err, res) {
						routes_callback(err, res);
					})
				}
			}
		}
	})
}

var loadExamples = function() {
	console.log("READING OUTPUT FILE");
	var set = {};
	Profile.scan().loadAll().exec(function(err, data) {
		for (var i = 0; i < data.Items.length; i++) {
			var userId = data.Items[i].attrs.userId;
			set[userId] = true;
		}
		loadExamples2(set);
	});
}
var loadExamples2 = function(set) {
	var array = fs.readFileSync('part-r-00000.txt').toString().split("\n");
	var outputArr = [];
	for (i in array) {
		if (array[i] == '') continue;
		var keyNode = array[i].split('\t')[0];
		var labelNodes = array[i].split('\t')[1];
		
		// key is a usernode
		if (set[keyNode]) {
			var labelsArr = labelNodes.split(' ');
			
			var rankArr = [];		
			var count = 10;
			
			for (var j = 0; j < labelsArr.length; j++) {
				// itself
				if (keyNode == labelsArr[j]) continue;
				rankArr.push(labelsArr[j]);
				count--;
				if (count == 0) {
					break;
				}
			}
			
			outputArr.push({userId: keyNode, friends: rankArr});
				
		}
	}
	Recommendation.create(outputArr, function (err, recs) {
		console.log("Successfully created recommendations in DB" + recs);
	})
}

var getRecommendations = function(currentUserId, routes_callback) {
	
	console.log("GETTING RECOMMENDATIONS for " + currentUserId);
	// first get the fullname from the user id
	Recommendation.get(currentUserId, function(err, data) {
		if (err) {
			console.log(err);
		}
		else {
			routes_callback(err, data);
		}
		
	})
}

var getUsername = function(userId, routes_callback) {
	User.scan().where('userId').equals(userId).exec(routes_callback);
}

var schema = {
	init : initTables,
	addUser : addUser,
	getCurrentUser : getCurrentUser,
	addProfile : addProfile,
	getProfile : getProfile,
	deleteProfile : deleteProfile,
	updateProfile : updateProfile,
	getUsers : getUsers,
	getUser : getUser,
	getWall : getWall,
	getFriends : getFriends,
	
	// For adding/accepting Friendships
	addFriend : addFriend,
	acceptFriend : acceptFriend,
	
	addStatus: addStatus,
	getStatuses: getStatuses,
	updateStatus: updateStatus,
	getNotifications: getNotifications,
	getStatus: getStatus,
	updateNotification: updateNotification,
	addMessage: addMessage,
	getMessages: getMessages,
	getMessage: getMessage,
	updateMessage: updateMessage,
	
	// deleting post
	deletePost: deletePost,
	
	// get recommendations
	getRecommendations: getRecommendations,
	getUsername: getUsername
};
module.exports = schema;
