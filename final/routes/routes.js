var db = require('../models/schema.js');
var schema = require('../models/schema.js');
var async = require('async');
var SHA3 = require("crypto-js/sha3");


// Get Login Page
var get_login = function(req, res) {
  res.render('login.ejs');
};

// Login (post)
var post_check_login = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	if(!username || !password) {
		console.log('check login-blank');
		res.send('empty');
	} else {
		db.getUser(username, function(data, err) {
			if (err) {
				console.log('check login error: ' + err);
				res.send('error');
			} else if (data) {
				console.log('check login - found user');
				var pw = data.password;
				var hashedPassword = SHA3(password).toString();
				if(hashedPassword == pw.toString()) {
//				if(JSON.stringify(password) == JSON.stringify(pw)) {
					console.log('check login - success');
					console.log('session id: ' + req.sessionID);
					req.session.username = username;
					req.session.userId = data.userId;
					res.send('/home');
				} else {
					console.log('check login - incorrect password');
					res.send('wrong');
				}
			} else {
				console.log('check login-no such user');
				res.send('nouser');
			}
		});
	}
};

// Get Signup Page
var get_signup = function(req, res) {
	res.render('signup.ejs');
};

// Create account
var post_create_account = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	if(!username || !password) {
		console.log('signup-blank');
		res.send('empty');
	} else {
		db.getUser(username, function(data, err) {
			if (err) {
				console.log('signup error: ' + err);
				res.send('error');
			} else if (data) {
				console.log('signup-already exists');
				res.send('exists');
			} else {
				
				var hashedPassword = SHA3(password).toString();
				//MAKE SURE YOU CONVERT THE HASH TO A STRING AS DONE HERE
				//db.createUser(username, hashedPassword, function() { ... });
				console.log('signup-call addUser');
				req.session.username = username;
				//res.send('success');
//				var hash = bcrypt.hashSync(password, saltRounds);
				db.addUser(username, hashedPassword, function(data, err) {
					if (err) {
						console.log(err);
					}
					else {
						req.session.userId = data.get('userId');
						res.send('success');
					}
				});
			}
		});
	}
};

// Get Home page
var get_home = function(req, res) {
	if(req.session.username == null) res.redirect('/');
	console.log("GETTING HOMEPAGE FOR " + req.session.username);
	res.render('home.ejs');
};

// Get Update Profile page
var get_create_profile = function(req, res) {
	if(req.session.username == null) res.redirect('/');
	res.render('create_profile.ejs');
}

var post_create_profile = function(req, res) {
	var fname = req.body.fname.toLowerCase();
	var lname = req.body.lname.toLowerCase();
	var email = req.body.email;
	var aff = req.body.aff;
	var dob = req.body.dob;
	var ints = req.body.ints;
	var username = req.session.username;
	if(!fname || !lname || !email || !aff || !dob || !ints) {
		console.log('checkud-blank');
		res.send('empty');
	} else {
		db.getUser(username, function(data, err) {
			if (err) {
				console.log('checkud error: ' + err);
				res.send('error');
			} else if (data) {
				console.log('post-cp');
				res.send('success');
				var userId = data.userId;
				db.addProfile(userId, fname, lname, email, aff, dob, ints);
			} 
		});
	}
	console.log('done');
}

var get_logout = function(req, res) {
	//if username is not null destroy the session
	if (req.session.username != null){
	    req.session.destroy();
	} 
	//display main page
	res.render('login.ejs');
};

var get_wall = function(req, res) {
	if(req.session.username == null) res.redirect('/');
	res.render('wall.ejs');
}

//get the user that is currently logged in
var get_curr_user = function(req, res) {
	var currUser = req.session.username;
	if (currUser) res.send(currUser);
	else res.redirect('/');
}

var get_profile = function(req, res) {
	
	if(req.session.username == null) {
		res.redirect('/');
		return;
	}
	var username = req.session.username;
	db.getUser(username, function(data, err) {
		if (err) {
			console.log('getwall error');
			res.redirect('/wall');
		} else {
			var userId = data.userId;
			db.getProfile(userId, function(data, err) {
				if(err) {
					res.send('error');
				} else {
					res.send(JSON.stringify(data));
				}
			})
			console.log('getwall successfull');
		}
	});
}

