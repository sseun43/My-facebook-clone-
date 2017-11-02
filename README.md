###  API-FIRST FACEBOOK CLONE
* https://social-network-api.herokuapp.com/

###### NOTE:This project is still work in progress and its not yet complete and structured.It is just to practice my ability to use Nodejs,express and MongoDB database. I have completed the API part but the front-end part is not yet done, also I intend to use web-socket to make the messaging and the status more responsive.

#### USER STORY

1. User can create new profile by sending POST request with (name,age,password,email,profile picture url) body
 	* POST: https://social-network-api.herokuapp.com/new
2. User can login into their profile by sending POST request with (name,password) body
	* POST: https://social-network-api.herokuapp.com/login
3. User can create public status by sending POST request with (status) body
	* POST: https://social-network-api.herokuapp.com/mystatus
4. User can view all status by sending GET request
	* GET: https://social-network-api.herokuapp.com/allstatus
5. User can view a list of all profile names by sending GET request to
	* GET: https://social-network-api.herokuapp.com/list
6. User can view their profile by sending GET request to
	* GET: https://social-network-api.herokuapp.com/myprofile
7. User can send friend request by sending a GET request with the friends name as params
	* GET: https://social-network-api.herokuapp.com/sendRequest/<friend name>
8. User can view there friend request list by sending a GET request
	* GET: https://social-network-api.herokuapp.com/viewmyrequest
9. User can accept friends from there friend request list by sending a GET request with the friends unique id as params
	* GET: https://social-network-api.herokuapp.com/acceptrequest/<friend unique id>
10. User can remove friends from there friend request list by sending a GET request with the friends unique id as params
	* GET: https://social-network-api.herokuapp.com/rejectrequest/<friend unique id>
11. User can remove friend from their friend list by sending GET request with the friends unique id as params
	* GET: https://social-network-api.herokuapp.com/removefriend/<friend unique id>
12. User can send messages to other friends by sending POST request with the friends unique id as params and(message and unique messageId) body
	* POST: https://social-network-api.herokuapp.com/createmessage/<friend unique id>
13. User can view all their message history by sending GET request
	* GET: https://social-network-api.herokuapp.com/allmessages
14. User can logout by sending GET request
	* GET: https://social-network-api.herokuapp.com/logout