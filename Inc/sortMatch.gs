// Sheets
var myMatchHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SUP Flex")

// Get the user Selected Sort Method
var sortBy = myMatchHistorySheet.getRange("E7").getValue().split(" ");

var value = new Date(2022,1,1);
var column_to_search = 0;

function sortMyMatches() {

    // Sort Methods Column
	switch (sortBy[0]){
		case "Date":
			sortBy[0] = 2;
			break;
		case "Presence":
			sortBy[0] = 16;
			break;
		case "Farm":
			sortBy[0] = 17;
			break;
		default:
			sortBy[0] = 2;
	}
	
	// Sort Method Ascending / Descending
	switch (sortBy[1]){
		// Ascending
		case "(A-Z)":
		case "(Low-High)":
			sortBy[1] = true;
			break;
		// Descending
		case "(Z-A)":
		case "(High-Low)":
			sortBy[1] = false;
			break;
		default:
			sortBy[1] = true;
			break;
	}
	
	// Sort
	myMatchHistorySheet.getRange("A13:W").sort({column:sortBy[0],ascending:sortBy[1]})

  Logger.log(myMatchHistorySheet.getRange(myMatchHistorySheet.getLastRow(),2).getValue().valueOf());

  //var deleteSelectedRows = removeThenSetNewVals();
  }

function removeThenSetNewVals(){

  var range = myMatchHistorySheet.getRange(13,2,myMatchHistorySheet.getLastRow()+1,22);
  // Verify if the game is created after 01/02/2022 because only these are taken

  var rangeVals = range.getValues();
  
  var newRangeVals = [];
 
  for(var i = 0; i < rangeVals.length; i++){
    if(rangeVals[i][column_to_search].valueOf() >= value.valueOf()){
      newRangeVals.push(rangeVals[i]);
    };
  };
  
  range.clearContent();
  
  var newRange = myMatchHistorySheet.getRange(13, 2,newRangeVals.length, newRangeVals[0].length);
  newRange.setValues(newRangeVals);


  //remote all checkboxes

  var rangeCheckBoxes = myMatchHistorySheet.getRange(myMatchHistorySheet.getLastRow()+1,1,500,22);
  rangeCheckBoxes.clearDataValidations();
};
