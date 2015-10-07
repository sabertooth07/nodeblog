var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var busboy = require('connect-busboy');

router.get("/add", function (req, res, next) {
    var categories = db.get("categories");
    var authors = db.get("authors");
    
    categories.find({}, function(err, categoriesJson){
        authors.find({}, function(err, authorsJson) {
            res.render('addpost', {
                "title": "add post",
                "categories": categoriesJson,
                "authors": authorsJson
            });
        });
    });

});


router.post("/add", function(req, res, next) {
    // Get form values
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();
    
    // Form validation
    req.checkBody('title', 'Title field is required').notEmpty();
    req.checkBody('category', 'Category field is required').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();
    req.checkBody('author', 'Author field is required').notEmpty();
    
    // Check errors
    var err = req.validationErrors();
    
    if(err) {
        res.render("addpost", {
            "errors": err,
            "title": title,
            "body": req.body
        });
    } else {
        var posts = db.get('posts');
        posts.insert({
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "mainimage": "noimage.png"
        }, function(err, posts){
            if (err) {
                res.send('There was an issue submitting the post');
            } else {
                req.flash("success", "Post submitted");
                res.location("/");
                res.redirect("/");
            }
        });
    }
    
    
    // if(req.files.image) {
        // console.log(true);
    // } else {
        // console.log(false);
    // }
    
    // console.log(req.busboy);
    // console.log(__dirname);
    // console.log(req.headers);
    
    // //var fstream;
    // //req.pipe(req.busboy);
    // //var busboy = new Busboy({headers: req.headers})
    // req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        // console.log("hi...............");
        // console.log("Uploading: " + filename); 
        // console.log("fieldname: " + fieldname); 
        // console.log("destination: " + __dirname); 
        
        // var fstream = fs.createWriteStream(__dirname + '../public/images/uploads/' + filename);
        // file.pipe(fstream);

        // file.pipe(fstream);
        // fstream.on('close', function () {
            // res.redirect('back');
        // });
    // });
    // // req.busboy.on('finish', function() {
      // // res.writeHead(200, { 'Connection': 'close' });
      // // res.end("That's all folks!");
    // // });
    // return req.pipe(busboy);
});

router.get("/show/:_id", function(req, res, next) {
    
    var posts = db.get("posts");
    posts.find({"_id": req.params._id}, function(err, post) {
        res.render("show", {
            "title": post.title,
            "posts": post
        })
    });
});

router.post("/addcomment", function(req, res, next) {
    // Get form values
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postid = req.body.postid;
    var date = new Date();
    
    // Form validation
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email is not formatted correctly').isEmail();
    req.checkBody('body', 'Body field is required').notEmpty();
    
    // Check errors
    var validationErrors = req.validationErrors();
    
    if(validationErrors) {
        var posts = db.get("posts");
        //posts.findById(postid, function(err, post) {
        posts.find({"_id": postid}, function(err, post) {
            res.render("show", {
                "errors": validationErrors,
                "title": post.title,
                "posts": post
            });
        })
    } else {
        var comment = {"name": name,
            "email": email,
            "body": body,
            "commentdate": date}

        var posts = db.get('posts');
        posts.update({
            "_id": postid
        }, {
            $push: {
                "comments": comment
            }
        }, function(err, doc){
            if (err) {
                res.send('There was an issue submitting the post');
            } else {
                req.flash("success", "Comment submitted");
                res.location("/posts/show/"+postid);
                res.redirect("/posts/show/"+postid);
            }
        });
    }
});


module.exports = router;