var get_edit = function(req, res) {
	if(req.session.username == null) {
		res.redirect('/');
		return;
	}
	res.render('edit_profile.ejs');
}

var post_update_profile = function(req, res) {
	var fname = req.body.fname.toLowerCase();
	var lname = req.body.lname.toLowerCase();
	var email = req.body.email;
	var aff = req.body.aff;
	var dob = req.body.dob;
	var ints = req.body.ints;
	var username = req.session.username;
	if(!fname || !lname || !email || !aff || !dob || !ints) {
		console.log('checkud-blank');
		res.send('empty');
	} else {
		db.getUser(username, function(data, err) {
			if (err) {
				console.log('checkud error: ' + err);
				res.send('error');
			} else if (data) {
				console.log('post-cp');
				res.send('success');
				var p_fname = '';
				var p_lname = '';
				var p_aff = '';
				var p_ints = '';
				var p_dob = '';
				var p_email = '';
				var userId = data.userId;
				db.getProfile(userId, function(data2, err) {
					console.log('in getprofile');
					if(err) {
						//res.send('error');
					} else {
						p_fname = data2.firstname;
						p_lname = data2.lastname;
						p_aff = data2.affiliation
						p_ints = data2.interests;
						p_dob = data2.birthday;
						p_dob = p_dob.substring(0, 10);
						p_email = data2.email;
						var content = '';
						if(p_fname != fname) {
							content =  'Changed first name from ' + p_fname + ' to ' + fname;
						}
						if(p_lname != lname) {
							content =  content + "\n" + 'Changed last name from ' + p_lname + ' to ' + lname;
						}
						if(p_aff != aff) {
							content =  content + "\n" + 'Changed affiliation from ' + p_aff + ' to ' + aff;
						}
						if(p_ints != ints) {
							content =  content + "\n" + 'Changed interests from ' + p_ints + ' to ' + ints;
						}
						if(p_dob != dob) {
							content =  content + "\n" + 'Changed birhtday from ' + p_dob + ' to ' + dob;
						}
						if(p_email != email) {
							content =  content + "\n" + 'Changed email from ' + p_email + ' to ' + email;
						}
						
						content = content.trim();
						console.log('content: ' + content);
						db.addStatus(userId, content, function(data, err) {
							console.log('post add status: ' + JSON.stringify(data));
							//res.send(JSON.stringify(data));
						});
					}
				})
				
				db.updateProfile(userId, fname, lname, email, aff, dob, ints);
				
				
			} 
		});
	}
	console.log('done');
}

// for search box results
var get_users = function(req, res) {
	
	var term = req.params.term;
	var response = [];

	schema.getUsers(term, function(err, data) {
		if (err) {
			console.log("GET_USERS" + err);
		}  
		else {
			res.send(JSON.stringify(data.Items));
		}
	});	
}

//for getting currently logged-in user
var get_user = function(req, res) {
	var userName = req.session.username;
	console.log(userName);
	schema.getCurrentUser(userName, function(err, data) {
		if (err) {
			console.log("GET_USER" + err);
		}
		else {
			res.send(JSON.stringify(data));
		}
	});
}

// for getting target user's wall
var get_target_wall = function(req, res) {
	
	var targetUserId = req.params.targetUserId;
	schema.getWall(targetUserId, function(err, data) {
		if (err) {
			console.log("GET_TARGET_WALL" + err);
		}
		else {
			res.send(JSON.stringify(data));
		}
	})
}

// get friends array for current user
var get_friends = function(req, res) {
	var currentUserId = req.params.currentUserId;
	if (String(currentUserId).includes(':')) {
		currentUserId = currentUserId.substring(1);
	}
	console.log("CURRENT USER ID ISSSS " + currentUserId);
	schema.getFriends(currentUserId, function(err, data) {
		if (err) {
			console.log("GET_FRIENDS" + err);
		}
		else {
			res.send(JSON.stringify(data));
		}
	})
}

var get_chat = function(req, res) {
	if(req.session.username == null) res.redirect('/');
	console.log('get chat: ' + req.session.username);
	res.render('chat.ejs', {username: req.session.username, userId: req.session.userId});
}

