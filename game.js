// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

// The player class used in this program
function Player() {
	this.name = name;
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
    var verticalPlatforms = svgdoc.getElementById("verticalPlatform");
    //if player is on the platform, move player
    var verticalPlatformsSpeed = parseInt(verticalPlatforms.getAttribute("speed"));
    if(parseInt(verticalPlatforms.getAttribute("y")) == player.position.y + PLAYER_SIZE.h
        && player.position.x + PLAYER_SIZE.w > parseInt(verticalPlatforms.getAttribute("x"))
        && player.position.x < parseInt(verticalPlatforms.getAttribute("x")) + parseInt(verticalPlatforms.getAttribute("width")) ){

        player.position.y += verticalPlatformsSpeed;
    }

    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");

}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}

//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player
var EXIT_SIZE = new Size(60, 60);

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The size of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
var MAX_BULLET = 8;							//  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The size of the monster
var DBALL_SIZE = new Size(30,30);
var GOOD_THING_SIZE = new Size(10, 10);
var DEFAULT_TIME_LEFT = 120;

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var flip = false;							// Direction of the player
var name = "Anonymous";
var nameTag = null;
var zoomMode = false;
var goodstuff = 8;
var monsternum = 1;
var level = 0;
var timeLeft = 0;
var timeLeftTimer = null;
var previousName = "";
var cheatMode = false;
var dissPlat1 = null;
var dissPlat2 = null;
var dissPlat3 = null;


bgm = new Audio("ChillingMusic.wav");
bgm.addEventListener("ended", function() {
	    this.play();
	}, false);


//
// The load function for the SVG document
//
function load(evt) {
	
	name = name;
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);
    
    //Play background music
    bgm.play();

}

function startGame(){

    clearInterval(gameInterval);
    clearInterval(timeLeftTimer);

	cleanUpGroup("player_name", false);
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("dballs", false);

	svgdoc.getElementById("cheat").style.setProperty("visibility", "hidden", null);
	svgdoc.getElementById("numBull").style.setProperty("visibility", "visible", null);

	level++;
	cheatMode = false;
	svgdoc.getElementById("level").firstChild.data = level;
	goodstuff = 8;
	monsternum = level;
    player = new Player();
    player.bullet = MAX_BULLET;
    svgdoc.getElementById("numBull").firstChild.data = player.bullet;
	timeLeft = DEFAULT_TIME_LEFT;
	// Create the DragonBalls
	for(var i=0; i<8 ; ++i)
		createDball();
		
    // Create the monsters
    for(i=0;i<level+5;i++)
		createMonster();

    svgdoc.getElementById("verticalPlatform").setAttribute("speed",2);
    var platforms = svgdoc.getElementById("platforms");

    var dissPlat1 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
	dissPlat1.setAttribute("x", 0);
	dissPlat1.setAttribute("y", 240);
	dissPlat1.setAttribute("width", 40);
	dissPlat1.setAttribute("height", 20);
	dissPlat1.setAttribute("type", "disappearing");
    dissPlat1.setAttribute("opacity", 1);
	dissPlat1.setAttribute("style", "fill:black;");
    platforms.appendChild(dissPlat1);
    var dissPlat2 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
	dissPlat2.setAttribute("x", 40);
	dissPlat2.setAttribute("y", 360);
	dissPlat2.setAttribute("width", 80);
	dissPlat2.setAttribute("height", 20);
	dissPlat2.setAttribute("type", "disappearing");
    dissPlat2.setAttribute("opacity", 1);
	dissPlat2.setAttribute("style", "fill:black;");
    platforms.appendChild(dissPlat2);
    var dissPlat3 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
	dissPlat3.setAttribute("x", 200);
	dissPlat3.setAttribute("y", 180);
	dissPlat3.setAttribute("width", 60);
	dissPlat3.setAttribute("height", 20);
	dissPlat3.setAttribute("type", "disappearing");
    dissPlat3.setAttribute("opacity", 1);
	dissPlat3.setAttribute("style", "fill:black;");
    platforms.appendChild(dissPlat3);

	
	// Create the exit
	createExit();
	
	// Countdown timer
    timeLeftTimer = setInterval("timing()", 1000);
	
    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
}

