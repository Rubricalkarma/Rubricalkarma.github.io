
var apiKey="dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";
var apiProgression = "https://us.api.battle.net/wow/character/zuljin/magepie?fields=progression&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";
var apiRaceInfo = "https://us.api.battle.net/wow/data/character/races?locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";
var apiClassInfo = "https://us.api.battle.net/wow/data/character/classes?locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";
var apiRealm = "https://us.api.battle.net/wow/realm/status?locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";

var raidInfoObject;
var realmList=[];


var recentCharacters=JSON.parse(localStorage.getItem('recentCharacters'));
if(recentCharacters===null){
	recentCharacters=[];
}
//recentCharacters.push("hellotest");
console.log(recentCharacters);
console.log("up to date");

function removeRecentCharacters(){
	localStorage.removeItem('recentCharacters');
	recentCharacters=[];
	getRealms();
}

function getRealms(){

	//gets realms from local storage
	var realmInfoObject = JSON.parse(localStorage.getItem('realmInfoObject'));
	//if the realms JSON is empty, calls api and stores realminfo
	if(realmInfoObject===null){
		$.ajax({
			url: apiRealm,
			async: false,
			dataType: 'json',
			success: function (json) {
				realmInfoObject = json;
				console.log("Realm info loaded from API");
				localStorage.setItem('realmInfoObject', JSON.stringify(realmInfoObject));
			}
		});
	}else{
		//if JSON is not empty, continues as normal
		console.log("Realm info loaded from Local Storage");
	}
	//adds all realms to array
	for(let i=0;i<realmInfoObject.realms.length;i++){
		realmList.push(realmInfoObject.realms[i].name);
	}

		//sets autocomplete for serverSearch with realmList array
		$( "#serverSearch" ).autocomplete({
			minLength: 0,
			source: realmList,
			position: {my: "left+0 top+0",},
		})
		.focus(function() {
			$(this).autocomplete('search', $(this).val())
		});

		//sets autocomplete for serverSearch with realmList array
		$( "#characterSearch" ).autocomplete({
			minLength: 0,
			source: recentCharacters,
		})
		.focus(function() {
			$(this).autocomplete('search', $(this).val())
		});


	}



	function getProgressionInfo(){

		var server = document.getElementById("serverSearch").value;
		var character = document.getElementById("characterSearch").value;
		var apiCharProgression = 'https://us.api.battle.net/wow/character/'+server+'/'+character+'?fields=progression&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8';
		var apiItems = 'https://us.api.battle.net/wow/character/'+server+'/'+character+'?fields=items&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8';
		if(!recentCharacters.includes(character)){
			recentCharacters.push(character);
		}
		localStorage.setItem('recentCharacters', JSON.stringify(recentCharacters));
		var itemInfoObject;

		$.ajax({
			url: apiItems,
			async: false,
			dataType: 'json',
			success: function (json) {
				itemInfoObject = json;
			}
		});

		var color = "gray";
		var itemLevel = itemInfoObject.items.averageItemLevel;

		if(itemLevel>960){
			color="orange";
		}
		else if(itemLevel>940){
			color="purple";
		}
		else if(itemLevel>920){
			color="blue";
		}
		else if(itemLevel>900){
			color="green";
		}
		else if(itemLevel>880){
			color="white";
		}
		var profileImage = itemInfoObject.thumbnail.replace("avatar.jpg", "profilemain.jpg");

		document.getElementById("itemLevel").style = "color: "+color;
		document.getElementById("itemLevel").innerHTML = itemLevel;
		document.getElementById("icon").src = "http://render-us.worldofwarcraft.com/character/"+profileImage;

		$.ajax({
			url: apiCharProgression,
			async: false,
			dataType: 'json',
			success: function (json) {
				characterProgressionInfoObject = json;
			}
		});

		console.log("helloss");
		var raidIndex = 0;
		var bossIndex=0;
		//var raidName = document.getElementById("raidSelect").value;
		//var bossName = document.getElementById("bossSelect").value;

	/*
	for(var j=0;j<characterProgressionInfoObject.progression.raids.length;j++){
		if(characterProgressionInfoObject.progression.raids[j].name === raidName){
			raidIndex=j;
			break;
		}
	}

	for(var k=0;k<characterProgressionInfoObject.progression.raids[raidIndex].bosses.length;k++){
		if(characterProgressionInfoObject.progression.raids[raidIndex].bosses[k].name===bossName){
			bossIndex=k;
			break;
		}
	}
	*/


	document.getElementById("name").style.color=getClassColor(characterProgressionInfoObject.class);
	document.getElementById("name").innerHTML = characterProgressionInfoObject.name+" - "+characterProgressionInfoObject.realm;
	document.getElementById("characterInfo").style.color=getClassColor(characterProgressionInfoObject.class);
	document.getElementById("characterInfo").innerHTML = "level "+characterProgressionInfoObject.level+" "+getRace(characterProgressionInfoObject.race)+" "+getClass(characterProgressionInfoObject.class);

	var killFeed="";
	for(var i = 0;i<characterProgressionInfoObject.progression.raids.length;i++){
		console.log("Raid: "+ characterProgressionInfoObject.progression.raids[i].name);
		raidIndex=i;
		for(var j = 0;j<characterProgressionInfoObject.progression.raids[raidIndex].bosses.length;j++){
			console.log("      "+characterProgressionInfoObject.progression.raids[raidIndex].bosses[j].name);
			bossIndex=j;

			killFeed = killFeed.concat("<div>"+characterProgressionInfoObject.progression.raids[raidIndex].name+" - "+characterProgressionInfoObject.progression.raids[raidIndex].bosses[bossIndex].name+"</div><br/>"+
				"<div style='color: green'>LFR: "+characterProgressionInfoObject.progression.raids[raidIndex].bosses[bossIndex].lfrKills+"</div><br/>"+
				"<div style='color: orange'>Normal: "+characterProgressionInfoObject.progression.raids[raidIndex].bosses[bossIndex].normalKills+"</div><br/>"+
				"<div style='color: yellow'>Heroic: "+characterProgressionInfoObject.progression.raids[raidIndex].bosses[bossIndex].heroicKills+"</div><br/>"+
				"<div style='color: red'>Mythic: "+characterProgressionInfoObject.progression.raids[raidIndex].bosses[bossIndex].mythicKills+"</div><br/>");
		}	

	}
	console.log(killFeed);
	document.getElementById("kills").innerHTML = killFeed;
}	

