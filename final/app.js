/**
 * http://usejsdoc.org/
 */

var express = require('express');

var app = express();

var routes = require('./routes/routes.js');
var vogels = require('vogels');
var schema = require('./models/schema.js');


var async = require('async');

// requirements for chat
var chat = require('./models/chat.js');
var uuid = require('uuid/v4');

app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(express.cookieParser());
app.use(express.session({
	genid: function(req) {
		return uuid();
	},
	resave: false,
	saveUninitialized: true,
	secret: 'thisIsMySecret'}));

app.get('/signup', routes.get_signup);
app.get('/home', routes.get_home);
app.get('/makeprofile', routes.get_create_profile);
app.get('/logout', routes.get_logout);
app.get('/wall', routes.get_wall);
app.get('/getcurruser', routes.get_curr_user);
app.get('/getprofile', routes.get_profile);
app.get('/edit', routes.get_edit);
app.get('/chat', routes.get_chat);
app.get('/getname/:userId', routes.get_name);
app.get('/getfprofile/:targetUserId', routes.get_friend_profile);
app.get('/fwall/:targetUserId', routes.get_friend_wall);

app.post('/checklogin', routes.post_check_login);
app.post('/createacc', routes.post_create_account);
app.post('/createprofile', routes.post_create_profile);
app.post('/updateprofile', routes.post_update_profile);
app.get('/', routes.get_login);
app.get('/suggest/:term', routes.get_users);
app.get('/curruser', routes.get_user);
app.get('/targetwall/:targetUserId', routes.get_target_wall);
app.get('/friends/:currentUserId', routes.get_friends);

// For adding/accepting friendships
app.post('/addfriend', routes.post_add_friend);
app.post('/acceptfriend', routes.post_accept_friend);

// changed
app.post('/addstatus', routes.post_add_status);

app.get('/getstatuses/:currentUserId', routes.get_statuses);
app.post('/addcomment/:userId', routes.post_add_comment);

app.post('/addmessage', routes.post_add_message);
app.get('/getmessages/:userId', routes.get_messages);
app.post('/msgaddcomment', routes.post_message_add_comment);
// Get Friend Visualization page
app.get('/friendvisual', function(req, res) {
	if(req.session.username == null) res.redirect('/');
	res.render('friendvisualizer.ejs');
});

// Get friends info from databse
app.get('/friendvisualization/:currentUserId', routes.get_friends_visual);
// On Click event function, get friend's friends with same affiliation
app.get('/getFriends/:userId', routes.get_friends_friends_visual);

//Get notifications
app.get('/notifications/:currentUserId', routes.get_notifications);

// Get profile from userId
app.get('/targetprofile/:targetUserId', routes.get_target_profile);

// Send notifications
app.post('/sendNotifications', routes.post_send_notifications);

// For getting the names of pending friendIds
app.post('/friendsNames', routes.get_friends_names);

// For deleting clicked post
app.post('/deletePost', routes.post_delete_post);

//recommended friendships
app.get('/recs/:currentUserId', routes.get_recommendations);



app.use('/', express.static(__dirname + "/public",{maxAge:1}));


schema.init();
chat.init();

app.listen(8080);

