/*
--  Datasheet League of Legends Automatisé pour Unravel 
--  Current League Patch: 12.3
--  Developers:	Vincent aka Wiiz
--
--  File: championFunctions.gs
--  Last Updated: 04-02-2022 
*/

function updateChampions(){
	// Sheet
	var championSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Champions");
	
	
	// Get Champion List 
	var patch = currentPatch(region);
	var championList = championStaticData(language, patch['v']);
	
	// Champions Array
	var champions = [];
	
	// Add Champion Names & IDs to the array
	for (var champion in championList['data']){
		champions[championList['data'][champion]['key']] = championList['data'][champion]['name'];
	}
		
	// Create Output Array
	var output = [];
	var outputRow = 0;
	// Add Data to Output Array
	for (var currentChampion in champions){
		// Add 2D Array
		output[outputRow] = [];

		output[outputRow] = [currentChampion,champions[currentChampion]];
		outputRow++;
	}
	
	// Clear Sheet and Set Values
	championSheet.getRange(5,2,outputRow,2).clearContent().setValues(output);
	// Change Last Updated
  sortChampions();
	championSheet.getRange(4,5,1,2).setValues([[championSheet.getRange("J4").getValue(),patch['v']]])
}

function championList(region, language){
	
	// Get New Champion List from Data Dragon
	var patch = currentPatch(region);
	var championList = championStaticData(language, patch['v']);
	
	// Champions Array
	var champions = [];
	
	// Add Champion Names & IDs to the array
	for (var champion in championList['data']){
		champions[championList['data'][champion]['key']] = championList['data'][champion]['name'];
	}

	return champions;
}

function sortChampions(){
  // Sort
  var championSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Champions");
	championSheet.getRange("A5:J").sort({column:3,ascending:true});
}
