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

  //res.status(201).json({ id: result.$loki });

  let result2 = db.getCollection("surveys");

  /* get cities data */
  const BeijingNum = result2.chain().find({ cities: { '$aeq': "Beijing" } }).count();
  const TokyoNum = result2.chain().find({ cities: { '$aeq': "Tokyo" } }).count();
  const HKNum = result2.chain().find({ cities: { '$aeq': "Hong Kong" } }).count();
  const LondonNum = result2.chain().find({ cities: { '$aeq': "London" } }).count();
  const NYNum = result2.chain().find({ cities: { '$aeq': "New York" } }).count();

  /* get foods data */
  const MilkNum = result2.chain().find({ foods: { '$aeq': "Milk" } }).count();
  const NoodlesNum = result2.chain().find({ foods: { '$aeq': "Noodles" } }).count();
  const DumplingNum = result2.chain().find({ foods: { '$aeq': "Dumpling" } }).count();
  const SteakNum = result2.chain().find({ foods: { '$aeq': "Steak" } }).count();
  const VegetableNum = result2.chain().find({ foods: { '$aeq': "Vegetable" } }).count();

  /* get cartoons data */
  const CMNum = result2.chain().find({ cartoons: { '$aeq': "Cat and Mouse" } }).count();
  const PGBBWNum = result2.chain().find({ cartoons: { '$aeq': "Pleasant Goat and Big Big Wolf" } }).count();
  const FWDBNum = result2.chain().find({ cartoons: { '$aeq': "Four-wheel drive brother" } }).count();
  const BearNum = result2.chain().find({ cartoons: { '$aeq': "Bear" } }).count();
  const SSNum = result2.chain().find({ cartoons: { '$aeq': "SpongeBob SquarePants" } }).count();

  /* get animals data */
  const CatNum = result2.chain().find({ animals: { '$aeq': "Cat" } }).count();
  const DogNum = result2.chain().find({ animals: { '$aeq': "Dog" } }).count();
  const TigerNum = result2.chain().find({ animals: { '$aeq': "Tiger" } }).count();
  const FishNum = result2.chain().find({ animals: { '$aeq': "Fish" } }).count();
  const BullNum = result2.chain().find({ animals: { '$aeq': "Bull" } }).count();

  res.status(201).json({
                        cities: { BeijingNumber: BeijingNum,TokyoNumber:TokyoNum,HKNumber: HKNum,LondonNumber: LondonNum,NYNumber: NYNum },
                        foods:{MilkNumber: MilkNum,NoodlesNumber:NoodlesNum,DumplingNumber: DumplingNum,SteakNumber: SteakNum,VegetableNumber: VegetableNum},
                        cartoons:{CMNumber: CMNum,PGBBWNumber:PGBBWNum,FWDBNumber: FWDBNum,BearNumber: BearNum,SSnumber: SSNum},
                        animals:{CatNumber: CatNum,DogNumber:DogNum,TigerNumber: TigerNum,FishNumber: FishNum,BullNumber: BullNum}
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {

  var surveysRecords = db.getCollection("surveys")
    

  const resultsLine2 = surveysRecords.chain().find({ cities: { '$aeq': "Beijing" } }).count();

  console.log('获取数据', resultsLine2)

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



