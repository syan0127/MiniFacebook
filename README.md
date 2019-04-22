# MiniFacebook
1. Names: Seyoung An (seyan), Hyun Ji Jung (hyju), Yeon Sang Jung (yeonj)

2. Features implemented:
	- Login: the user can login to the account with valid username and password
	- Signup: the user can create an account with an username and a password (duplicate username is not allowed)
	- Create Profile: once the user signs in, he/she can create a profile (name, email, date of birth, interests, affiliation)
	- Status Update: the user can update his/her status on the home page; other users who are friends with the user can see the current user’s post
	- Profile update: the user can edit his/her profile and this update is then created as a post, where his/her friends can see in their home page
	- Adding friend: the user can add a new friend by going to other user’s wall and pressing the button “add friend”
	- Adding comment: the user can add comments to the posts on his/her home page, wall page, and other user’s wall page
	- Friend recommendation: the user can see a list of recommended friends
	- Friend visualizer: the user can see all his/her friends on friend visualizer page; when a node is pressed, it the graph extends by showing the user’s friend’s friends who have the same affiliation
	- Chat: the user can chat with his/her friends; the user can add new group chat, leave the chat, see the online friends who are currently on the chat page
	- Search user: the use can search other users with usernames with search suggestion
	- Public message: the user can write a public message to his/her wall and other users’ walls
	- Dynamic page: the home page and the wall page refreshes every five seconds without flickering

3. EC implemented:
	- Friend requests: the user can send friend request to other users by going into their walls and clicking the ‘add friend button’; the user who receives the request can see the list of request on the home page and accept the requests
	- Notification: the user gets notifications of status updates of his/her friends; it refreshes every 3.5 seconds

4. List of source files

models/chat.js
models/chat_db.js
models/schema.js
views/chat.ejs
views/create_profile.ejs
views/edit_profile.ejs
views/friendvisualizer.ejs
views/fwall.ejs
views/home.ejs
views/login.ejs
views/signup.ejs
views/wall.ejs
routes/routes.js
public/js/friendvisualizer.js
public/js/jit.js
public/js/socket.io.js
app.js

Diff1Mapper.java
DIff1Reducer.java
Diff2Mapper.java
Diff2Reducer.java
Driver.java
FinMapper.java
FinReducer.java
InitMapper.java
InitReducer.java
Iter1Mapper.java
Iter1Reducer.java
Iter2Mapper.java
Iter2Reducer.java


5. We personally wrote all the code we are submitting.

6. For ec2: open ports 8080 and 3000 for http connection. To run it locally: type “npm install”, “node app.js” on the command line

To run FriendRecommendation:

put both friend and profile table csv in a directory called in.
!! Remove the first line if it contains the column information, not actual data

then run hadoop -d FriendRecommendation.jar Driver composite in out interim1 interim2 diff <number of reducers>

Finally, move the output file to the directory where app.js is located. (final) Then when the app starts, it will automatically fill in the recommendation on frontend.