//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

//
// This function creates the monsters in the game
//
function createMonster() {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    var monPos = new Point(Math.random()*500, Math.random()*350);
    
    monster.setAttribute("x", monPos.x);
    monster.setAttribute("y", monPos.y);
    
    //set moving destination
    var monsterFinalPos = new Point(Math.floor(Math.random()*520+40), Math.floor(Math.random()*480)+40);
    //avoid running to player start place
    while(intersect( monPos, new Size(160,160), player.position, PLAYER_SIZE))
        monsterFinalPos = new Point(Math.floor(Math.random()*520+50), Math.floor(Math.random()*480)+20);

    monster.setAttribute("Dx", monsterFinalPos.x);
    monster.setAttribute("Dy", monsterFinalPos.y);

    monster.setAttribute("flip", monsterFinalPos.x - monPos.x <0? 1:0);

    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);

}

//
// This function shoots a bullet from the player
//
function shootBullet() {
	
	if(cheatMode)
		player.bullet++;
	
	if(player.bullet <= 0)
		return;
	player.bullet--;
	var pew = new Audio("shoot.wav");
	pew.play();

    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    if (flip){
    	bullet.setAttribute("speed",-BULLET_SPEED);
    }
    else
    	bullet.setAttribute("speed", BULLET_SPEED);

    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    svgdoc.getElementById("bullets").appendChild(bullet);
	svgdoc.getElementById("numBull").firstChild.data = player.bullet;

}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();
	
    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            break;
			
        case "Z".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
        case 32:
            if (canShoot) shootBullet();
            break;
		case "C".charCodeAt(0):
        	cheatMode = true;
			svgdoc.getElementById("cheat").style.setProperty("visibility", "visible", null);
			svgdoc.getElementById("numBull").style.setProperty("visibility", "hidden", null);
            break;
    	case "V".charCodeAt(0):
        	cheatMode = false;
			svgdoc.getElementById("cheat").style.setProperty("visibility", "hidden", null);
			svgdoc.getElementById("numBull").style.setProperty("visibility", "visible", null);
            break;


    }
}

//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

//
// This function checks collision
//
function collisionDetection() {

	// First portal
	if(intersect(new Point(590,0),new Size(10,40), player.position, PLAYER_SIZE))
    {
    	player.position.x = 15;
    	player.position.y = 260;
    	player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }
    
    //second portal
	if(intersect(new Point(0,260),new Size(10,40), player.position, PLAYER_SIZE))
    {
    	player.position.x = 550;
    	player.position.y = 0;
    	player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }

    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));
		if (!cheatMode){
        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
			goodGame();
            return;
        }
        }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                var die = new Audio("terminated.wav");
				die.play();

            	monsternum--;
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;

				if(zoomMode){
					score += 20;
				}
				else{
                	score += 10;
            	}
                svgdoc.getElementById("score").firstChild.data = score;
            }
        }
    }
    // Check whether good things are collected
    var goodthings = svgdoc.getElementById("dballs");
    for (var i = 0; i < goodthings.childNodes.length; i++) {
    	var goodthing = goodthings.childNodes.item(i);
    	var x = parseInt(goodthing.getAttribute("x"));
    	var y = parseInt(goodthing.getAttribute("y"));

    	if (intersect(new Point(x, y), GOOD_THING_SIZE, player.position, PLAYER_SIZE)) {
    		goodthings.removeChild(goodthing);
    		i--;
    		if(zoomMode){
            	score += 30;
            }
            else{
            	score += 10;
            }
            goodstuff--;
            svgdoc.getElementById("score").firstChild.data = score;
    	}
    }
	// Check if player can enter the door to exit
	var doors = svgdoc.getElementById("exit_here");
    if (goodstuff <= 0){//&& monsternum <= 0){
        for (var i = 0; i < doors.childNodes.length; i++) {
        	var door = doors.childNodes.item(i);
        	var x = parseInt(door.getAttribute("x"));
    		var y = parseInt(door.getAttribute("y"));
        	if(intersect(new Point(x, y), EXIT_SIZE, player.position, PLAYER_SIZE)) {
        	    score = score + level * 100 + timeLeft;
        	    var goal = new Audio("lets_rock.wav");
				goal.play();
        		startGame();
        	}
    	}
    }
}

