window.elfish = {
    numberOfEfforts: 2,
    species: []
}

function store() {
    console.log("storing ... ");
    // Put the object into storage
    localStorage.setItem('elfish', JSON.stringify(window.elfish));
    console.log("done");
}

function retrieve() {
    console.log("retrieving ... ");
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('elfish');
    window.elfish = JSON.parse(retrievedObject);
    console.log("done");
    reloadDataIntoDom();
}


/**
 * Should only be run on window.onload after load from localStorage,
 * however it causes no harm to run it.  It deletes the content of
 * .app and reloads from window.elfish.
 *
 */
function reloadDataIntoDom() {
    
    console.log(window.elfish);
    
    console.log("Emptying .app ... ");
    $(".app").empty();
    
    console.log("Populating ... ");
    for (var s = 0; s < window.elfish.species.length; s++) {
	var sName = window.elfish.species[s].name;
	domSpecie(s, sName);
	console.log("Added specie " + s + ": " + sName);
	
	var groups = window.elfish.species[s].groups;
	
	for (var g = 0; g < groups.length; g++) {
	    var gName = groups[g].name;
	    domGroup(g, gName, s);
	    console.log("\tAdded group " + g + ": " + gName);
	    
	    for (var e = 0; e < window.elfish.numberOfEfforts; e++) {
		var eName = groups[g].efforts[e].name;
		var value =  groups[g].efforts[e].value;
		domEffort(e, eName, g, s, value);
		console.log("\t\tAdded effort " + e + ": " + eName + " (" + value + ")");
		recomputeValues(s,g,e);
	    }
	}
    }
}


/**
 * Clears local storage
 */
function clearLocalStorage() {
    console.log("Clearing local storage ... ");
    
    // TODO make backup copy
    
    window.localStorage.removeItem("elfish");
    doUpdate();
}


/**
 * Takes data from elfish and puts into DOM
 */
function doUpdate() {
    // var species = window.elfish.species;
    
    // $('.specie').remove();
    
    // for (var s = 0; s < species.length; s++) {
    // 	domSpecie(s, window.elfish.species[s].name);
	
    // 	var specieName = species[s].name;
    // 	var groups = species[s].groups;
	
	
    // 	for (var g = 0; g < groups.length; g++) {
    // 	    var groupName = groups[g].name;
    // 	    var efforts = groups[g].efforts;
	    
    // 	    domGroup(g, groupName, s);
	    
	    
    // 	    for (var e = 0; e < efforts.length; e++) {
		
    // 		var effortName = efforts[e].name;
    // 		var value = efforts[e].value;
		
    // 		domEffort(e, effortName, g, s, value);
		
    // 		console.log("update: " + specieName + " " + groupName + " " + effortName + " " + value);
    // 	    }
    // 	}
    // }
}


function getInputValue(sp, gr, ef) {
    var elt = getInput(sp,gr,ef);
    
    retVal = NaN
    if (elt != null) {
	retVal = elt.value;
	console.log("input field " + sp + "," + gr + "," + ef + " → " + elt.value);
    }
    console.log("getInputValue(" + sp + "," + gr + "," + ef + ") → " + retVal);
    return retVal;
}


function getInput(s,g,e) {
    var postfix = "-" + s + "-" + g + "-" + e;
    console.log("postfix = " + postfix);
    
    // TODO use JQuery instead of postfix on id of dom elts
    var key = "ci" + postfix;
    
    return document.getElementById(key);
}

function createNewSpecies () {
    // TODO fix species title/name
    window.elfish.species.push({name: "Art", groups: []});
    domSpecie(window.elfish.species.length-1, "Art");
}

function createNewGroup (specie) {
    if (specie >= window.elfish.species.length || specie < 0) {
	throw new Error("specie must be exisiting id: 0 <= " + specie + " < " + window.elfish.species.length);
    }
    
    console.log("createNewGroup(" + specie + ")");
    
    var species = window.elfish.species[specie];
    var groups = species.groups;
    
    var newGroupId = groups.length;
    
    groups.push({name:"Group " + newGroupId, efforts: []});
    
    domGroup(newGroupId, "Gruppe", specie);
    
    console.log("\tgroups: " + groups);
    
    populateGroupsWithEfforts();
    
    return newGroupId;
}


function populateGroupsWithEfforts() {
    var n = window.elfish.numberOfEfforts;
    for (var s = 0; s < window.elfish.species.length; s++) {
	for (var g = 0; g < window.elfish.species[s].groups.length; g++) {
	    var gr = window.elfish.species[s].groups[g];
	    while (gr.efforts.length < n) {
		createNewEffortForGroup("", g, s);
	    }
	}
    }
}


