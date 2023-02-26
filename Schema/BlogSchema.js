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
        }
    }
);

module.exports = mongoose.model("Blog", BlogSchema);