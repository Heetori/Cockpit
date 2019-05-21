document.getElementById( 'page' ).style.display = 'none';
document.getElementById('music_on').style.display = 'none';

//-------- WAITING BOT ---------\\
var wait_bot_bool     = true;
var ipserver          = "192.168.0.129";
var guid              = "f5fe3664-cc88-46c5-a613-c771a34cec69";

//--------- MAP CREATION --------\\
var name              = "";
var width             = "";
var height            = "";
var map_data          = "";

// ------ CHRONOMETRE -----------\\
var setTm       = 0;
var tmStart     = 0;
var tmNow       = 0;
var tmInterv    = 0;
var tTime       = [];
var nTime       = 0;

//------ AUDIO COCKPIT ----------\\
var music_on          = false;
var audio             = new Audio('audio_file2.mp3');

//----- THEME PAR DEFAUT DARK ----\\
var darktheme         = true;
var s                 = document.getElementById('theme');
switchtheme(darktheme);

//----- STRAT THEO BOT -----------\\
var strat_html      = "";
var bool_strat      = true;


WebSocketTest();


// -------------------------------------------  WEB SOCKET  ------------------------------------------- \\

function WebSocketTest() {

  var j             = 0;
  var wall          = "white";
  var tour          = 0;
  var x_old         = "";
  var y_old         = "";
  var x_player      = "";
  var y_player      = "";
  var shield_max    = 1;
  var first_tour    = true;
  var is_generated  = false;
  
  if ("WebSocket" in window) {
    console.log("WebSocket is supported by your Browser!");

               // Let us open a web socket
               var ws = new WebSocket("ws://" + ipserver + ":4226/cockpit");
               document.getElementById('wait').innerHTML    = "CONNECTION</br>";
               document.getElementById('ip_guid').innerHTML = "</br><input type='text' name='ipserver' id='ipserver' value='localhost' /><input type='button' id='button_ip' value='Change IP' onclick='get_ipserv();' />";
               if(wait_bot_bool){
                wait_bot();
                wait_bot_bool = false;
              }


              ws.onopen = function() {
                ws.send(guid);
                document.getElementById('wait').innerHTML       = "WAITING FOR BOT";
                document.getElementById('ip_guid').innerHTML    = "</br><input type='text' name='guid_change' id='guid_change' value='f5fe3664-cc88-46c5-a613-c771a34cec69' /><input type='button' id='button_guid'  value='change GUID' onclick='get_GUID();' />";
                ws.binaryType                                   = "arraybuffer";
              };

              ws.onmessage = function (evt) {
                var data        = new Uint8Array(evt.data);

                switch (data[0]){
                  case 77:
                  height        = data[3];
                  width         = data[1];
                  map_data      = data;

                  create_map(height, width);
                  fill_map(data, width, height, wall);

                  break;

                  case 78:

                  for(j=1; j<data.length;j++){
                    name = name + String.fromCodePoint(data[j]);
                  }
                  display_page(name);

                  break;

                  case 80:

                  x_player        = data[1];
                  y_player        = data[2];

                  if(first_tour){

                    x_old         = x_player;
                    y_old         = y_player;
                    add_bot(x_player,y_player,height);
                    first_tour    = false;

                  } else {

                    delet_object(x_old,y_old,height);
                    x_player      = data[1];
                    x_old         = x_player;
                    y_player      = data[2];
                    y_old         = y_player;
                    add_bot(x_player,y_player,height)

                  }

                  break;

                  case 67:

                  fStart();
                  display_page(name);

                  if(music_on){
                    if(first_tour){
                      audio.play();
                    } else {
                      audio.currentTime=0;
                      audio.play();
                    }
                  }

                  tour++;
                  var energie_player        = data[1]+data[2]*256;
                  var shield_player         = data[3]+data[4]*256;
                  var invisibility_player   = data[5]+data[6]*256;
                  var score_player          = data[7]+data[8]*256;

                  info(energie_player,shield_player,invisibility_player,score_player,tour, shield_max);
                  strat(energie_player,shield_player,invisibility_player, tour);
                  document.getElementById( 'change_theme' ).style.display = 'none';

                  break;

                  case 73:

                  var diam = data[1];
                  update_map(diam, data, width, height, x_player, y_player, first_tour);

                  break;

                  case 68:

                  fStop();
                  document.getElementById( 'page' ).style.display = 'none';
                  document.getElementById( 'dead_bot' ).innerHTML = "LE BOT EST MORT";

                  break;

                  default:
                }
              };

              ws.onclose = function() { 
                  // websocket is closed.
                  console.log("Connection is closed..."); 
                };
              } else {

               // The browser doesn't support WebSocket
               console.log("WebSocket NOT supported by your Browser!");
             }
           }


