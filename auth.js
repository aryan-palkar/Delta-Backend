require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const users = require("./Schema/UserSchema");
const bcrypt= require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 4000;

const cors = require('cors');
app.use(cors());

app.use(express.json());

const db_user = process.env.MONGO_USERNAME;
const db_password = process.env.MONGO_PASSWORD;
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

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

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(refreshToken, refreshSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ user: user });
    res.json({ accessToken: accessToken });
  }
  );
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await users.find({ username });
    console.log({user : user[0]})
    if (user.length !== 0 && (await bcrypt.compare(password,user[0].password)) ) {
      const accessToken = generateAccessToken({user : user[0]});
      const refreshToken = await jwt.sign({user : user[0]}, refreshSecret);

      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      res.send("incorrect username or password");
    }
  } catch (e) {
    res.send(e); 

  }
});

const generateAccessToken = (user) => {
  return jwt.sign(user, accessSecret, { expiresIn: "15s" });
};

app.listen(port, () => console.log(`Server listening on port ${port}!`));
