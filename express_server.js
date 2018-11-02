const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const app = express();
let PORT = 3000;
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {};

var users = {};

function generateRandomString() {
  let result = '';
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// displays main page
app.get("/", (req, res) => {
  res.send("Welcome to the main page!");
});

// displays database in json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
});

// display main page
app.get("/urls", (req, res) => {
  let templateVars = {
    users: users,
    currentUser: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("urls_index.ejs", templateVars);
});

// displays new url page, redirects to register if not logged in
app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: users,
    currentUser: req.cookies["user_id"]
  };
  if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/register")
  }
});

// displays shortURL info and ability to update corresponding longURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: users,
    currentUser: req.cookies["user_id"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id][req.cookies["user_id"]]
  };
    res.render("urls_show", templateVars)
});

// redirects client to corresponding longURL
app.get("/u/:shortURL", (req, res) => {
  for (var URLcookie in urlDatabase[req.params.shortURL]) {
    var longURL = urlDatabase[req.params.shortURL][URLcookie]
  }
  res.redirect(longURL);
});

// displays registration page
app.get("/register", (req, res) => {
  res.render("urls_register")
});

// displays login page
app.get("/login", (req, res) => {
  res.render("urls_login")
});

// creates new url and driects user to information page for the shortURL
app.post("/urls", (req, res) => {
  let rng = generateRandomString()
  urlDatabase[rng] = {};
  urlDatabase[rng][req.cookies["user_id"]] = req.body.longURL
  res.redirect(`/urls/${rng}`);
});

// deletes a url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

// replaces longURL with newURL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id][req.cookies["user_id"]] = req.body.longURL
  res.redirect(`/urls/${req.params.id}`)
});

// allows user to login, displays error if empty input
app.post("/login", (req, res) => {
  for (var username in users) {
    var matchFound = false;
    var userMatch;
    if (users[username].email === req.body.email && users[username].password === req.body.password) {
      matchFound = true
      userMatch = users[username].id
    }
  };
    if (matchFound) {
      res.cookie("user_id", userMatch)
      res.redirect("/urls")
    } else {
      res.status(403)
      res.send('Error code 403: Paramaters not found')
    };
});

// logs user out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
});

// allows user to register and save their login info
app.post("/register", (req, res) => {
  let rng = generateRandomString()
  users[rng] = {};
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Error code 400: Please enter input')
  } else {
  users[rng].id = rng
  users[rng].email = req.body.email
  users[rng].password = req.body.password
  res.cookie('user_id', rng)
  res.redirect("/urls")
  }
});