/**
 * This function increases the global effort count by one, and then
 * proceeds to add efforts to all the groups in every specie.
 *
 */
function createNewEffort (effortName) {
    window.elfish.numberOfEfforts += 1;
    
    var species = window.elfish.species;
    for (var s = 0; s < species.length; s++) {
	for (var g = 0; g < species[s].groups.length; g++) {
	    var group = species[s].groups[g];
	    if (group.efforts.length >= window.elfish.numberOfEfforts) {
		console.log("Enough efforts\t for S" + s + ".G" + g);
		continue;
	    } else {
		console.log("New effort\t for S" + s + ".G" + g);
		createNewEffortForGroup(effortName, g, s);
	    }
	}
    }
}

/**
 *  Creates a new effort for the given group.  If the group already
 *  has enough efforts according to window.elfish.numberOfEfforts,
 *  logs a warning, and returns.
 *
 */
function createNewEffortForGroup (effortName, groupId, speciesId) {
    var group = window.elfish.species[speciesId].groups[groupId];
    
    console.log("createNewEffortForGroup(" + effortName + "," + groupId + ", " + 
		speciesId + ")");
    
    // checking if we have too many efforts already
    if (group.efforts.length >= window.elfish.numberOfEfforts) {
	console.warn("Too many efforts already for group " + groupId + " in species " + speciesId);
	return;
    }

    if (!effortName) {
	console.log("Creating effort without predefined name");
	if (window.elfish.species.length == 0 || 
	    window.elfish.species[0].groups.length == 0 ||
	    window.elfish.species[0].groups[0].efforts.length == 0) {
	    effortName = "Effort";
	} else {
	    var firstName = window.elfish.species[0].groups[0].efforts[0].name;
	    effortName = firstToken(firstName);
	}
    }
    
    
    group.efforts.push({name: effortName, value: ""});
    
    domEffort(group.efforts.length-1, effortName, groupId, speciesId);
}


function exportCSV () {
    var csv = "";
    
    var species = window.elfish.species;
    for (var s = 0; s < species.length; s++) {
	
	var groups = species[s].groups;
	csv += "Species " + (1+s);
	for (var g = 0; g < groups.length; g++) {
	    
	    var efforts = groups[g].efforts;
	    
	    // INPUT
	    csv += "\nGroup " + (g);
	    for (var e = 0; e < efforts.length; e++) {
		csv += "," + getInputValue(s,g,e);
	    }
	    
	    // EST
	    csv += "\n";
	    for (var e = 0; e < efforts.length; e++) {
		// TODO instead of postfix id on dom element, do JQuery!
		var postfix = "-" + s + "-" + g + "-" + e;
		
		if (e <= 0)
		    csv += ",---";
		else
		    csv += "," + document.getElementById("est" + postfix).innerHTML;
	    }
	    
	    // k/E
	    csv += "\n";
	    for (var e = 0; e < efforts.length; e++) {
		// TODO instead of postfix id on dom element, do JQuery!
		var postfix = "-" + s + "-" + g + "-" + e;
		
		if (e <= 0)
		    csv += ",---";
		else
		    csv += "," + document.getElementById("ke" + postfix).innerHTML;
	    }
	    
	    // T/E
	    csv += "\n";
	    for (var e = 0; e < efforts.length; e++) {
		// TODO instead of postfix id on dom element, do JQuery!
		var postfix = "-" + s + "-" + g + "-" + e;
		
		if (e <= 0)
		    csv += ",---";
		else
		    csv += "," + document.getElementById("te" + postfix).innerHTML;
	    }
	}
	csv += "\n";
    }
    
    return csv;
}


function recomputeValues(s,g,e) {
    // the values for effort e in species s, group g changed, recompute the entire group
    // TODO what's going on below here?
    
    var specie = window.elfish.species[s];
    var group = specie.groups[g];
    var efforts = group.efforts;
    
    var vals = [];
    for (var e = 0; e < efforts.length; e++) {
	vals.push(getInputValue(s,g,e));
	
	
	if (e > 0) {
	    // one effort is not enough.
	    
	    var arr = [];
	    var t = 0;
	    for (var i = 0; i < vals.length; i++) {
		var v = parseInt(vals[i],10)
		arr.push(v);
		t += v;
	    }
	    
	    console.log(arr);
	    if (t != t) {
		console.warn("Contains NaN so abort");
		return; // NaN
	    }
	    
	    
	    var estimateString = getEstimateString(arr);
	    
	    var postfix = "-" + s + "-" + g + "-" + e;
	    console.log("postfix = " + postfix);
	    
	    document.getElementById("est" + postfix).innerHTML =
		"N̂ =" + estimateString; 
	    
	    document.getElementById("ke" + postfix).innerHTML = 
		"k/E =" + getKE(arr);
	    
	    document.getElementById("te" + postfix).innerHTML = 
		"T/E =" + getTE(arr);
	    
	    if (estimateString.indexOf("*") >= 0) {
		document.getElementById("est" + postfix).className = "est red";
	    } else {
		document.getElementById("est" + postfix).className = "est";
	    }
	    
	    console.log("est: " + estimateString);
	    
	}
    }
    store();
    updateSummary(s,g);
    doUpdate();    
}