// ----------------------------------------------------------------------------------------------------------- \\

// ------------------------------------------------ DISPLAY --------------------------------------------------- \\

function display_page(name){
  document.getElementById('wrapper').style.marginLeft = "100px";
  document.getElementById('wait').style.marginTop             = '2px';
  document.getElementById("name_robot").innerHTML             = name;
  document.getElementById( 'page' ).style.display             = 'inline';
  document.getElementById('wait').innerHTML                   = '';
  document.getElementById('point').style.display              = 'none';
  document.getElementById('ip_guid').style.display            = 'none';
  document.getElementById('music_on').style.display           = 'inline';
}

// ----------------------------------------------------------------------------------------------------------- \\

// -------------------------------------  CREATION ET EDITION DE LA MAP --------------------------------------- \\
function create_map(height, width){
  //boucle
  var i;

  //creation du tableau en htlm
  var map         = false;
  var creatmap    = "";
  var title       = "<table>";
  var creatmap1   = "<tr>";
  var creatmap3   = "</td>";
  var creatmap4   = "</tr>";

    //Création du tableau de la carte
    for(i=1; i <= height; i ++){
      creatmap = creatmap + creatmap1;
      for(j=1; j <= width; j ++){
        var creatmap2 = "<td class=tr"+i+">";
        creatmap = creatmap + creatmap2+creatmap3;
      }
      creatmap = creatmap + creatmap4;
    }

    document.getElementById("map").innerHTML = title+creatmap+"</table>";
    map = true;
  }

  function fill_map(data, width,height, wall){
    //console.log(width);
    var k = 5;
    for(i=height;i>0 ;i--){
     //console.log(wall);
     for(j=0;j<width;j++){

      var str = data[k];

      if(str == 2){
        if(map){

          add_wall(j,i, wall);
        } else {
          console.log("error");
        }
      }

      k++; 

    }
  }
}

// ----------------------------------------------------------------------------------------------------------- \\

// ---------------------------------------- UPDATE MAP & FUNCTION --------------------------------------------- \\

function update_map(diam, data, width, height, x_player, y_player, first_tour){
  //console.log("width = " + width);
  var rayon         = (diam - 1)/2;
  var x_start       = x_player - rayon;
  var y_start       = y_player + rayon;
  var x_start_save  = x_start;
  k                 = 2;

  //console.log("x de depart : " + x_start + "y de depart :" + y_start);

  

  //console.log("rayon : "+rayon);
  for(j = 0; j <diam; j++) {
    for(i=0; i <diam  ; i++){
      var str = data[k];

      if(str == 0){
        if(x_start<width){
          delet_object(x_start,y_start,height);
        }
      }

      if(str == 3){
        if(x_start < width){
          //console.log(height);
          add_energie(x_start,y_start,height);
        }else{
          console.log("error");
        }
      }

      if(str == 4){
        if(first_tour){
          first_tour = false;
        }else if(x_start < width ){
          add_enemi(x_start,y_start,height);
        } 
      }

      k++;
      x_start++;

    }
    x_start = x_start_save;
    y_start--;
  }
}


function add_wall(x,y, wall){
  var tr                      = "tr"+(y)+"";
  var tr                      = document.getElementsByClassName(tr);
  tr[x].style.backgroundColor = wall;
}


function add_energie(x,y,height){
  if(map){
    //console.log("Energie : x :"+x+" y : "+(height-y));
    var tr                      = "tr"+(height - y)+"";
    tr                          = document.getElementsByClassName(tr);
    tr[x].style.backgroundColor = "yellow";
  } else {
    console.log("error");
  }
}


function add_bot(x,y,height){
  if(map){

    var tr                      = "tr"+(height - y)+"";
    var tr                      = document.getElementsByClassName(tr);
    tr[x].style.backgroundColor = "red";
  } else {
    console.log("error");
  }
}


