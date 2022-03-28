const express = require('express');
const mongoose = require('mongoose');
const Person = require('./models/person');
const Post = require('./models/post')
const path = require('path');
const { populate } = require('./models/person');
const bcrypt = require('bcrypt');
const session = require('express-session')
const methodOverride = require('method-override')
const Review = require('./models/review')




const app = express();

mongoose.connect('mongodb://localhost:27017/practice');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database connected");
});

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use('/css/', express.static(__dirname + '/public/stylesheets/'));




app.use(session({secret: 'notagoodsecret'}));
const requireLogin = (req,res,next) =>{
    if (!req.session.user_id){
      return res.redirect('/login')
    }
    next();
}



app.get('/home', async (req, res)=>{
    const users = await Person.find({});
    res.render('home')
})

app.get('/users/new', (req, res)=>{
    res.render('signup');
})

app.post('/users', async (req, res)=>{
    const object = req.body;
    const hash = await bcrypt.hash(object.password, 12)
    console.log(object);
    console.log(hash);
    const user = new Person({username: object.username, password: hash, firstname: object.firstname, lastname:object.lastname, email:object.email});
    await user.save();
    req.session.user_id = user._id;
    res.redirect(`users/${user._id}`);
})
app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login', async(req, res)=>{
    const object = req.body;
    const user = await Person.findOne({username: object.username})
    console.log(user)
    bcrypt.compare(object.password, user.password, (err, validPassword)=>{
        if (validPassword){
          req.session.user_id = user._id;
          res.redirect(`users/${user._id}`);
        } else{
          res.redirect('/login')
        }
      });

})

app.get('/users/:id', requireLogin, async (req, res)=>{
    const id = req.params.id;
    const author = await Post.find({}).populate('user');
    const mainUser = await Person.findById(id);
    console.log(author);
    res.render('detail', {author, mainUser});
})

// Post


app.get('/users/:id/posts', requireLogin, async(req, res)=>{
    const object = req.params.id;
    const user = await Person.findById(object).populate('items');
    res.render('newpost', {user})
})

app.post('/users/:id/posts', async(req, res)=>{
    const id = req.params.id;
    const object= req.body
    const post = new Post(object);
    const user = await Person.findById(id)
    user.items.push(post);
    post.user = user;
    await post.save();
    await user.save();
    res.redirect(`/users/${user._id}/posts`);
    
})

app.get('/users/:id/posts/:ID', requireLogin, async (req,res)=>{
    const ID = req.params.ID;
    const id = req.params.id;
    const user = await Person.findById(id);
    const post = await Post.findById(ID);
    res.render('edit', {post, user});

})

app.get('/logout',(req,res)=>{
    req.session.user_id = null;
    res.redirect('/login');
  })

  app.put('/users/:id/posts/:ID', async (req, res)=>{
      const id = req.params.id;
      const ID = req.params.ID;
      const object = req.body
      const post = await Post.findByIdAndUpdate(ID, object)
      await post.save()
      res.redirect(`/users/${id}/posts`)

  })

// particular post

app.get('/users/:id/post/:ID', async(req, res)=>{
    const id = req.params.ID;
    const user = await Person.findById(req.params.id)
    const post = await Post.findById(id).populate('user').populate('reviews')
    res.render('showpost', {post, user});
})
app.post('/users/:id/post/:ID', async (req, res)=>{
    const id = req.params.ID;
    const user = await Person.findById(req.params.id)
    const object = req.body;
    const review = new Review ({description: object.description, author: user.firstname });
    const post = await Post.findById(id)
    post.reviews.push(review)
    post.save()
    review.save()
    res.redirect(`/users/${user._id}/post/${post._id}`)


})





app.listen('3000')