function getClassColor(number){
	switch(number){
		case 1: return "#C79C6E";
		break;
		case 2: return "#F58CBA";
		break;
		case 3: return "#ABD473"
		break;
		case 4: return "#FFF569";
		break;
		case 5: return "#FFFFFF";
		break;
		case 6: return "#C41F3B";
		break;
		case 7: return "#0070DE";
		break;
		case 8: return "#69CCF0";
		break;
		case 9: return "#9482C9";
		break;
		case 10: return "#00FF96";
		break;
		case 11: return "#FF7D0A";
		break;
		case 12: return "#A330C9";
		break;
	}
}




function getClass(number){

	var classObject = null;

	$.ajax({
		url: apiClassInfo,
		async: false,
		dataType: 'json',
		success: function (json) {
			classObject = json;
		}
	});

	for(var i=0;i<classObject.classes.length;i++){
		if(classObject.classes[i].id===number){
			return classObject.classes[i].name;	
		}
	}
}

function getRace(number){


	var raceObject = null;

	$.ajax({
		url: apiRaceInfo,
		async: false,
		dataType: 'json',
		success: function (json) {
			raceObject = json;
		}
	});

	for(var i=0;i<raceObject.races.length;i++){
		if(raceObject.races[i].id===number){
			return raceObject.races[i].name;	
		}
	}
}

function getRaids(){
 	//Reads raidInfo from localstorage
 	raidInfoObject = JSON.parse(localStorage.getItem('raidInfoObject'));
	//Checks if the info is empty
	//If so, makes api call to recieve information
	if(raidInfoObject===null){
		$.ajax({
			url: apiProgression,
			async: false,
			dataType: 'json',
			success: function (json) {
				raidInfoObject = json;
				console.log("Raid Boss Info Recieved")
				localStorage.setItem('raidInfoObject', JSON.stringify(raidInfoObject));
			}
		});
	}else{
	//If the info is not null, then continues properly
	console.log("Raid Boss Info Read From Cache");
}

}

function addRaids(){

	for(var i=0;i<raidInfoObject.progression.raids.length;i++){
		var x = document.getElementById("raidSelect");
		var c = document.createElement("option");
		c.text = raidInfoObject.progression.raids[i].name;
		x.options.add(c, i);
	}
}

function getBosses(){


	$("#bossSelect").empty();

	var selected = document.getElementById("raidSelect").value;

	var raidIndex;

	for(var i=0;i<raidInfoObject.progression.raids.length;i++){
		if(raidInfoObject.progression.raids[i].name===selected){
			raidIndex=i;
			break;
		}
	}

	for(var j=0;j<raidInfoObject.progression.raids[raidIndex].bosses.length;j++){
		var x = document.getElementById("bossSelect");
		var c = document.createElement("option");
		c.text = raidInfoObject.progression.raids[raidIndex].bosses[j].name;
		x.options.add(c, i);
	}


}