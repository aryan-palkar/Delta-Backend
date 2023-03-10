require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Blog = require("./Schema/BlogSchema");

const app = express();
const port = 3000;

app.use(express.json());

const db_user = process.env.MONGO_USERNAME;
const db_password = process.env.MONGO_PASSWORD;

const uri = `mongodb+srv://${db_user}:${db_password}
@cluster0.bgv5jqs.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);
mongoose.connect(
  uri,
  () => console.log("Connected to MongoDB!"),
  (e) => console.log("Error connecting to MongoDB", e)
);

app.get("/blog", async (req, res) => {
  const blogs = await Blog.find({});
  res.send({ size: blogs.length, blogs: blogs });
});

app.post("/blog", async (req, res) => {
  const [title, body] = [req.body.title, req.body.body];

  try {
    const blog = new Blog({ title, body });
    await blog.save();
    res.send("success");
  } catch (e) {
    res.send(e);
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
