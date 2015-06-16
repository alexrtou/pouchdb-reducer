var PouchDB = require('pouchdb');
var ldown = require('sqldown');
var fs = require('fs');
var Promise = require("bluebird");
var fsAsync = Promise.promisifyAll(fs);
var db;

var db_old = new PouchDB('./datas/alex_db', {
  db: ldown
});

db_old
  .destroy()

.then(function () {
  console.log('la base alex_db est détruite');
})

.catch(function (error) {
  console.log('delete db ', error);
})

.then(function () {

  return fsAsync.readFileAsync('./picture.jpg');

})

.then(function (data) {
  db = new PouchDB('./datas/alex_db', {
    db: ldown
  });

  //console.log("datas : ", data);

  var doc1 = {
    "_id": "docb",
    "date": Date.now(),
    "from": "Alexandre",
    "_attachments": {
      "picture2.jpg": {
        "content_type": "image/jpeg",
        "data": data
      }
    }
  };

  return db.put(doc1);

})

.then(function () {
  return db.get('docb');

})

.then(function (result) {
  console.log(result);
})

.then(function () {

  return fsAsync.readFileAsync('./picture.jpg');

})

.then(function (data) {
  var doc2 = {
    "_id": "doca",
    "date": Date.now(),
    "from": "Alexandre",
    "_attachments": {
      "picture1.jpg": {
        "content_type": "image/jpeg",
        "data": data
      }
    }
  };

  return db.put(doc2);

})

.then(function () {
  return db.get('doca');

})

.then(function (result) {
  console.log(result);
})

.then(function () {
  /*return db.allDocs({
    descending: true
  });*/

  return db.query(
    function (doc, emit) {
      emit([doc.date, doc._id]);
    }, {
      descending: true,
      include_docs: true
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
  process.abort();
});