function add_enemi(x,y,height){
  if(map){
    var tr                      = "tr"+(height - y)+"";
    var tr                      = document.getElementsByClassName(tr);
    tr[x].style.backgroundColor = "purple";
  } else {
    console.log("error");
  }
}


function delet_object(x,y,height){
  if(map){
    var tr                        = "tr"+(height - y)+"";
    var tr                        = document.getElementsByClassName(tr);

    if(darktheme){
      tr[x].style.backgroundColor = "rgb(35,35,35)";
    } else {
      tr[x].style.backgroundColor = "white";
    } 
  } else {
    console.log("error");
  }
}

// ------------------------------------------------------------------------------------------------------------ \\


// ----------------------------- CREATION ET EDITION DU TABLEAU DES INFORMATIONS ------------------------------ \\

function info (Energie, shield, invisibility, Score, tour, shield_max){
  document.getElementById("Tour").innerHTML                               = tour;
  if(Energie < 40){
    document.getElementById("progress_bar").innerHTML                     = "WARNING : LOW ENERGY LEVEL : " + Energie;
    document.getElementById("progress_bar").style.backgroundColor         = "rgb(199,0,0)";
  } else {
    document.getElementById("progress_bar").innerHTML                     = "ENERGY LEVEL : " + Energie;
    document.getElementById("progress_bar").style.backgroundColor         = "rgb(107,232,14)";
  }

  if(Energie < 400){
    var energie_prct = Energie/400*100;
    document.getElementById("progress_bar").style.width                   = energie_prct+"%";
  } else {
    document.getElementById("progress_bar").style.width                   = "100%";
    energyBarFadeIn(Energie);
  }
  
  if(shield < 15 ) {
    document.getElementById("progress_bar_shield").innerHTML              = "WARNING : LOW SHIELD LEVEL : "+ shield;
    document.getElementById("progress_bar_shield").style.backgroundColor  = "rgb(199,0,0)";
  } else {
    document.getElementById("progress_bar_shield").innerHTML              = "SHIELD LEVEL : " + shield;
    document.getElementById("progress_bar_shield").style.backgroundColor  = "rgb(134,224,225)";
  }

  if(shield > shield_max ){
    shield_max = shield;
  }
  var shield_prct = shield/shield_max*100;
  document.getElementById("progress_bar_shield").style.width              = shield_prct+"%";
  document.getElementById("invisibility").innerHTML                       = invisibility + " case(s)";
  document.getElementById("Score").innerHTML                              = Score + " pts";
}

// ----------------------------------------------------------------------------------------------------------- \\

// -------------------------------------------------- THEME --------------------------------------------------- \\

function theme(){
  var checkBox = document.getElementById("theme");
  if (checkBox.checked == true){
    darktheme = true;
    switchtheme(darktheme);
  }else {
    darktheme = false;
    switchtheme(darktheme);
  }
  /*
  if(x == 1){
    darktheme = true;
    switchtheme(darktheme);
  } else {
    darktheme = false;
    switchtheme(darktheme);
  }*/
}

function switchtheme (darktheme){
  switch (darktheme){

    case true:

    wall                                                        = "white";
    var background                                              = "rbg(35,35,35)"
    document.body.style.backgroundColor                         = "rgb(35,35,35)";
    document.getElementById("icone_mur").style.backgroundColor  = "white";
    document.body.style.color                                   = "white";
    fill_map(map_data, width, height, wall);

    break;

    case false:

    wall = "black";
    document.body.style.color                                   = "black";
    document.body.style.backgroundColor                         = "white";
    document.getElementById("icone_mur").style.backgroundColor  = "black";
    fill_map(map_data, width, height, wall);

    break;

    default:
  }
}

// ----------------------------------------------------------------------------------------------------------- \\

// -------------------------------------------------- WAIT BOT ----------------------------------------------- \\

