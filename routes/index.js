var express = require('express');
var router = express.Router();

var loki = require('lokijs');

var db = new loki('data.json', {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  var surveys = db.getCollection("surveys");
  if (surveys === null) {
    surveys = db.addCollection("surveys");
  }
}

// /* Handle the Form */
// router.post('/surveys', function (req, res) {

//   var response = {
//     header: req.headers,
//     body: req.body
//   };

//   //req.body.numTickets = parseInt(req.body.numTickets);
//   db.getCollection("surveys").insert(req.body)

//   res.json(response);
// });

/* Handle the Form submission with Restful Api */
router.post('/surveys', function (req, res) {

  let result = db.getCollection("surveys").insert(req.body);

  res.status(201).json({ id: result.$loki });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Display all Surveys */
router.get('/surveys', function (req, res) {

  var result = db.getCollection("surveys").find();

  res.render('surveys', { surveys: result });
});

/* Display a single Survey */
router.get('/surveys/read/:id', function (req, res) {

  console.log(req.params.id)

  let result = db.getCollection("surveys").findOne({ $loki: parseInt(req.params.id) });

  if (result)
    res.render('survey', { survey: result });
  else
    res.status(404).send('Unable to find the requested resource!');

});

// Delete a single Survey 
router.delete('/surveys/:id', function (req, res) {

  //db.getCollection("surveys").findAndRemove({ $loki: parseInt(req.params.id) });

  let result = db.getCollection("surveys").findOne({ $loki: parseInt(req.params.id) });

  if (!result) return res.status(404).send('Unable to find the requested resource!');

  db.getCollection("surveys").remove(result);

  // //res.send("survey deleted.");
  // res.redirect("/surveys");
  if (req.get('Accept').indexOf('html') === -1) {
    return res.status(204).send();	    // for ajax request
  } else {
    return res.redirect('/surveys');	// for normal HTML request
  }

});

/* Searching */
router.get('/surveys/search', function (req, res) {

  var whereClause = {};

  if (req.query.name) whereClause.name = { $regex: req.query.name };
  if (req.query.cities) whereClause.cities = req.query.cities;
  if (req.query.foods) whereClause.foods = req.query.foods;
  if (req.query.cartoons) whereClause.cartoons = req.query.cartoons;
  if (req.query.animals) whereClause.animals = req.query.animals;


  // var parsedCities = req.query.cities;
  // if (!isNaN(parsedCities)) whereClause.cities = parsedCities;

  let results = db.getCollection("surveys").find(whereClause)

  return res.render('surveys', { surveys: results });

});

/* Pagination */
router.get('/surveys/paginate', function (req, res) {

  var count = Math.max(req.query.limit, 2) || 2;
  var start = Math.max(req.query.offset, 0) || 0;

  var results = db.getCollection("surveys").chain().find({}).offset(start).limit(count).data();

  var totalNumRecords = db.getCollection("surveys").count();

  return res.render('paginate', { surveys: results, numOfRecords: totalNumRecords });

});

/* Ajax Pagination */
router.get('/surveys/aginate', function (req, res) {
  if (req.get('Accept').indexOf('html') === -1) {

    var count = Math.max(req.query.limit, 2) || 2;
    var start = Math.max(req.query.offset, 0) || 0;

    var results = db.getCollection("surveys").chain().find({}).offset(start).limit(count).data();

    return res.json(results);

  } else {

    var totalNumRecords = db.getCollection("surveys").count();

    return res.render('aginate', { numOfRecords: totalNumRecords });
  }
});

module.exports = router;
