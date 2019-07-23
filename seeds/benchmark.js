// Seed the MySql database with 2000 random benchmarks

const faker = require('faker');

function createBenchmark() {
  return {
    create_time: faker.date.recent(10),
    commit_hash: faker.random.uuid().slice(0,8),
    branch_name: (Math.random() < 0.5 ? "Master" : "Dev"),
    os: (Math.random() < 0.5 ? "Android" : "iOS"),
    cpu: (Math.random() < 0.1 ? Math.random() * 5 + 30 : Math.random() * 30),
    mem: (Math.random() < 0.1 ? Math.random() * 10 + 10 : Math.random() * 10),
    note: (Math.random() < 0.1 ? faker.random.words().split(' ').slice(0,3).join(' ') : "")
  }
}

exports.seed = (knex, Promise) => {
  return knex('benchmark').del()
  .then( function() {
    let benchmarks = [];

    for (let i = 1; i < 2000; i++) {
      benchmarks.push(createBenchmark())
    }

    return knex.batchInsert('benchmark', benchmarks, 100);
  });
};