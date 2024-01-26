#! /usr/bin/env node

console.log(
  'This script populates some Where\'s Wally test data to the a mongodb databse. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Level = require("./models/level");
const Leaderboard = require("./models/leaderboard");

const levels = [];
const leaderboards = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createLevels();
  await createLeaderboards();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function levelCreate(index, levelNum, imageUrl, answers) {
  const level = new Level({ levelNum, imageUrl, answers });
  await level.save();
  levels[index] = level;
  console.log(`Added level: ${levelNum}`);
}

async function leaderboardCreate(index, level, scores) {
  const leaderboard = new Leaderboard({ level, scores });

  await leaderboard.save();
  leaderboards[index] = leaderboard;
  console.log(`Added leaderboard`);
}

async function createLevels() {
  console.log("Adding levels");
  await Promise.all([
    levelCreate(
      0,
      1,
      "https://firebasestorage.googleapis.com/v0/b/wheres-wally-936c7.appspot.com/o/Level%201%2Fwally1.jpg?alt=media&token=41ae85a5-61db-4923-80c3-9d71505594a8",
      [
        {
          character: "Wally",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/wheres-wally-936c7.appspot.com/o/characters%2Fwally.png?alt=media&token=d67e8efc-3735-46a5-9d49-bb73af1f3e1b",
          xCoord: 1634,
          yCoord: 11713,
        },
        {
          character: "Batman",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/wheres-wally-936c7.appspot.com/o/characters%2Fbatman.png?alt=media&token=c0e0060f-86f8-4c76-89be-4b3d9bc728a7",
          xCoord: 214,
          yCoord: 10386,
        },
        {
          character: "Hollow Knight",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/wheres-wally-936c7.appspot.com/o/characters%2Fhollow%20knight.png?alt=media&token=a46d793d-bd51-4fcb-9dd6-965585973de3",
          xCoord: 1192,
          yCoord: 12446,
        },
        {
          character: "Morty",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/wheres-wally-936c7.appspot.com/o/characters%2Fmorty.png?alt=media&token=29e16e5f-7faa-4d0f-96ce-1e72a160433c",
          xCoord: 858,
          yCoord: 3018,
        },
        {
          character: "Cortana",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/wheres-wally-936c7.appspot.com/o/characters%2Fcortana.webp?alt=media&token=ffecf0ca-309c-48cc-9063-b410e23c913c",
          xCoord: 1839,
          yCoord: 11179,
        },
      ]
    ),
  ]);
}

async function createLeaderboards() {
  console.log("Adding leaderboards");
  await Promise.all([
    leaderboardCreate(0, levels[0], [
      {
        name: "Anon",
        score: 170,
      },
      {
        name: "Anon",
        score: 200,
      },
      {
        name: "Anon",
        score: 233,
      },
      {
        name: "Anon",
        score: 250,
      },
      {
        name: "Anon",
        score: 342,
      },
    ]),
  ]);
}
