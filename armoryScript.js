
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
	realmList = [];
	for(let i=0;i<realmInfoObject.realms.length;i++){
		realmList.push(realmInfoObject.realms[i].name);
	}
	setAutoComplete(realmList,recentCharacters);
}

function getMasterList(){
	var masterListAPI = "https://us.api.battle.net/wow/zone/?locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8";
	raids;
	var masterList = null;
	$.ajax({
		url: masterListAPI,
		async: false,
		dataType: 'json',
		success: function (json) {
			masterList = json;
		}
	});
	return masterList;
}



function getProgressionInfo(){
	console.log('progression info ran');
	var server = document.getElementById("serverSearch").value;
	var character = document.getElementById("characterSearch").value;
	var apiCharProgression = 'https://us.api.battle.net/wow/character/'+server+'/'+character+'?fields=progression&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8';
	var apiItems = 'https://us.api.battle.net/wow/character/'+server+'/'+character+'?fields=items&locale=en_US&apikey=dfp2dz9s5mjnpsxyk3zatz9zc8mpmmq8';

	//Adds character to recently searched
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

	var itemLevel = itemInfoObject.items.averageItemLevel;
	var color = getItemLevelColor(itemLevel);

	var profileImage = itemInfoObject.thumbnail.replace("avatar.jpg", "profilemain.jpg");

	document.getElementById("itemLevel").style = "color: "+color;
	document.getElementById("itemLevel").innerHTML = "Item Level: "+itemLevel;
	document.getElementById("icon").src = "http://render-us.worldofwarcraft.com/character/"+profileImage;

	$.ajax({
		url: apiCharProgression,
		async: false,
		dataType: 'json',
		success: function (json) {
			characterProgressionInfoObject = json;
		}
	});

	var masterList = getMasterList();

	document.getElementById("name").style.color=getClassColor(characterProgressionInfoObject.class);
	document.getElementById("name").innerHTML = characterProgressionInfoObject.name+" - "+characterProgressionInfoObject.realm;
	document.getElementById("characterInfo").style.color=getClassColor(characterProgressionInfoObject.class);
	document.getElementById("characterInfo").innerHTML = "level "+characterProgressionInfoObject.level+" "+getRace(characterProgressionInfoObject.race)+" "+getClass(characterProgressionInfoObject.class);

	var killFeed="";
	$("#raids").html("");
	prevExpac=-1;
	for(var i = 0;i<characterProgressionInfoObject.progression.raids.length;i++){

		plainRaidName = characterProgressionInfoObject.progression.raids[i].name
		var titleMade = false;
		var expacTitleMade = false;


		//Gets expac of the raid
		var expac;
		var urlSlug;
		for(let h=0;h<masterList.zones.length;h++){
			//console.log(masterList.zones[h].urlSlug);
			if(masterList.zones[h].isRaid===true){
				if(masterList.zones[h].name===plainRaidName){
					expac = masterList.zones[h].expansionId;
					urlSlug = masterList.zones[h].urlSlug;
				}
			}
		}

		$("#raids").append("<div id=expac"+expac+"></div>");

		if(expac===prevExpac){
			expacTitleMade=true;
		}
		prevExpac=expac;


		if(!expacTitleMade){
			$("#expac"+expac).append("<div id=expac"+expac+"Title></div>");
			$("#expac"+expac+"Title").append("<button id=toggleExpac"+expac+">-</button> <span id=expac"+expac+"Title>"+getExpac(expac)+"</span>");
			$("#toggleExpac"+expac).css({
				"margin":"0px",
				"padding":"0px",
				"margin-right":"20px",
				"width":"32px",
				"height":"32px",
				"overflow":"hidden"
			});
			$("#toggleExpac"+expac).data("expac",expac);
			$("#toggleExpac"+expac).click(function(){
				if($(this).html()==="-"){
					$(this).html("+")
				}else{
					$(this).html("-")
				}
				hideRaid($(this).data("expac"));
			});
			$("#expac"+expac+"Title").css({
				"margin-bottom":"20px",
				"color":getExpacColor(expac)
			})
			$("#expac"+expac).append("<div id=expacRaids"+expac+"></div>")
			$("#expacRaids"+expac).css({
				//"border":"3px solid white"
			});
		}



		for(let p=0;p<4;p++){
			var raidName = characterProgressionInfoObject.progression.raids[i].name
				//Removes spaces and apostrophes
				raidName = raidName.replace(/\s/g, '');
				raidName = raidName.replace(/'/g, '');
				raidName = raidName.replace(",", '');

				plainRaidName = plainRaidName.replace(/\s/g, '');
				plainRaidName = plainRaidName.replace(/'/g, '');
				plainRaidName = plainRaidName.replace(",", '');

				var raidType;
				switch(p){
					case 0: raidName+="lfr";
					raidType="lfr";
					break;
					case 1: raidName+="normal";
					raidType="normal";
					break;
					case 2: raidName+="heroic";
					raidType="heroic";
					break;
					case 3: raidName+="mythic";
					raidType="mythic";
					break;
				}
				console.log(raidName);

				var raidTypeExists = true;
				var numberOfBosses = characterProgressionInfoObject.progression.raids[i].bosses.length;
				var numberOfBossesKilled=0;

				if(raidType==="lfr"){
					for(let k = 0;k<numberOfBosses;k++){
						if(characterProgressionInfoObject.progression.raids[i].bosses[k].lfrKills>0 || characterProgressionInfoObject.progression.raids[i].bosses[k].lfrKills === undefined){
							if(characterProgressionInfoObject.progression.raids[i].bosses[0].lfrKills === undefined){
								//console.log(raidType+": "+characterProgressionInfoObject.progression.raids[i].bosses[k].lfrKills);
								raidTypeExists=false;
								break;
							}else{
								numberOfBossesKilled++;
							}
						}
					}
				}
				else if(raidType==="normal"){
					for(let k = 0;k<numberOfBosses;k++){
						if(characterProgressionInfoObject.progression.raids[i].bosses[k].normalKills>0 || characterProgressionInfoObject.progression.raids[i].bosses[k].normalKills === undefined){
							if(characterProgressionInfoObject.progression.raids[i].bosses[0].normalKills === undefined){
								//console.log(raidType+" does not exist");
								raidTypeExists=false;
								break;
							}else{
								numberOfBossesKilled++;
							}
						}
					}
				}
				else if(raidType==="heroic"){
					for(let k = 0;k<numberOfBosses;k++){
						if(characterProgressionInfoObject.progression.raids[i].bosses[k].heroicKills>0 || characterProgressionInfoObject.progression.raids[i].bosses[k].heroicKills === undefined){
							if(characterProgressionInfoObject.progression.raids[i].bosses[0].heroicKills === undefined){
								//console.log(raidType+" does not exist");
								raidTypeExists=false;
								break;
							}else{
								numberOfBossesKilled++;
							}
						}
					}
				}
				else if(raidType==="mythic"){
					for(let k = 0;k<numberOfBosses;k++){
						if(characterProgressionInfoObject.progression.raids[i].bosses[k].mythicKills>0 || characterProgressionInfoObject.progression.raids[i].bosses[k].mythicKills === undefined){
							if(characterProgressionInfoObject.progression.raids[i].bosses[0].mythicKills === undefined){
								//console.log(raidType+" does not exist");
								raidTypeExists=false;
								break;
							}else{
								numberOfBossesKilled++;
							}
						}
					}
				}

				var bossPercentage = numberOfBossesKilled/numberOfBosses;



				//Creates div with raids name

				if(raidTypeExists){
					while(!titleMade){
						imageURL = "https://render-us.worldofwarcraft.com/zones/"+urlSlug+"-small.jpg"
						//$("#raids").append("<div id="+plainRaidName+"></div>");
						$("#expacRaids"+expac).append("<div id="+plainRaidName+"></div>");
						$("#"+plainRaidName).append("<p id="+raidName+"Title"+">"+characterProgressionInfoObject.progression.raids[i].name+"</p><img id="+plainRaidName+"Img src="+imageURL+">");
						titleMade=true;	
					}
					$("#"+plainRaidName+"Img").css({
						"width":"200px",
						"height":"100px",
						"border":"1px solid white"
					});
					$("#"+plainRaidName).append("<div id="+raidName+"></div>");
					$("#"+plainRaidName).css({
						"display":"inline-block",
						"vertical-align":"top",
						"background":"rgba(57,38,95,.9)",
						"margin":"0px",
						"margin-bottom":"20px",
						"margin-right":"20px",
						"border":"1px solid	white",
						"width":"220px",
						"height":"330px",
						"padding":"15px",
					});
					$("#"+raidName+"Title").css({
						"color": getExpacColor(expac),
						"margin":"0px",
						"margin-bottom":"10px",
						"padding":"0px",
					});
					$("#"+raidName).css({
						"position":"relative",
						"display":"inline-block",
						"margin":"0px",
						"width":"200px",
					});
				//Adds bar to raid
				$("#"+raidName).append("<div id="+raidName+"RaidType></div>"+"<div id="+raidName+"BAR>&nbsp</div>");
				$("#"+raidName+"RaidType").css({
					"text-align":"center"
				});
				$("#"+raidName+"RaidType").append("<span>"+raidType+"</span>");
				$("#"+raidName+"BAR").css({
					"width":"200px",
					"margin-top":"2px",
					"background":"linear-gradient(brown,rgb(101,33,33))",
					"color":"blue",
					"position":"relative",
					"border": "1px solid white"
				});
				//Adds Progress Bar to Raid Bar
				$("#"+raidName+"BAR").append("<div id="+raidName+"PROGRESS><span>&nbsp<span></div>");

				//Stores info on each boss kill
				$("#"+raidName+"BAR").data("numberOfBossesKilled",numberOfBossesKilled);
				$("#"+raidName+"BAR").data("numberOfBosses",numberOfBosses);

				$("#"+raidName+"PROGRESS").css({
					"width":(bossPercentage*200)+"px",
					"color":"white",
					"background":"linear-gradient(green,darkgreen)",
					"position":"absolute",
					"top":"0",
					"left":"0",
					"padding":"0px"
				});


				//Adds hover function to bar
				$("#"+raidName+"BAR").hover(
					function(){
						console.log(this.id)
						var divProgress = this.id;
						let nobk = $(this).data("numberOfBossesKilled");
						let nob = $(this).data("numberOfBosses");
						/*
						divProgress = divProgress.replace("BAR","PROGRESS");
						move(divProgress,nobk/nob);
						*/
						$(this).find("span").html(nobk+"/"+nob);
						console.log($("#"+this.id).width());
						var barWidth = $("#"+this.id).width();
						$(this).find("span").css({"padding-left": (barWidth/2)-15+"px"});
					},
					function(){
						console.log("off")
						$(this).find("span").html("&nbsp");
					});
				

			}
		}
	}
	//document.getElementById("kills").innerHTML = killFeed;
	document.getElementById("bgLayer").style.height= document.getElementById('info').clientHeight+30+"px";
}
function convertDate(epoch){
	return new Date(epoch);
}


function hideRaid(expac){
	console.log("Hiding raid "+expac);
	$("#expacRaids"+expac).toggle(500);
}

function move(divName,maxWidth) {
	var elem = document.getElementById(divName); 
	var width = 1;
	var id = setInterval(frame, 20);
	function frame() {
		if (width >= maxWidth*100) {
			clearInterval(id);
		} else {
			width++; 
			elem.style.width = width + '%'; 
		}
	}
}

function getExpacColor(number){
	switch(number){
		case 0: return "gold";
		break;
		case 1: return "lightgreen";
		break;
		case 2: return "blue";
		break;
		case 3: return "orange";
		break;
		case 4: return "darkred";
		break;
		case 5: return "brown";
		break;
		case 6: return "green";
		break;
	}
}
function getExpac(number){
	switch(number){
		case 0: return "Classic";
		break;
		case 1: return "The Burning Crusade";
		break;
		case 2: return "Wrath of the Lich King";
		break;
		case 3: return "Cataclysm";
		break;
		case 4: return "Mists of Pandaria";
		break;
		case 5: return "Warlords of Dreanor";
		break;
		case 6: return "Legion";
		break;
	}
}

function getItemLevelColor(itemLevel){
	if(itemLevel>960){
		return "orange";
	}
	else if(itemLevel>940){
		return "purple";
	}
	else if(itemLevel>920){
		return "blue";
	}
	else if(itemLevel>900){
		return "green";
	}
	else if(itemLevel>880){
		return "white";
	}else{
		return "gray";
	}
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


function setAutoComplete(realmList, recentCharacters){
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
