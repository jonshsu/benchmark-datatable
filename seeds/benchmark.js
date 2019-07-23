// Seed the MySql database with 2000 random benchmarks

const faker = require('faker');

function createBenchmark() {
  return {
    create_time: faker.date.recent(10),                       // random datetime in the last 10 days
    commit_hash: faker.random.uuid().slice(0,8),              // random alphanumeric hash string
    branch_name: (Math.random() < 0.5 ? "Master" : "Dev"),    // half Master, Dev branch
    os: (Math.random() < 0.5 ? "Android" : "iOS"),            // half Android, half iOS
    cpu: (Math.random() < 0.1 ? Math.random() * 5 + 30 : Math.random() * 30),   // 1/10 greater than 30, 9/10 less than 30
    mem: (Math.random() < 0.1 ? Math.random() * 10 + 10 : Math.random() * 10),  // 1/10 greater than 10, 9/10 less than 10
    note: (Math.random() < 0.1 ? faker.random.words().split(' ').slice(0,3).join(' ') : "")  // 1/10 have random note of up to 3-words
  }
}

exports.seed = (knex, Promise) => {
  return knex('benchmark').del()
  .then( function() {
    let benchmarks = [];

    for (let i = 0; i < 2000; i++) {
      benchmarks.push(createBenchmark())
    }

    return knex.batchInsert('benchmark', benchmarks, 100);
  });
};