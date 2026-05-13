var UserModel = require('../models/userModel.js');

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: function (req, res) {
        var user = new UserModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });

        user.save(function (err, user) {

            if (err) {
                // IMPORTANT: had a problem so with err.code, so I checked both because if err.error.code is empty it crashes everything
                // required handles moongoose, unique handles mongodb (it goes in the database and checks and then sends)
                const errorCode = err.code || (err.error && err.error.code); 
                const keyValue = err.keyValue || (err.error && err.error.keyValue);

                // duplicate key error (username/email already exists)
                if (errorCode === 11000) {
                    const field = Object.keys(keyValue)[0];
                    const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
                    const errorMsg = `${formattedField} already exists`;
                
                    return res.status(409).json({ message: errorMsg });
                }

                // validation error (mongoose), works because of minlength: 1
                if (err.name === 'ValidationError') { // because of required
                    // only one message
                    const exactErrorMsg = Object.values(err.errors)[0].message; 
                    return res.status(400).json({ message: exactErrorMsg });
                }

                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            return res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email
            });
        });   
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.name = req.body.name ? req.body.name : user.name;
			
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }, 
    login: function (req, res, next) {
        UserModel.authenticate(req.body.username, req.body.password, function(err, user){
            if(err || !user){
                return res.status(401).json({ message: 'Wrong username or password!' });
            }
            req.session.userId = user._id;
            //res.redirect('/users/profile');
            return res.json({
                _id: user._id,
                username: user.username,
                email: user.email
            });
        });
    },
    profile: function(req, res, next){
        if (!req.session.userId) {
            return res.status(401).json({ error: "Not logged in" });
        }

        UserModel.findById(req.session.userId)
        .exec(function(error, user){
            if (error) return next(error);

            if (!user) {
                return next(new Error('User not found'));
            }

            return res.json({
                id: user._id,
                username: user.username,
                email: user.email
            });
        });
    },

    logout: function(req, res, next){
        if(req.session){
            req.session.destroy(function(err){
                if(err){
                    return next(err);
                } else{
                    //return res.redirect('/');
                    return res.status(200).json({}); // logout succesful, nothing else to return
                }
            });
        }
    }

};