function wait_bot(){
  var isCycleEnded=true; //on va le faire alterner pour passer de blanc à rouge et de rouge à blanc
  var timer = setInterval(function(){//toute les 1700 ms on rejouer cette fonction
    if(isCycleEnded == true){
      setTimeout(function() {
        document.getElementById("point").innerHTML = ' ';}, 0);
      setTimeout(function() {
        document.getElementById("point").innerHTML = '.';}, 500);
      setTimeout(function() {
        document.getElementById("point").innerHTML = '..';}, 1000);
      setTimeout(function() {
        document.getElementById("point").innerHTML = '...';}, 1500);
    }
    else if(isCycleEnded == false){
      setTimeout(function() {
        document.getElementById("point").innerHTML = ' ';}, 0);
      setTimeout(function() {
        document.getElementById("point").innerHTML = '.';}, 500);
      setTimeout(function() {
        document.getElementById("point").innerHTML = '..';}, 1000);
      setTimeout(function() {
        document.getElementById("point").innerHTML = '...';}, 1500);
    }
    isCycleEnded = !isCycleEnded;
  }, 2000);
}
// ----------------------------------------------------------------------------------------------------------- \\

// ---------------------------------------------- GET IP & GUID ----------------------------------------------- \\

function get_ipserv(){
 ipserver = document.getElementById("ipserver").value;
 WebSocketTest();
}

function get_GUID(){
 guid = document.getElementById("guid_change").value;
 WebSocketTest();
}

// ----------------------------------------------------------------------------------------------------------- \\

// ---------------------------------------------- CHRONOMETRE ------------------------------------------------- \\

function affTime(tm){ //affichage du compteur
 var vMin       = tm.getMinutes();
 var vSec       = tm.getSeconds();
   var vMil     = Math.round((tm.getMilliseconds())/10); //arrondi au centième
   if (vMin<10){
    vMin        = "0"+vMin;
  }
  if (vSec<10){
    vSec        = "0"+vSec;
  }
  if (vMil<10){
    vMil        = "0"+vMil;
  }
  document.getElementById("Time").innerHTML=vMin+":"+vSec+":"+vMil;
}

function fChrono(){
 tmNow          = new Date();
 Interv         = tmNow-tmStart;
 tmInterv       = new Date(Interv);
 affTime(tmInterv);
}

function fStart(){
 fStop();
 if (tmInterv==0) {
  tmStart     = new Date();
   } else { //si on repart après un clic sur Stop
    tmNow     = new Date();
    Pause     = tmNow-tmInterv;
    tmStart   = new Date(Pause);
  }
   setTm=setInterval(fChrono,10); //lancement du chrono tous les centièmes de secondes
 }

 function fStop(){
   clearInterval(setTm);
   tTime[nTime]=tmInterv;
 }
// ------------------------------------------------------------------------------------------------------------ \\

 // ------------------------------------------ GESTION DE LA MUSIQUE -------------------------------------------\\

 function ismusic_on(){
  if(music_on){
    music_on = false;
    audio.currentTime=0;
    audio.pause();
    console.log(music_on);
  } else{
    music_on = true;
    console.log(music_on);
  }
}

function energyBarFadeIn(energy_level){
  if (energy_level > 400 && energy_level < 5000){
    var formula = 230 - (energy_level / 27.7);
    document.getElementById("progress_bar").style.backgroundColor = 'rgb(13,'+formula.toString() +',13)';
  }
  else if (energy_level >= 5000){
    document.getElementById("progress_bar").style.backgroundColor = 'rgb(13, 50 ,13)';
  }
}

function strat(Energie, Shield, cloak, tour){ 
/*1 er tour 0 0 100
  2eme tour 20 0 79
  3eme tour 20 0 77 --> Rush energie
  4eme tour 20 0 75 ... 2pts par tour
  ... eme tour 20 0 150 --> changement de stratégie PASSAGE A L'OFFENSIVE GUN MOD ACTIVATE + energie
  ... eme tour 0 20 150 --> Maintien du bouclier si energie supérieur a 75 sinon repassage en cloak
  --> Si l'energie est supérieur a 200 passage a 50 shield --> tire actif
  */

  if(tour == 1){
    strat_html                                                = "<tr><td id='first_round'>GOT TO 20 CLOAK 0 SHIELD</td></tr>";
    document.getElementById('strat').innerHTML                = strat_html;
  } else if(tour >= 2 && Energie < 150 && bool_strat){
    strat_html                                                = "<tr><td id='round'>STAY AT 20 OF CLOAK 0 OF SHIELD AND RUSH ENERGY</td></tr>" +strat_html;
    document.getElementById('strat').innerHTML                = strat_html;
    document.getElementById('first_round').style.borderColor  = "gray";
    bool_strat = false;
  }
}