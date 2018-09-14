var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Products', new Schema({ 
    productName: String,
    description: Number,
    availability: Boolean
}));