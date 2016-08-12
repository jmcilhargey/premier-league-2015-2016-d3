"use strict";

var fs = require("fs");

var dataString = fs.readFileSync("./match-results-2015.json", "utf-8");
var initialData = JSON.parse(dataString);
var teamList = {};
var runningStats = {};

initialData.fixtures.map(function(fixture) {
  
  var homeTeam = fixture.homeTeamName;
  var awayTeam = fixture.awayTeamName;
  
  if (!teamList.hasOwnProperty(homeTeam)) {
    teamList[homeTeam] = new Array(41);
    runningStats[homeTeam] = {
   		wins: 0,
        points: 0,
        goals: 0,
        goalDiff: 0      
    };
  }
  if (!teamList.hasOwnProperty(awayTeam)) {
    teamList[awayTeam] = new Array(41);
    runningStats[awayTeam] = {
   		wins: 0,
        points: 0,
        goals: 0,
        goalDiff: 0      
    };
  }
});

var startDate = new Date(2015, 7, 8);

function getWeek(dateString) {

	var currDate = new Date(dateString);
	return Math.ceil((currDate - startDate) / (60 * 60 * 24 * 1000) / 7);
}

initialData.fixtures.forEach(function(fixture) {
  
  var homeTeam = fixture.homeTeamName;
  var awayTeam = fixture.awayTeamName;
  
  if (fixture.result.goalsHomeTeam > fixture.result.goalsAwayTeam) {
    runningStats[homeTeam].wins += 1;
    runningStats[homeTeam].points += 3;
  }
  
  if (fixture.result.goalsAwayTeam > fixture.result.goalsHomeTeam) {
    runningStats[awayTeam].wins += 1;
    runningStats[awayTeam].points += 3;
  }
  
  if (fixture.result.goalsAwayTeam === fixture.result.goalsHomeTeam) {
    runningStats[homeTeam].points += 1;
    runningStats[awayTeam].points += 1;    
  }
  
  runningStats[homeTeam].goals += fixture.result.goalsHomeTeam;
  runningStats[awayTeam].goals += fixture.result.goalsAwayTeam;

  runningStats[homeTeam].goalDiff += fixture.result.goalsHomeTeam - fixture.result.goalsAwayTeam;
  runningStats[awayTeam].goalDiff += fixture.result.goalsAwayTeam - fixture.result.goalsHomeTeam;

  var currWeek = getWeek(fixture.date);

  teamList[homeTeam][currWeek - 1] = JSON.parse(JSON.stringify(runningStats[homeTeam]));
  teamList[awayTeam][currWeek - 1] = JSON.parse(JSON.stringify(runningStats[awayTeam]));
  
});

var formattedData = [];

for (var team in teamList) {

	var matchResults = teamList[team];

	for (var i = 1; i < matchResults.length; i++) {
		if (matchResults[i] == undefined) {
			matchResults[i] = matchResults[i - 1];
		}
	}
	formattedData.push( { name: team, stats: teamList[team]})
}

fs.writeFileSync("epl-results-by-week.json", JSON.stringify(formattedData, null, 2), "utf-8", function(err, stats, data) {

	if (err) {
		throw new Error("Unable to write to file: " + err);
	}
});