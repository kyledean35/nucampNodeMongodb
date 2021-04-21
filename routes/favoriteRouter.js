const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const Campsite = require('../models/campsite');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user:req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite) {
            favorite.campsites.forEach(function(camp){
                req.body.forEach(function(fav){
                if (!camp._id.equals(fav._id)){
                    favorite.campsites.push(fav);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }
                else{
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('This is already a favorite!');
                }
            })   
        });
        } else {
            favorites= new Favorite;
            favorites.user=req.user._id
            req.body.forEach(function(fav){
                favorites.campsites.push(fav);
            });
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user:req.user._id}, function (err, doc) {
        if (doc==null){
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        }
    })
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)){
                res.setHeader('Content-Type', 'text/plain');
                res.end("That campsite is already in the list of favorites!");
            }
            else {
                favorite.campsites.push({"_id":req.params.campsiteId.toString()});
                favorite.save();
                res.setHeader('Content-Type', 'text/plain');
                res.end(`${req.params.campsiteId} added to favorites`);
            }
        }
        else {
            favorites = new Favorite;
            favorites.user=req.user._id;
            favorites.campsites.push({"_id":req.params.campsiteId.toString()});
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        }
    })
    
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
    .then (favorite => {
        if (favorite){
            const index= favorite.campsites.indexOf(req.params.campsiteId);
            if (index > -1) {
                favorite.campsites.splice(index, 1);
                favorite.save();
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              }
            else {
                res.setHeader('Content-Type', 'text/plain');
                res.end(`${req.params.campsiteId} is not in favorites`);
            }
        }
        else {
            res.setHeader('Content-Type', 'text/plain');
                res.end(`There are no favorites`);
        }
    })
});


module.exports = favoriteRouter;