function run () {
    $( ".app" )
	.delegate("button[data-button='effort']", "click", function (evtObj) {
	    console.log("new effort");
	    
	    var jqPar = $(evtObj.target).parent(".specie");
	    console.log("+parent: " + jqPar);
	    
	    var specieId = parseInt(jqPar.data("species-id"));
	    console.log("+species-id: " + specieId);
	    
	    createNewEffort("", specieId);
	});

    $( ".app" )
	.delegate("button[data-button='group']", "click", function (evtObj) {
	    console.log("new group");
	    var jqPar = $(evtObj.target).parent(".specie");
	    var specieId = jqPar.data("species-id");
	    createNewGroup(specieId);
	});

    $( ".app" )
	.delegate("button[data-button='species']", "click", function (evtObj) {
	    console.log("new species");
	    createNewSpecies();
	});
    

    $( ".app" )
	.delegate(".editable", "click", function (evtObj) {
	    console.log("Clicked editable");
	    $(evtObj.target).attr('contenteditable','true');
	    $(evtObj.target).focus();
	});
    
    $( ".app" )
	.delegate(".editable", "blur", function (evtObj) {
	    // TODO update window.elfish to reflect changes
	    var sp = parseInt($(evtObj.target).attr("data-effort-header-specie"));
	    var gr = parseInt($(evtObj.target).attr("data-effort-header-group"));
	    var ef = parseInt($(evtObj.target).attr("data-effort-header-effort"));
	    
	    var header = $(evtObj.target).text();
	    window.elfish.species[sp].groups[gr].efforts[ef].name = header;
	    
	    console.log("Updating " + sp + "," + gr + "," + ef + " to " + header);
	    $(evtObj.target).attr('contenteditable','false');
	});
    
    $(document).ready(function() {
	$('.app').on("keydown",'.editable', function(evtObj) {
            if (evtObj.key == "Enter") {
		console.log('disable edit for' + evtObj.target);
		$(evtObj.target).blur();
	    } else if (evtObj.key == "Esc" || evtObj.key == "Escape" ) {
		// TODO reset to old innerHTML
		var sp = parseInt($(evtObj.target).attr("data-effort-header-specie"));
		var gr = parseInt($(evtObj.target).attr("data-effort-header-group"));
		var ef = parseInt($(evtObj.target).attr("data-effort-header-effort"));
		var old = window.elfish.species[sp].groups[gr].efforts[ef].name;
		
		console.log('edit cancelled');
		$(evtObj.target).blur();
		
		window.elfish.species[sp].groups[gr].efforts[ef].name = old;
		var header = $(evtObj.target).text(old);
	    }
	});
    });
    
    $( ".app" )
	.delegate(".catch-input", "change", function (evtObj) {
	    var val = evtObj.target.value;
	    val = parseInt(val);
	    
	    s = parseInt($(evtObj.target).attr("data-input-species"))
	    g = parseInt($(evtObj.target).attr("data-input-group"))
	    e = parseInt($(evtObj.target).attr("data-input-effort"))
	    
	    window.elfish.species[s].groups[g].efforts[e].value = val;
	    
	    recomputeValues(s,g,e);
	});
}

function updateSummary (sp,gr) {
    var elt = document.getElementById("group-summary-" + gr);
    
    var groups = window.elfish.species[sp].groups[gr];
    var numOfEfforts = groups.efforts.length;
    var totalCatch = 0;
    for (var e = 0; e < numOfEfforts; e++) {
	console.log("totalCatch += " + groups.efforts[e].value);
	totalCatch += parseInt(groups.efforts[e].value);
    }
    
    var data = "<p>Efforts = " + numOfEfforts + "</p>";
    data += "<p>EST = " + "est" + "</p>"; // TODO get arr
    data += "<p>T = " + totalCatch + "</p>";
    
    console.log("Set summary for " + gr);
    
    elt.innerHTML = data;
}


// same-ish as window.onload
$(function () {
    
    if (window.localStorage.getItem("elfish") === null) {
	console.log("No local storage, starting fresh ... ");
    } else {
	console.log("Has local storage, reloading ... ");
	retrieve();
    }
    
    run();
})
