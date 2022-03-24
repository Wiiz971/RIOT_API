// @ts-nocheck
/*
--  Datasheet League of Legends Automatisé pour Unravel 
--  Current League Patch: 12.3
--  Developers:	Vincent aka Wiiz
--
--  File: matchFunctions.gs
--  Last Updated: 04-02-2022 
*/

// Global Champion Array
var champions = [];

function updateMatchHistory(){
	// Run the startup Function
	startup();
  
	// Sheets
	var matchHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	
	
	// Ranked Queue Id - Default is Solo / Duo Queue
	var queueId = 420;
	switch (rank['queue']){
		case "RANKED_SOLO_5x5":		queueId = 420;	break;
		case "RANKED_FLEX_SR":		queueId = 440;	break;

		// Clash.  Not available by default, but Queue ID is here to make implemnting it easier
		case "CLASH":				queueId = 700;	break;
 
	}
		
	// Match History Variables
	var matchIds = [];
	var indexed = 0;
	var gamesToIndex = true;
	var listOfMatches = {};

	// Start Date no longer needed since Match V5 can't fetch before June 16th 2021
	// Start Date WILL make a return in v5.0.0 for Season 12
	
	// Set the Global champions array
	champions = championList(region, language);
	
	// Match Id Loop
	do{
		// Options for Match List - champion, queue, beginTime, endTime, start & count
		var options = "?queue="+queueId+"&start="+indexed+"&count=100";
		// Fetch Match List
		listOfMatches = {'matches':matchlistsByAccount(apiKey,route,summoner['puuid'],options)};
		
		// If there are less than 100 matches in the object, then this is the last match list
		if (listOfMatches['matches'].length < 100){
			gamesToIndex = false;
		}
		
		// Populate matchIds Array
		for (var match in listOfMatches['matches']){
			matchIds[indexed] = listOfMatches['matches'][match];
			indexed++;
		}
		
		// Fail Safe
		if (listOfMatches['matches'][0]==undefined){
			gamesToIndex = false;
			indexed = 0;
		}
	}while(gamesToIndex);
	
	// New Games - This count is All Matches less Already Entered Matches
	// Already Entered Match count comes from last row less 4 to account for the Header
	// w/ the introduction of Match V5 the API can now only fetch games played since June 16th 2021
	// Due to this we need an "OFFSET" temporarily to trick the current system into adding new games
	var newGames = (matchIds.length-1+offset) - (matchHistorySheet.getLastRow()-12);
	
	// Previous Match Id - Duplicate Prevention
	var previousMatchId = matchHistorySheet.getRange(matchHistorySheet.getLastRow(),4).getValue();
  var previousMatchDate = matchHistorySheet.getRange(matchHistorySheet.getLastRow(),2).getValue();
	
	var output = [];
	var cORow = 0;

  
	// Fetch Match Details Loop
	for (var matchId=newGames; matchId>=0; matchId--){

		if (matchIds[matchId]!=undefined & matchIds[matchId]!=previousMatchId){
			// Match Details API Call
			var matchDetails = matchesById(apiKey,route,matchIds[matchId]);
      if ((matchDetails['info']['gameCreation']/86400000+2209161600000).valueOf()> previousMatchDate.valueOf()){
        output[cORow] = matchHistoryOutput(matchDetails,cORow);
        cORow++;
      }
    }
    if (cORow >= 50 | matchId <=0){
      matchHistorySheet.getRange(matchHistorySheet.getLastRow()+1, 1, cORow, 22).setValues(output);
            cORow = 0;
            output = []; 
        }
      } 
    
  	//Data Validation Rule
  var checkboxes = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();

  matchHistorySheet.getRange(13, 1, matchHistorySheet.getLastRow()+1, ).setDataValidation(checkboxes).setValue(false);	
}

