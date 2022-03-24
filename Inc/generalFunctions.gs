/*
--  Datasheet League of Legends Automatisé pour Unravel 
--  Current League Patch: 12.3
--  Developers:	Vincent aka Wiiz
--
--  File: generalFunctions.gs
--  Last Updated: 04-02-2022 
*/


//{		Global Variables
var apiKey = ""; // Riot Games API Key
var region = "EUW1"; // Players Region
var route = ""; // Regions Route
var offset = 0; // Match-V5 Offset
var getCSatX = false; // Timeline API Call - default false
var language = "fr_FR"; // Players Language - Only Used for Champion Names
var	timezone = 0; // Players Timezone - If Blank defaults to Server Timezone
var summoner = {name:"", accountId:"", id:"", puuid:""}; // Summoner Object
var rank = {queue:""}; // Rank Object
//}

//{		Custom Menu
function onOpen(){
	try{
		var ui = SpreadsheetApp.getUi();
		ui.createMenu('League of Legends')
			.addItem('Match History - Update','updateMatchHistory')
			.addItem('Champions - Update','updateChampions')
			.addToUi();
	}catch(error){}
}
//}

//{		Patch

// Returns the Generic Patch Number
function patchNumber(){
	// Getting Started Sheet
	var gettingStartedSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); //modifié
	
	
	// Get Current Patch Object for the Selected Region
	var patchObject = currentPatch(region);
	
	// Convert the full Patch Version into a 0.00 Format
	var patchNumber = '' + patchObject['v'].split('.')[0] + '.' + patchObject['v'].split('.')[1];
	
	return patchNumber;
}

function patchNotesLink(){
	// Get the Patch Number
	var patchNumber = patchNumber();
	
	// Getting Started Sheet
	var gettingStartedSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); //modifié
	
	// Variables
	var regionalPath = "";
	
	// Fix Region for Links
	switch (region){
		case "EUW1":
			regionalPath = "patch-"+patchAsNumber+"-notes";
			break;
	}
	
	var patchnoteUrl = "https://"+region+".leagueoflegends.com/"+language+"/news/game-updates/patch/"+regionalPath;
	
	return ""+patchnoteUrl+"";
}

//}

//{		Startup
// This function sets global variables
function startup(){
	// Cache
	var cache = CacheService.getScriptCache();
	
	// Sheets
	var gettingStartedSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	
	// Set global Summoner Information
	// Check the Cache - Update only if required
	summoner['name'] = (gettingStartedSheet.getRange("C1").getValue()).toLowerCase().replace(/\s+/g,'');
	var cachedSummoner = cache.get("Summoner Object");
	if (cachedSummoner != null && cachedSummoner['name']==summoner['name'] & cache.get("Region")==region){
		summoner = cachedSummoner;
	}else{
		// Summoner Information API Call
		var summonerObject = summonersByName(apiKey,region,summoner['name']);
		summoner['id'] = summonerObject['id'];
		summoner['accountId'] = summonerObject['accountId'];
		summoner['puuid'] = summonerObject['puuid'];
		
		// Add Summoner & Region to the cache for 1 Hour
		cache.put({'Summoner Object':summoner,"Region":region},3600);
	}
	
	// Global Route Information
	switch(region){
		case "EUW1": 
			route = "EUROPE";
			break;
	}
	
	// Global Ranked Information
	// Get the Requested Queue - Default to Solo / Duo
	switch(gettingStartedSheet.getRange("I1").getValue()){
		case "Solo / Duo":	rank['queue']="RANKED_SOLO_5x5";	break;
		case "Flex":		rank['queue']="RANKED_FLEX_SR";		break;
		default:			rank['queue']="RANKED_SOLO_5x5";	break;
	}
}
