var PouchDB = require('pouchdb');
var fs = require('fs');
var Promise = require("bluebird");
var fsAsync = Promise.promisifyAll(fs);
var db;

var db_old = new PouchDB('./datas/alex_db');

db_old
  .destroy()

.then(function () {
  console.log('la base alex_db est détruite');
})

.catch(function (error) {
  console.log('delete db ', error);
})

.then(function () {
  db = new PouchDB('./datas/alex_db');

  var docs = [];
  for (var i = 0; i < 100; ++i) {
    docs.push(db.put({
      "_id": "" + i,
      "date": Date.now(),
      "idx": i,
      "from": "Alexandre"
    }));
  }

  return Promise.all(docs);

})

.then(function () {

  var nb_elem_par_page = 10;
  var page = 1;

  return db.query(
    function (doc, emit) {
      emit(doc.date);
    }, {
      descending: true,
      limit: nb_elem_par_page,
      skip: (page - 1) * nb_elem_par_page
    });
})

.then(function (all) {
  console.log(all);
})

.catch(function (err) {
  console.log(err);
})

.then(function () {
  console.log("terminé");
});
