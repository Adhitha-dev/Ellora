//requires
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
const sanitize = require('sanitize-html')
require('dotenv').config();
const { v4: uuid } = require('uuid');
const session = require('express-session');

//configuring express
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 30
}))
app.use(session({
	secret: process.env.SESSION_SECRET || 'ellora-dev-session-secret-key-2026',
	resave: true,
	saveUninitialized: true
}))

//configuring mongoose
if (process.env.MONGO_URL) {
	mongoose.connect(process.env.MONGO_URL)
		.then(() => console.log('Connected to MongoDB'))
		.catch(err => console.error('MongoDB connection error:', err));
} else {
	console.warn('Warning: MONGO_URL not provided. MongoDB connection skipped.');
}
const postSchema = mongoose.Schema({
		username: String,
		title: String,
		desc: String,
		time: Array,
		date: Array,
		replyCount: Number,
		replies: Array
})
const replySchema = mongoose.Schema({
		username: String,
		reply: String,
		time: String,
		date: String
})
const Post = mongoose.model( 'Post',postSchema );

//defining express routes

// Health check endpoint for CI/CD and monitoring
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'UP',
		app: 'Ellora',
		timestamp: new Date().toISOString()
	});
});

// Root route
app.get( '/', ( req,res ) => {
		res.render('home');
})

// Index route
app.get( '/posts', ( req,res ) => {
		Post.find()
		.then( newData => {
				data = newData.toReversed()
				res.render( 'index', { data } );
		})
})

// Create route
app.get( '/create', ( req,res ) => {
		res.render('post');
})
app.post( '/posts', ( req,res ) => {
		let { username, title, desc } = req.body;
		const [ time, date ] = moment();

		username = sanitizer(username);
		title = sanitizer(title);
		desc = sanitizer(desc);

		req.session.username = username;
		if(username === process.env.ADMIN){
			username = "victor";
		}

		const post = new Post( {
				username: username,
				title: title,
				desc: desc,
				time: time,
				date: date,
				replyCount: 0,
				replies: []
		});

		post.save().then(() => res.redirect( '/posts' ));
})

// Show route
app.get( '/posts/:id',( req,res ) => {
		const { id } = req.params;
		Post.findById(id)
		.then( data => {
				res.render( 'show', { data } )
		})
})

// Update route
app.get( '/posts/:id/edit',( req,res ) => {
		const { id } = req.params;
		Post.findById(id)
		.then( data => {
				res.render( 'edit', { data } )
		})
})
app.patch( '/posts/:id',( req,res ) => {
		const { id } = req.params;
		const { title,desc } = req.body;
		Post.findById(id)
		.then( data => {
				data.title = title;
				data.desc = desc;
				data.save();
		})
		res.redirect('/posts');
})

// Delete route
app.delete( '/posts/:id',( req,res ) => {
		const { id } = req.params;
		if(req.session.username === process.env.ADMIN){
			Post.deleteOne({ _id: id })
				.then( resp => {
					res.redirect('/posts');
				})
		}else{
			res.redirect('/posts');
		}
})

// Replies functionality
app.get( '/posts/:id/reply',( req,res ) => {
		const { id } = req.params;
		Post.findById(id)
		.then( data => {
				res.render( 'reply',{ data } )
		})
})
app.post( '/posts/:id/reply',( req,res ) => {
		const { id } = req.params;
		let { userReply } = req.body;
		userReply = sanitizer(userReply);
		const [ time,date ] = moment();
		let username = 'Anon'
		if(req.session.username === process.env.ADMIN){ username = 'victor' }
		else{ username = req.session.username}
		const reply = {
				replyId: uuid(),
				username: username,
				reply: userReply,
				time: time,
				date: date
		}

		Post.findById(id)
		.then( data => {
				data.replies.push( reply );
				data.replyCount++;
				data.save().then(() => res.redirect( `/posts/${id}/reply` ));
		})
})
app.post( '/posts/:id/:replyId', (req,res) => {
	const { id,replyId } = req.params;
	if(req.session.username === process.env.ADMIN){
		Post.updateOne({ _id: id }, { $pull: { replies: { replyId }}, $inc: { replyCount: -1 } } ).then(
			() => {
				res.redirect(`/posts/${id}/reply`)
			}
		)
	} else{
		res.redirect(`/posts/${id}/reply`)
	}
})
//Express App listen port
const PORT = process.env.PORT || 3000;
let server;
if (process.env.NODE_ENV !== 'test') {
	server = app.listen( PORT, () => {
		console.log( `Ellora server listening on port ${PORT}` );
	});
}

//Custom Functions
function moment(){
		const d = new Date();
		date = d.toDateString();
		time = d.toLocaleTimeString().split(" ");
		date = [date.split(' ').slice(1,-1).join(" "),date.split(' ').slice(-1).join(" ")];
		return [time, date];
}
function sanitizer(value){
	return sanitize(value, {
		allowedTags: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'],
		allowedAttributes: {},
	})
}

module.exports = { app, server, sanitizer, moment };