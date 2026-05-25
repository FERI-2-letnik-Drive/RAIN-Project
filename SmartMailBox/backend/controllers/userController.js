var UserModel = require('../models/userModel.js');
var bcrypt = require('bcrypt');

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
            
            return res.json(users.map(user => ({
                _id: user._id,
                username: user.username,
                email: user.email
            })));
            // return res.json(users);
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
                _id: user._id,
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
    },

    updateProfile: function (req, res) {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: "You must be logged in" });
        }

        if (!req.body.username || req.body.username.trim().length === 0) {
            return res.status(400).json({ message: "Username is required" });
        }

        if (!req.body.email || req.body.email.trim().length === 0) {
            return res.status(400).json({ message: "Email is required" });
        }

        UserModel.findById(req.session.userId, function (err, user) {
            if (err) {
                return res.status(500).json({ message: "Error finding user", error: err });
            }

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            user.username = req.body.username.trim();
            user.email = req.body.email.trim();

            user.save(function (err, user) {
                if (err) {
                    const errorCode = err.code || (err.error && err.error.code); 
                    if (errorCode  === 11000) {
                        return res.status(400).json({
                            message: "Username or email already in use"
                        });
                    }

                    if (err.name === "ValidationError") {
                        return res.status(400).json({
                            message: "Invalid profile data",
                            error: err
                        });
                    }

                    return res.status(500).json({
                        message: "Error updating profile",
                        error: err
                    });
                }

                return res.json({
                    _id: user._id,
                    username: user.username,
                    email: user.email
                });
            });
        });
    },

    changePassword: function (req, res) {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: "You must be logged in" });
        }

        if (!req.body.currentPassword || req.body.currentPassword.trim().length === 0) {
            return res.status(400).json({ message: "Current password is required" });
        }

        if (!req.body.newPassword || req.body.newPassword.trim().length === 0) {
            return res.status(400).json({ message: "New password is required" });
        }

        if (!req.body.confirmPassword || req.body.confirmPassword.trim().length === 0) {
            return res.status(400).json({ message: "Confirm password is required" });
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        UserModel.findById(req.session.userId, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: "Error finding user",
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            bcrypt.compare(req.body.currentPassword, user.password, function (err, result) {
                if (err) {
                    return res.status(500).json({
                        message: "Error checking password",
                        error: err
                    });
                }

                if (!result) {
                    return res.status(400).json({ message: "Current password is incorrect" });
                }

                user.password = req.body.newPassword;

                user.save(function (err) {
                    if (err) {
                        if (err.name === "ValidationError") {
                            return res.status(400).json({
                                message: "Invalid password",
                                error: err
                            });
                        }

                        return res.status(500).json({
                            message: "Error changing password",
                            error: err
                        });
                    }

                    return res.status(200).json({ message: "Password changed successfully" });
                });
            });
        });
    }, 

    mobileLogin: function (req, res, next) {
        UserModel.authenticate(req.body.username, req.body.password, function (err, user) {
            if (err || !user) {
                //console.log(err.message)
                return res.status(401).json({ message: "Wrong username or password" });
            }

            if (user.twoFactorEnabled) {
                // we use pendingMobile2FAUserId, because user is still not logged in!
                req.session.pendingMobile2FAUserId = user._id;

                return res.status(200).json({
                    requires2FA: true,
                    message: "Password correct. Face verification required."
                });
            }

            req.session.userId = user._id;

            return res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                twoFactorEnabled: user.twoFactorEnabled
            });
        });
    },

    mobileFaceVerifyLogin: async function (req, res) {
        try {
            if (!req.session || !req.session.pendingMobile2FAUserId) {
                return res.status(401).json({ message: "No pending mobile login." });
            }

            const orvApiRes = await fetch(process.env.ORV_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            });

            const orvData = await orvApiRes.json();

            if (!orvApiRes.ok || !orvData.match) {
                return res.status(401).json({ message: "Face verification failed." });
            }

            req.session.userId = req.session.pendingMobile2FAUserId;
            delete req.session.pendingMobile2FAUserId;

            // do not return password hash ("-password -email") if I wouldn't want email
            const user = await UserModel.findById(req.session.userId).select("-password");

            return res.status(200).json(user);
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Face verification service error"
            });
        }
    },
    
    

};