// add friendship between two users (not accepted yet)
var post_add_friend = function(req, res) {
	
	var userId = req.body.userId;
	var friendId = req.body.friendId;
	
	schema.addFriend(userId, friendId, function(err, data) {
		if (err) {
			console.log("ADD_FRIEND" + err);
		}
		else {
			res.send(JSON.stringify(data));
		}
	})
}

// update friendship between two users (accepted)
var post_accept_friend = function(req, res) {
	
	var userId = req.body.userId;
	var friendId = req.body.friendId;
	
	schema.acceptFriend(userId, friendId, function(err, data) {
		if (err) {
			console.log("ACCEPT_FRIEND" + err);
		}
		else {
			res.send(JSON.stringify(data));
		}
	})
}

// get well-formed friendships json for visualization
var get_friends_visual = function (req, res) {
	var currentUserId = req.params.currentUserId;
	schema.getFriends(currentUserId, function(err, data) {
		if (err) {
			console.log("FRIENDS VISUAL" + err);
		}
		else {
			var allFriendsArr = data.Items;
			var friendsArr = [];
			
			// filter friends who are accepted
			for (var i = 0; i < allFriendsArr.length; i++) {
				if (allFriendsArr[i].attrs.status != 3) {
					continue;
				}
				friendsArr.push(allFriendsArr[i].attrs.friendId);
			}
						
			var currUserObj;
			schema.getProfile(currentUserId, function(data2, err) {
				currUserObj = {
						"id": currentUserId,
						"name": data2.firstname + " " + data2.lastname,
						"children": [],
						"data": []
				}
				
				var childrenArr = [];
				
				async.forEach(friendsArr, function(friend, call_bck) {
					schema.getProfile(friend, function(data3, err) {
						if (err) {
							console.log("ERROR GETTING FRIEND'S PROFILE" + err);
						} else if (data3) {
							//console.log("FRIEND'S PROFILE " + data);
							var friendObj = {
									"id": friend,
									"name": data3.firstname + " " + data3.lastname,
									"data": {},
									"children": []									
							}
							currUserObj.children.push(friendObj);
						}
						call_bck();
					});
				}, function(err) {
					res.send(currUserObj);
				});				
			});
		}
	})
}
			
			
var post_add_status = function(req, res) {
	
	var userId = req.body.userId;
	var content = req.body.content;
	
	if(!content) {
		console.log('add-status-blank');
		res.send('empty');
	} else {
		db.addStatus(userId, content, function(data, err) {
			console.log('post add status: ' + JSON.stringify(data));
			res.send(JSON.stringify(data));
		});
	}
	console.log('add-status-done');
}

var get_statuses = function(req, res) {
	var currentUserId = req.params.currentUserId;
//	console.log("here: " +currentUserId);
	schema.getStatuses(currentUserId, function(err, data) {
		if (err) {
			console.log("GET_Statuses " + err);
		}
		else {
			console.log("status data: "+ JSON.stringify(data));
			res.send(JSON.stringify(data));
		}
	})
}

var get_friends_friends_visual = function(req, res) {
	// First get the affiliation of current user
	var username = req.session.username;
	var friendId = req.params.userId;
		
	schema.getUser(username, function(data, err) {
		var currUserId = data.userId;
		schema.getProfile(currUserId, function(data2, err) {
			var currAffiliation = data2.affiliation;
			
			schema.getFriends(friendId, function(err, data3) {
				if (err) {
					console.log("ERROR GETTING FRIEND's FRIENDS");
				}
				else {
					var allFriendsArr = data3.Items;
					var friendsArr = [];
					
					// filter friends who are accepted
					for (var i = 0; i < allFriendsArr.length; i++) {
						if (allFriendsArr[i].attrs.status != 3) {
							continue;
						}
						friendsArr.push(allFriendsArr[i].attrs.friendId);
					}
							
					var currUserObj;
					schema.getProfile(friendId, function(data4, err) {
						currUserObj = {
								"id": friendId,
								"name": data4.firstname + " " + data4.lastname,
								"children": [],
								"data": []
						}
						
						var childrenArr = [];
						
						async.forEach(friendsArr, function(friend, call_bck) {
							schema.getProfile(friend, function(data5, err) {
								if (err) {
									console.log("ERROR GETTING FRIEND'S FRIENDS' PROFILE" + err);
								} else if (data5) {
									var friendObj = {
											"id": friend,
											"name": data5.firstname + " " + data5.lastname,
											"data": {},
											"children": []									
									}
									if (data5.affiliation == currAffiliation) {
										currUserObj.children.push(friendObj);
									}
								}
								call_bck();
							});
						}, function(err) {
							res.send(currUserObj);
						});				
					});	
				}
			})	
		})
	})
}