function matchHistoryOutput(match,cORow){
	// Sheets
	var matchHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

	// Get Participant Id
	var participantId = 0;
	var foundParticipant = false;
	while (foundParticipant==false & participantId < 10){
		if (match['metadata']['participants'][participantId] == summoner['puuid']){
			foundParticipant = true;
		}else{
			participantId++;
		}
	}
	
	//{ Team Stats - For Participation & Share Stats
	// Variables
	var teamVisionScore = 0;
	var teamTotalKills = 0;
;
	// Loop Through the Team
	var team = (match['info']['participants'][participantId]['teamId']==100)?5:10;
	for (var member = team-5; member<team; member++){
		teamVisionScore += match['info']['participants'][member]['visionScore'];
		teamTotalKills += match['info']['participants'][member]['kills'];
	}
	//}
	
	//{ Played As
	// Champion Id
	var championName = match['info']['participants'][participantId]['championName'];
	
	//{ Performance
	// Score
	var kills = match['info']['participants'][participantId]['kills'];
	var deaths = match['info']['participants'][participantId]['deaths'];
	var assists = match['info']['participants'][participantId]['assists'];
  var kda = kills + assists;
	if (deaths > 0){
		kda /= deaths;
	}

  var killParticipation = (kills + assists) / teamTotalKills;
	
	// Gold & Farm
	var gold = match['info']['participants'][participantId]['goldEarned'];
	
  // Farm at X Minute
	var at10, at20, at30 = "";
  var timelineObject = timelinesByMatchId(apiKey,route,match['metadata']['matchId']);
		var minutes = match['info']['gameDuration']/60000;
		if (minutes >= 10){
			at10 = (timelineObject['info']['frames']['10']['participantFrames'][participantId+1]['minionsKilled']+timelineObject['info']['frames']['10']['participantFrames'][participantId+1]['jungleMinionsKilled']);
		}
		if (minutes >= 20){
			at20 = (timelineObject['info']['frames']['20']['participantFrames'][participantId+1]['minionsKilled']+timelineObject['info']['frames']['20']['participantFrames'][participantId+1]['jungleMinionsKilled']);
		}
		if (minutes >= 30){
			at30 = (timelineObject['info']['frames']['30']['participantFrames'][participantId+1]['minionsKilled']+timelineObject['info']['frames']['30']['participantFrames'][participantId+1]['jungleMinionsKilled']);
		}
  
  // Lane CS
	var farm = match['info']['participants'][participantId]['totalMinionsKilled'];
	// Jungle CS
	// Match-V5 removed Ally & Enemy Jungle Stats
	var totalJungle = match['info']['participants'][participantId]['neutralMinionsKilled'];

	
	// Damage
	// Damage Dealt to Champions
	var dealt = match['info']['participants'][participantId]['totalDamageDealtToChampions'];
	// Total damage Taken
	var taken = match['info']['participants'][participantId]['totalDamageTaken'];
	// Total Damage to Objectives - Turret Damage counts towards Objectives
	var objectives = match['info']['participants'][participantId]['damageDealtToObjectives'];
	
	// Vision
	var placed = match['info']['participants'][participantId]['wardsPlaced'];
	var pinks = match['info']['participants'][participantId]['visionWardsBoughtInGame'];
	var visionScore = match['info']['participants'][participantId]['visionScore'];
  var visionShare = visionScore / teamVisionScore;
	//}
	
	//{ Match Information
	// Duration & Creation in Seconds - Creation is Seconds since 1970-01-01
	var duration = match['info']['gameDuration'];
  var creation = match['info']['gameCreation'];
	var result = (match['info']['participants'][participantId]['win'])?"Victory":"Defeat";



	// Remake Check
	var inactivity = (kills + deaths + assists) + dealt + taken + farm;
	// If the match was less than 6 minutes and the player was active set to remake
	if (duration<360 && inactivity>0){
		result = "Remake";
    killParticipation = 0;
	// If the match was less than 6 minutes and the player was AFK set to LEAVE
	}else if(duration<360 && inactivity==0){
		result = "LEAVE";
    killParticipation = 0;
	}else if(duration<10000){
    // To correct a bug from the RIOT API 
    duration *= 10**3;
  }
	//}
	
//	var currentRow = matchHistorySheet.getLastRow()+1;

	var output = ['','=(('+creation+'-'+timezone+')/86400000)+"1/1/1970"',
		championName,match['metadata']['matchId'],result,
    kills,deaths,assists,kda,teamTotalKills,killParticipation,
    '=('+duration+'/86400000)',placed,pinks,visionScore,visionShare,
    farm+totalJungle,at10,at20,at30,gold,objectives	
    ];

	return output;
  }
    
