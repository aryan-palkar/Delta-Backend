require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const users = require("./Schema/UserSchema");
const bcrypt= require("bcrypt")

const app = express();
const port = 4000;

app.use(express.json());

const db_user = process.env.MONGO_USERNAME;
const db_password = process.env.MONGO_PASSWORD;

const uri = `mongodb+srv://${db_user}:${db_password}@cluster0.bgv5jqs.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);
mongoose.connect(
  uri,
  () => console.log("Connected to MongoDB!"),
  (e) => console.log("Error connecting to MongoDB", e)
);

app.get("/", (req, res) => res.send("Hello Niyu!"));

app.post("/signup", async (req, res) => {
 const [email, displayName, username, password] = [
    req.body.email,
    req.body.displayName,
    req.body.username,
    req.body.password,
  ];

  const check = await users.find({ username: username });
  if (check.length != 0) {
    return res
      .status(401)
      .send("This username is already taken , try another one");
  }
  try {
    const hashedPassword= await bcrypt.hash(password,10)
    const newuser = new users({
      email: email,
      displayName: displayName,
      username: username,
      password: hashedPassword,
    });
    await newuser.save();
    res.status(201).send("Success");
  } catch (e) {
    res.send(e);
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const check = await users.find({ username });
    if (check.length === 1 && (await bcrypt.compare(password,check[0].password)) ) {
      res.send("success");
    } else {
      res.send("incorrect username or password");
    }
  } catch (e) {
    res.send(e); 

  }
});
app.listen(port);