var get_name = function(req, res) {
	var userId = req.params.userId;
	userId = userId.substring(1);
	//console.log('gname: ' + userId);
	db.getProfile(userId, function(data, err) {
		if(err) {
			res.send('error');
		} else {
			//console.log('get name : ' + data.firstname);
			res.send(JSON.stringify(data));
		}
	})
	//console.log('get name successfull');
}

var post_add_comment = function(req, res) {
	var postId = req.body.postId;
	var userId = req.body.userId;
	var content = req.body.content;
	var time = req.body.time;
	console.log('post_Add_comment: ' + userId + ', ' + content + ', ' + postId);
	
	var comment = {
			userId : userId,
			content : content,
			time: time
	}
	
	db.updateStatus(postId, comment);
}

var get_notifications = function(req, res) {
	
	var currentUserId = req.params.currentUserId;
	schema.getNotifications(currentUserId, function(err, data) {
		if (data == null) {
			res.send([]);
			return;
		}
		var postIdArr = data.get('updates');
		var statusArr = [];
		async.forEach(postIdArr, function(postId, call_back) {
			schema.getStatus(postId, function(err, data2) {
				if (err) {
					console.log("ERROR GETTING STATUS " + err);
				}
				else if (data2) {					
					schema.getProfile(data2.get('userId'), function(data3, err) {
						if (err) {
							console.log("ERRO GETTING PROFILE INSIDE GET_NOTI" + err);
						} else {
							var statusObj = {
									"postId": postId.postId,
									"author": data3.firstname + " " + data3.lastname,
									"content": data2.get('content')					
							}
							statusArr.push(statusObj);
							call_back();
						}
					})
				}
				
			})
		}, function(err) {
			res.send(statusArr);
		});
	})
}

var get_target_profile = function(req, res) {
	
	var targetUserId = req.params.targetUserId;
	schema.getProfile(targetUserId, function(data, err) {
		if (err) {
			console.log("ERROR GETTING PROFILE " + err);
		}
		else {
			console.log(data);
			res.send(JSON.stringify(data));
		}
	})
}

var post_send_notifications = function(req, res) {
	
	var friendIdArr = req.body.friendIdArr;
	var updatedStatus = req.body.updatedStatus;
	
	console.log(friendIdArr);
	console.log(updatedStatus);
	async.forEach(friendIdArr, function(friendId, call_back) {
		console.log("SENDING UDPATED STATUS TO " + friendId);
		schema.updateNotification(friendId, updatedStatus, function(err, data) {
			if (err) {
				console.log(err);
			}
			else if (data) {					
				console.log("updated one for " + friendId);
			}			
		})
	}, function(err) {
		res.send("Success");
	});
}

var get_friend_profile = function(req, res) {
	
	var userId = req.params.targetUserId;
	userId = userId.substring(1);
	db.getProfile(userId, function(data, err) {
		if(err) {
			res.send('error');
		} else {
			res.send(JSON.stringify(data));
		}
	})
	console.log('get_friend_profile successfull');
}

var get_friend_wall = function(req, res) {
	console.log('in here!');
	if(req.session.username == null) res.redirect('/');
	res.render('fwall.ejs');
}

var post_add_message = function(req, res) {
	
	var userId = req.body.userId;
	var sender = req.body.sender;
	var content = req.body.content;
	
	if(!content) {
		console.log('add-message-blank');
		res.send('empty');
	} else {
		db.addMessage(userId, sender, content, function(data, err) {
			console.log('post add messagge: ' + (data));
			res.send(JSON.stringify(data));
		});
	}
	console.log('add-message-done');
}

var get_messages = function(req, res) {
	var userId = req.params.userId;
	console.log("getmsg routes : " +userId);
	schema.getMessages(userId, function(err, data) {
		if (err) {
			console.log("GET_messages " + err);
		}
		else {
			console.log("message data: "+ JSON.stringify(data));
			res.send(JSON.stringify(data));
		}
	})
}

