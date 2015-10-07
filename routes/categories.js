var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var busboy = require('connect-busboy');

router.get("/add", function (req, res, next) {
    res.render("addcategory", {
        "title": "Add category"
    });
});

router.get("/test", function (req, res, next) {
    res.json({
        "title": "Add category"
    });
});

router.post("/add", function(req, res, next) {
    
    var title = req.body.title;
    var categories = db.get("categories");
    
    req.checkBody('title', 'Title field is required').notEmpty();
    
    // Check errors
    var err = req.validationErrors();

    if(err) {
        res.render("addcategory", 
            {"errors": err,
                "title": title});
    } else {
        var posts = db.get('categories');
        categories.insert({
            "title": title
        }, function(err, categories){
            if (err) {
                res.send('There was an issue submitting the category');
            } else {
                req.flash("success", "Category submitted");
                res.location("/");
                res.redirect("/");
            }
        });
    }
});

router.get("/show/:category", function(req, res, next) {
    
    var posts = db.get("posts");
    posts.find({"category": req.params.category}, function(err, posts) {
        res.render("index", {
            "title": req.params.category,
            "posts": posts
        })
    });
});



module.exports = router;