var PouchDB = require('pouchdb');

var db_old = new PouchDB('./datas/alex_db.json', {
  db: require('jsondown')
});

db_old
  .destroy()

.catch(function (error) {
  console.log('delete db ', error);
})

.then(function () {
  console.log('la base alex_db est détruite');
  var db = new PouchDB('./datas/alex_db.json', {
    db: require('jsondown')
  });
  var attachment = new Buffer(['Is there life on Mars?']);

  return db.putAttachment('doc', 'att.txt', attachment, 'text/plain');
})

.then(function (result) {
  console.log(result);
})

.catch(function (err) {
  console.log(err);
});
