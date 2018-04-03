

var apiProgression = "https://us.api.battle.net/wow/character/zuljin/magepie?fields=progression&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";
var raidInfoObject;
var realmList=[];

function getRealms(){
	var realmInfoObject;
	var apiRealm = "https://us.api.battle.net/wow/realm/status?locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";

	$.ajax({
		url: apiRealm,
		async: false,
		dataType: 'json',
		success: function (json) {
			realmInfoObject = json;
		}
	});

	for(let i=0;i<realmInfoObject.realms.length;i++){
		realmList.push(realmInfoObject.realms[i].name);
	}
	
	$( function() {

		$( "#serverSearch" ).autocomplete({
			source: realmList,
		});
	} );

}


function getProgressionInfo(){
	var server = document.getElementById("serverSearch").value;
	var character = document.getElementById("characterSearch").value;
	var apiProgression = 'https://us.api.battle.net/wow/character/'+server+'/'+character+'?fields=progression&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8';
	var apiItems = 'https://us.api.battle.net/wow/character/'+server+'/'+character+'?fields=items&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8';



	$.getJSON(apiItems, function(data){

		var color = "gray";
		var itemLevel = data.items.averageItemLevel;

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
		var profileImage = data.thumbnail.replace("avatar.jpg", "profilemain.jpg");

		document.getElementById("itemLevel").style = "color: "+color;
		document.getElementById("itemLevel").innerHTML = itemLevel;
		document.getElementById("icon").src = "http://render-us.worldofwarcraft.com/character/"+profileImage;
		
	});


	$.getJSON(apiProgression, function(data) {

		var raidIndex = 0;
		var bossIndex=0;
		var raidName = document.getElementById("raidSelect").value;
		var bossName = document.getElementById("bossSelect").value;


		for(var j=0;j<data.progression.raids.length;j++){
			if(data.progression.raids[j].name === raidName){
				raidIndex=j;
				break;
			}
		}

		for(var k=0;k<data.progression.raids[raidIndex].bosses.length;k++){
			if(data.progression.raids[raidIndex].bosses[k].name===bossName){
				bossIndex=k;
				break;
			}
		}

		document.getElementById("name").style.color=getClassColor(data.class);
		document.getElementById("name").innerHTML = data.name+" - "+data.realm;
		document.getElementById("characterInfo").style.color=getClassColor(data.class);
		document.getElementById("characterInfo").innerHTML = "level "+data.level+" "+getRace(data.race)+" "+getClass(data.class);
		document.getElementById("kills").innerHTML = 
		"<div>"+data.progression.raids[raidIndex].name+" - "+data.progression.raids[raidIndex].bosses[bossIndex].name+"</div><br/>"+
		"<div style='color: green'>LFR: "+data.progression.raids[raidIndex].bosses[bossIndex].lfrKills+"</div><br/>"+
		"<div style='color: orange'>Normal: "+data.progression.raids[raidIndex].bosses[bossIndex].normalKills+"</div><br/>"+
		"<div style='color: yellow'>Heroic: "+data.progression.raids[raidIndex].bosses[bossIndex].heroicKills+"</div><br/>"+
		"<div style='color: red'>Mythic: "+data.progression.raids[raidIndex].bosses[bossIndex].mythicKills+"</div><br/>"
		


	});


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

	var apiClassInfo = "https://us.api.battle.net/wow/data/character/classes?locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";

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
	var apiRaceInfo = "https://us.api.battle.net/wow/data/character/races?locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";

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