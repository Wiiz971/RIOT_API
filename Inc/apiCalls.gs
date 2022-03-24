/*
--  Automated League of Legends Spreadsheet
--  Current League Patch: 12.3
--  Developers:	Vincent aka Wiiz
--
--  File: apiCalls.gs
--  Last Updated: 04-02-2022 
*/

//{		API Call
function apiCall(apiKey,url){
	var options = {
		'method':'get',
		'muteHttpExceptions': true
	};
	if (apiKey != ""){
			options['headers'] = {'X-Riot-Token':apiKey};
	}
	
	// Fetch Data from provided URL & Options
	var response = UrlFetchApp.fetch(url, options);
	
	// Retrieve the Body from the Response
	var responseBody = JSON.parse(response.getContentText());
	
	// Spreadsheet UI - Used for Sending Error Alerts
	try{
		var ui = SpreadsheetApp.getUi();
	}catch(error){}

	// Error Handling
	switch (response.getResponseCode()){
		// Success
		case 200: 
      return responseBody; 
      break;
		// 400 Series Errors
		case 400:	case 403:	case 404:
			ui.alert(""+response.getResponseCode()+": "+responseBody['status']['message']);
      break;
		case 429:
			// Special Handling here - 429 is Rate Limit Reached.
			var responseHeader = response.getHeaders();
			// Retry time in seconds
			var timeoutFor = 0 + (responseHeader['Retry-After']);
			// Alert the User
			ui.alert("429: Rate Limit Reached.  Waiting "+timeoutFor+" seconds, after this window is closed.");
			// Wait the time specified by the reponse header
			Utilities.sleep((timeoutFor*1000));
			// Retry
			return apiCall(apiKey,url);
			break;
		// 500 Series Errors
		case 500:	case 502:	case 503:	case 504:
			ui.alert(""+response.getResponseCode()+": "+responseBody['status']['message']+".  Check API Status or Try again in a few minutes"); break;
		// Default
		default: ui.alert(""+response.getResponseCode()+": "+responseBody['status']['message']);
	} 
}
//}

//{		URL Assemblers

//{		Summoner-V4
function summonersByName(apiKey,region,summonerName){
	var url = "https://"+region+".api.riotgames.com/lol/summoner/v4/summoners/by-name/"+summonerName;
	return apiCall(apiKey,url);
}
//}


//{		Match-V5
function matchesById(apiKey,route,matchId){
	var url = "https://"+route+".api.riotgames.com/lol/match/v5/matches/"+matchId;
	return apiCall(apiKey,url);
}

function matchlistsByAccount(apiKey,route,puuid,options){
	var url = "https://"+route+".api.riotgames.com/lol/match/v5/matches/by-puuid/"+puuid+"/ids"+options;
	return apiCall(apiKey,url);
}

function timelinesByMatchId(apiKey,route,matchId){
	var url = "https://"+route+".api.riotgames.com/lol/match/v5/matches/"+matchId+"/timeline";
	return apiCall(apiKey,url);
}
//}



//{		Data Dragon
function currentPatch(region){
	var url = "https://ddragon.leagueoflegends.com/realms/euw.json";
	return apiCall("",url);
}

function championStaticData(language,patch){
	// If language isn't Set - Default to English
	if (language == ""){
		language="en_US";
	}
	
	try{
		var url = "https://ddragon.leagueoflegends.com/cdn/"+patch+"/data/fr_FR/champion.json";
		return apiCall("",url);
	}catch(error){}
	
	try{
		var url = "https://ddragon.leagueoflegends.com/cdn/10.9.1/data/fr_FR/champion.json";
		return apiCall("",url);
	}catch(error){}
}
//}

//}