var post_message_add_comment = function(req, res) {
	var postId = req.body.postId;
	var sender = req.body.sender;
	var content = req.body.content;
	var time = req.body.time;
	console.log('post_msg add_comment: ' + sender + ', ' + content + ', ' + postId);
	
	var comment = {
			sender : sender,
			content : content,
			time: time
	}
	
	db.updateMessage(postId, comment);
}

var get_recommendations = function(req, res) {
	var currentUserId = req.params.currentUserId;
	console.log(currentUserId);
	if (String(currentUserId).includes(':')) {
		currentUserId = currentUserId.substring(1);
	}
	console.log('getting recommendations');
	schema.getRecommendations(currentUserId, function(err, data) {
		if (err) {
			console.log("GET_rec " + err);
		}
		else if (data == null){
			console.log("No Rec yet");
		}
		else {
			var returnArr = [];
			var recFriendsIdArr = data.get('friends');
			
			async.forEach(recFriendsIdArr, function(friendId, call_back) {
				schema.getProfile(friendId, function(data1, err) {
					if (err) {
						console.log(err);
					}
					else {					
						var fullName = data1.firstname + " " + data1.lastname;
						schema.getUsername(friendId, function(err, data2) {
							
							var friendUsername = data2.Items[0].attrs.username;
							var obj = {
									friendId: friendId,
									friendName: fullName,
									friendUsername: friendUsername
							}
							returnArr.push(obj);
							call_back();
						})
					}			
				})
			}, function(err) {
				res.send(returnArr);
			});	
		}
	})
}

var get_friends_names = function(req, res) {
	var friendIdArr = req.body.arr;
	
	var tempArr = [];
	
	console.log(friendIdArr);
	
	async.forEach(friendIdArr, function(friendId, call_back) {
		db.getProfile(friendId, function(data, err) {
			if(err) {
				console.log(err);
			} else {
				//console.log('get name : ' + data.firstname);
				var firstname = data.firstname;
				var lastname = data.lastname;
				var fullname = firstname + " " + lastname;
				tempArr.push(fullname);
				call_back();
			}
		})
	}, function(err) {
		res.send(tempArr);
	});
}

var post_delete_post = function(req, res) {
	
	console.log(req.body.targetPostId);
	console.log(req.body.userId);
	
	var userId = req.body.userId;
	var postId = req.body.targetPostId;
	
	db.deletePost(userId, postId, function(err, data) {
		if (err) {
			console.log("Failed to delete post");
		}
		else {
			res.send(data);
		}
	})
}

var routes = { 
  get_login: get_login,
  get_user: get_user,
  get_users: get_users,
  
  post_check_login: post_check_login,
  get_signup: get_signup,
  post_create_account: post_create_account,
  get_home: get_home,
  get_create_profile: get_create_profile,
  post_create_profile: post_create_profile,
  get_logout: get_logout,
  get_wall: get_wall,
  get_curr_user: get_curr_user,
  get_profile: get_profile,
  get_edit: get_edit,
  post_update_profile: post_update_profile,
  get_target_wall: get_target_wall,
  
  // getting/adding/updating friends
  get_friends: get_friends,
  post_add_friend: post_add_friend,
  post_accept_friend: post_accept_friend,
  
  // get friends json for visualization
  get_friends_visual: get_friends_visual,
  // get friend's friends json
  get_friends_friends_visual: get_friends_friends_visual,
  
  get_chat: get_chat,
  post_add_status: post_add_status,
  get_statuses: get_statuses,
  get_name: get_name,
  post_add_comment: post_add_comment,
  
  // get notifications
  get_notifications: get_notifications,
  
  // get target user's profile
  get_target_profile: get_target_profile,
  
  // send notifications
  post_send_notifications: post_send_notifications,
  get_friend_profile: get_friend_profile,
  get_friend_wall: get_friend_wall,
  
  post_add_message: post_add_message,
  get_messages: get_messages,
  post_message_add_comment: post_message_add_comment,
  get_recommendations: get_recommendations,
  
  // get friends' names
  get_friends_names: get_friends_names,
  
  // for deleting post
  post_delete_post: post_delete_post
  
};

module.exports = routes;
