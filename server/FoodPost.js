const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const relativeDate = require("tiny-relative-date");
const { Pool } = require("pg");
const secret = require("./secret.json");
// const creator = require("./services/creator.js");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const pool = new Pool(secret);

//FoodFeed
//See all food posts - username, title, barrio, description
//In order of creation
//Where status is available
app.get("/", (req, res) => {
  const query =
    "SELECT u.username, p.title, p.loc_barrio, p.description, p.post_date FROM posts p INNER JOIN users u ON p.users_id = u.id WHERE p.status='available' order by p.post_date asc limit 5";
  pool
    .query(query)
    .then((result) => {
      res.json(result.rows);
    })
    .catch((error) => console.error(error));
});

//FoodFeed - See more details about a specific post based on post ID
//Get the post ID from the front end - when the button is clicked, it will send the post ID to the backend params
app.get("/:postId", (req, res) => {
  const postId = req.params.postId;
  const query = `SELECT p.loc_street, p.phone FROM posts p INNER JOIN users u ON p.users_id = u.id WHERE p.id=${postId}`;
  pool
    .query(query)
    .then((result) => {
      res.json(result.rows);
    })
    .catch((error) => console.error(error));
});

//MyFoodPosts
//Get all food posts that I have posted, in order of post by most recent
//By my user ID
//Validate user is signed in
app.get("/myfoodposts/:userId", (req, res) => {
  const userId = 3; //Get user ID
  const query = `SELECT p.title, p.loc_barrio, p.loc_street, p.description, p.post_date, p.status FROM posts p WHERE p.users_id=${userId} order by p.post_date asc`;
  pool
    .query(query)
    .then((result) => {
      //Validate user is signed in
      res.json(result.rows);
    })
    .catch((error) => console.error(error));
});

//Food Post Form - Create a new food post
app.post("/new-post", (req, res) => {
  /* BODY */
  // {
  //     "title": "",
  //     "loc_barrio": "",
  //     "loc_street": "",
  //     "phone": "",
  //     "description": ""
  // }
  const now = new Date();
  const post = req.body;
  const userId = 1; //Fix this to authorize user who posts
  const postDate = now;
  //Format date using relativeDate(now);

  const query =
    "INSERT INTO posts (users_id, post_date, title, loc_barrio, loc_street, phone, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, default)";

  pool
    .query(query, [
      userId,
      postDate,
      post.title,
      post.loc_barrio,
      post.loc_street,
      post.phone,
      post.description,
    ])
    .then((result) => res.json(result.rows[0]))
    .catch((error) => console.error(error));

  // creator.createPost("Food Post");
});

app.listen(3000, () => console.log("Server is up and running"));
