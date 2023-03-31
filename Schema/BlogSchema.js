const mongoose = require("mongoose");

const BlogSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        likes: {
            type: Array,
            default: [],
        },
        comments: {
            type: Array,
            default: [],
        },
    }
);

module.exports = mongoose.model("Blog", BlogSchema);