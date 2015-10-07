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
            "author": author
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

module.exports = router;