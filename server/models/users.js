var mongoose = require('mongoose');
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var dateFormat = require(__base + 'utils/dateFormat');

var Schema = mongoose.Schema;

userSchema = new Schema({
    nome: {type: String, required: true, unique: true},
    email: String,
  	username: { type: String, required: true, index: { unique: true }},
  	password: { type: String, required: true, unique: true},
});

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if(!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.methods.clean = function() {
    var resObj = {};
    resObj._id = this._id;
    resObj.username = this.username;
    resObj.email = this.email;
    resObj.nome = this.nome;

	return resObj;
};

userSchema.statics.secureFind = function(userId, cb) {
    if(userId){
        this.findOne({_id: userId}, {password:0}).exec(function(err, user){
            if(err) return cb(err, null);
            cb(null, user);
        });
    }else{
        this.find({}, {password:0}).exec(function(err, users){
            if(err) return cb(err, null);
            cb(null, users);
        });
    }
};

userSchema.statics.secureUpdate = function(userId, newUser, cb) {

    var globalThis = this;

    this.findOne({_id: userId}, function(err, user){
        if(err) return cb(err, null);

        if(user){

            user.nome = newUser.nome;
            if(newUser.password){
                user.password = newUser.password;
            }

            user.email = newUser.email;

            if(newUser.username && user.username != newUser.username){

                globalThis.findOne({username: newUser.username}, function(err, hasUser){
                    if(err) return cb(err, null);

                    if(!hasUser){
                        user.username = newUser.username;

                        user.save(function(err, us){
                            if(err) return cb(err, null);

                            return cb(null, us.clean());
                        });
                    }else{
                        //Return with mongo duplicate key error code
                        var errObj = {code: 11000, message:"Usuário já cadastrado"};
                        return cb(errObj, null);
                    }
                });
            }else{
                user.save();
                return cb(null, user.clean());
            }

        }else{
            return cb({message: "User Not Found"});
        }
    });
};


User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