//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x",parseInt(node.getAttribute("x")) + parseInt(node.getAttribute("speed")));

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            bullets.removeChild(node);
            i--;
        }
    }
}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();
    
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();
    var position = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT){
    	flip = true;
    	player.node.setAttribute("transform","translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)");
        displacement.x = -MOVE_DISPLACEMENT;
        direction = 1;
    }
    if (player.motion == motionType.RIGHT){
    	flip = false;
        displacement.x = MOVE_DISPLACEMENT;
    	direction = 2;
    }

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;
    
    var platforms = svgdoc.getElementById("platforms");
    if(isOnPlatform && platforms.childNodes.length > 0){
        for (var i = 0; i < platforms.childNodes.length; i++) {
            var platform = platforms.childNodes.item(i);
            if (platform.getAttribute("type") == "disappearing") {
            	if((parseInt(platform.getAttribute("y")) == (player.position.y + PLAYER_SIZE.h))
                    && ((player.position.x + PLAYER_SIZE.w) > parseInt(platform.getAttribute("x")))
                    && (player.position.x < (parseInt(platform.getAttribute("x")) + parseInt(platform.getAttribute("width"))))){
                    var platformOpacity = parseFloat((platform.getAttribute("opacity")*10 - 1)/10);
                    platform.setAttribute("opacity",platformOpacity);
                    if( parseFloat(platform.getAttribute("opacity"))== 0)
                        platforms.removeChild(platform);
                }
            }
        }
    }


    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
	
	// Move the monsters
	moveMonsters();
	
    // Move the bullets
    moveBullets();

    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {

    var verticalPlatforms = svgdoc.getElementById("verticalPlatform");
    if(parseInt(verticalPlatforms.getAttribute("y")) == 450 )
        verticalPlatforms.setAttribute("speed", -2 );
    else if(parseInt(verticalPlatforms.getAttribute("y")) == 50)
        verticalPlatforms.setAttribute("speed", 2 );
    verticalPlatforms.setAttribute("y", parseInt(verticalPlatforms.getAttribute("speed")) + parseInt(verticalPlatforms.getAttribute("y")) );

    // Transform the player
    if(flip){
        player.node.setAttribute("transform","translate(" + (player.position.x + PLAYER_SIZE.w)  + "," + player.position.y + ") scale(-1, 1)");
	}
	else
		player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
	
	//Display player name
	if (nameTag != null){
		nameTag.setAttribute("x", player.position.x + 15);
    	nameTag.setAttribute("y", player.position.y - 5);
    }
    
	//Calculate the scaling and translation factors	
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
	//Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}

//
// This function sets the zoom level to 2
//
function setZoom() {
    startGame();
	zoomMode = true;
    zoom = 2.0;
    insertName();
}

function defaultZoom() {
	startGame();
	zoomMode = false;
	zoom = 1.0;
	insertName();
}

function insertName(){
    name = prompt("Please enter your name ",previousName);
    if(name.length == 0 || name == null || name == "")
        name = "Anonymous";
    previousName = name;
	svgdoc.getElementById("name_value").firstChild.data = name;
    nameTag = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    nameTag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#name");
    svgdoc.getElementById("player_name").appendChild(nameTag);
    nameTag.setAttribute("x", player.position.x);
    nameTag.setAttribute("y", player.position.y - 5);

}

function createDball(){
    var dball = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

    var dballPos ;
    var find = false;
    var platforms = svgdoc.getElementById("platforms");

    while(!find){
        find = true;
        dballPos = new Point(Math.random()*560, Math.random()*520);

        //check collision with platform
        for (var i = 0; i < platforms.childNodes.length; i++) {
            var node = platforms.childNodes.item(i);
            if (node.nodeName != "rect") continue;

            var x = parseFloat(node.getAttribute("x"));
            var y = parseFloat(node.getAttribute("y"));
            var w = parseFloat(node.getAttribute("width"));
            var h = parseFloat(node.getAttribute("height"));
            var pos = new Point(x, y);
            var size = new Size(w, h);
            if (intersect(dballPos, new Size(30,30), pos, size)) {
                find = false
                break;
            }
        }
    }

    dball.setAttribute("x", dballPos.x);
    dball.setAttribute("y", dballPos.y);

    dball.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#dball");
    svgdoc.getElementById("dballs").appendChild(dball);

}

function goodGame(){
	bgm.pause();
	bgm.currentTime = 0;
	var dead = new Audio("game_over.wav");
	dead.play();

	// Clear the game interval
	clearInterval(gameInterval);
	// Clear the timer
	clearInterval(timeLeftTimer);

	// Get the high score table from cookies
	table = getHighScoreTable();
	
	// Create the new score record
	//var name = prompt("What is your name?", "");
	var record = new ScoreRecord(name, score);
	
	// Insert the new score record
	var pos = table.length;
	for (var i = 0; i < table.length; i++) {
	if (record.score > table[i].score) {
		pos = i;
		break;
		}
	}
	table.splice(pos, 0, record);
	
	// Store the new high score table
	setHighScoreTable(table);

    // Show the high score table
    showHighScoreTable(table);
}

function createExit(){
	var exit = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	exit.setAttribute("x", 20);
	exit.setAttribute("y", 25);
	exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
	svgdoc.getElementById("exit_here").appendChild(exit);
}

function timing() {
	timeLeft--;
	svgdoc.getElementById("time_left").firstChild.data = timeLeft;
	if(timeLeft <= 0)
		goodGame();
}

function moveMonsters(){

    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monNode = monsters.childNodes.item(i);

        if(parseInt(monNode.getAttribute("x")) == parseInt(monNode.getAttribute("Dx")) && parseInt(monNode.getAttribute("y"))  == parseInt(monNode.getAttribute("Dy")) ){

            var monsterFinalPos = new Point(Math.floor(Math.random()*500), Math.floor(Math.random()*350));
            monNode.setAttribute("Dx", monsterFinalPos.x);
            monNode.setAttribute("Dy", monsterFinalPos.y);

            var check = monsterFinalPos.x - parseInt(monNode.getAttribute("x")) <0? 1:0;
            if(check != parseInt(monNode.getAttribute("flip"))){
                monNode.setAttribute("flip",check);
            }
        }
        else if( parseInt(monNode.getAttribute("x"))== parseInt(monNode.getAttribute("Dx")) && parseInt(monNode.getAttribute("y"))  != parseInt(monNode.getAttribute("Dy")) ){
            var y_displacement = 1;
            if(parseInt(monNode.getAttribute("y")) > parseInt(monNode.getAttribute("Dy")))
                y_displacement *= -1;
            monNode.setAttribute("y", parseInt(monNode.getAttribute("y")) + y_displacement);
        }
        else if( parseInt(monNode.getAttribute("x"))!= parseInt(monNode.getAttribute("Dx")) && parseInt(monNode.getAttribute("y"))  == parseInt(monNode.getAttribute("Dy")) ){
            var x_displacement = 1;
            if(parseInt(monNode.getAttribute("flip")))
                x_displacement *= -1;
            monNode.setAttribute("x", parseInt(monNode.getAttribute("x")) + x_displacement);
        }
        else{
            var y_displacement = 1;
            if(parseInt(monNode.getAttribute("y")) > parseInt(monNode.getAttribute("Dy")))
                y_displacement *= -1;
            monNode.setAttribute("y", parseInt(monNode.getAttribute("y")) + y_displacement);

            var x_displacement = 1;
            if(parseInt(monNode.getAttribute("flip")))
                x_displacement *= -1;
            monNode.setAttribute("x", parseInt(monNode.getAttribute("x")) + x_displacement);

        }
    }
}

function replay(){
    cleanUpGroup("player_name", false);
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("highscoretext", false);
    
	svgdoc.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
	level=0;
	score=0;
	cheatMode = false;
	svgdoc.getElementById("score").firstChild.data = score;

	if (zoomMode)
		setZoom();
	else
		defaultZoom();
		
}
