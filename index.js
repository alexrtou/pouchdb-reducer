var PouchDB = require('pouchdb');

console.log('pwd : ', process.cwd());

var spawn = require('child_process').spawn;
var serve = spawn(
  'node', ['node_modules/pouchdb-server/bin/pouchdb-server', '-p', '5984', '--level-backend', '"leveldown-prebuilt"'], {
    cwd: process.cwd()
  });

serve.stdout.on('data', function (data) {
  console.log('stdout: ' + data);

  if (data && data.toString().indexOf("pouchdb-server has started") > -1) {
    console.log('Serveur démarré');

    pouchTests();
  }
});

serve.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

serve.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

// Traitements et tests
var pouchTests = function () {
  var db = new PouchDB('http://localhost:5984/alex_db', {
    db: require('leveldown-prebuilt')
  });









  db.destroy().then(function () {
    console.log('la base alex_db est détruite');
  }).catch(function (error) {
    console.log('delete db ', error);
  });
};
