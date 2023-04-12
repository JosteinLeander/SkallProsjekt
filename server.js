// Server for SkallProsjekt
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/user");


const app = express();

const dbURI = "mongodb+srv://josteinla:Test1234@cluster0.bc3pzko.mongodb.net/Skall?retryWrites=true&w=majority";
mongoose.connect(dbURI)
  .then(() => {
    app.listen(3000);
    console.log("Listening 3000")
  })
  .catch((err) => {
    console.log(err)
  });

dotenv.config();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

let currUser = "";

app.get("/", (req, res) => {
    let info = "";
    res.render("index.ejs", {user: "", info: info})
})

app.post("/", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    let lhost = req.hostname;
    let info = "";

    if (req.body.submit == "Logg inn") {
        const user = await User.findOne({ email: email });
        if (user) {
            if (user.password == password) {
                currUser = email;
                res.render("index.ejs", {user: email, info: info })
            } else {
                res.render("index.ejs", {user: "", info: "Passord feil" })
            }
        } else {
            console.log("Brukeren finnes ikke i systemetet")
        }
    }
})

app.get("/lagbruker", (req, res) => {
    console.log("Lag bruker")
    let info = "";
    res.render("lagbruker.ejs", { info: info });
})

app.post("/lagbruker", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    let info = "";

    try {
        const user = await User.create({ email, password });
        currUser = email;
        res.render("index.ejs", { user: email, info: info })
    }
    catch (err) {
        console.log(err.message)
        let info = err.message;
        res.render("lagbruker", { info: info })
    }
})

app.get("/nyttpassord", (req, res) => {
    const email = currUser;
    console.log(email);
    res.render("nyttpassord.ejs", { user: email })
})

app.post("/nyttpassord", async (req, res) => {
    const { password } = req.body; 
    const email = currUser;
    console.log(email, password);
    let info = "";

    const user = await User.findOne({ email: email });
    if (user) {
        let myqery = { email: email };
        let newpwd = { $set: { password: password }}; 
        console.log("TEST", email, user);
        User.updateOne(myqery, newpwd, function(err, result){
            if (err) {
                let info = "Klarte ikke å lage nytt passord";
                console.log(err)
                res.render("nyttpassord.ejs", { email: info })
            } else {
                let info = "Nytt passord opprettet";
                console.log(info)
                res.render("index.ejs", { user: "", info: info })
            }
        })
    } else {
        console.log("Brukeren finnes ikke i systemet")
    }
})

app.get("/slettbruker", (req, res) => {
    console.log("slett bruker")
    let info = "";
    res.render("slettbruker.ejs", { info: info });
})

app.post("/slettbruker", async (req, res) => {
    const { email } = req.body;
    console.log(email);
    let info = "";
    const user = await User.findOne({ email: email });
    if (user) {
        let myqery = { email: email };

        const result = await User.deleteOne(myqery);

        if (result.deletedCount === 1) {
                let info = "Klarte å slette " + email;
                console.log(info)
                res.render("slettbruker.ejs", { info: info })
        } else {
                let info = "Klarte ikke å slette bruker " + email;
                console.log(info)
                res.render("slettbruker.ejs", { info: info })
        }
    } else {
        console.log("Brukeren finnes ikke i systemet")
    }
    
})