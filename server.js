require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Blog = require("./Schema/BlogSchema");
const jwt = require("jsonwebtoken");
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const db_user = process.env.MONGO_USERNAME;
const db_password = process.env.MONGO_PASSWORD;
const accessSecret = process.env.ACCESS_TOKEN_SECRET;

const uri = `mongodb+srv://${db_user}:${db_password}
@cluster0.bgv5jqs.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);
mongoose.connect(
  uri,
  () => console.log("Connected to MongoDB!"),
  (e) => console.log("Error connecting to MongoDB", e)
);

const authenticateToken = (req, res, next) => {
  // console.log(req.headers)
  const authHeader = req.headers["authorization"];
  // console.log(authHeader)
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, accessSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user.user;
    next();
  });
}

app.get("/blog", async (req, res) => {
  const blogs = await Blog.find({});
  res.send({ size: blogs.length, blogs: blogs });
});

app.post("/blog", authenticateToken, async (req, res) => {
  console.log(req.body)
  const [title, body] = [req.body.title, req.body.body];

  try {
    const blog = new Blog({ title, body });
    await blog.save();
    res.send("success");
  } catch (e) {
    res.send(e);
  }
});

app.post("/like", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const blogId = req.body.blogId;

  const blog = await Blog.find({_id : blogId});
  console.log(blog)

  if (!blog[0].likes.includes(userId)) {
    blog[0].likes.push(userId);
  }else{
    blog[0].likes.splice(blog[0].likes.indexOf(userId), 1);
  }
  await blog[0].save();
  res.send({"likes" : blog[0].likes.length});
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
