(() => {
  const token = localStorage.getItem("jwt_token");
  const playerName = localStorage.getItem("playerName");

  if (!token || !playerName) {
      alert("Authentication required to play and save scores!");
      window.location.href = "../signin.html"; 
  }

  const BANK = {
    media: [
      { w: "the godfather", h: "The Corleone crime family saga." },
      { w: "pulp fiction", h: "Quentin Tarantino’s non-linear crime film." },
      { w: "the matrix", h: "Neo discovers reality is a simulation." },
      { w: "spirited away", h: "Studio Ghibli masterpiece about a bathhouse." },
      { w: "forrest gump", h: "A slow-witted man experiences historical events." },
      { w: "the shawshank redemption", h: "Wrongfully convicted man's hope in prison." },
      { w: "gladiator", h: "Roman general becomes a slave and fighter." },
      { w: "joker", h: "Origin story of Gotham’s clown prince." },
      { w: "shrek", h: "Ogre falls in love with a princess." },
      { w: "the lion king", h: "Simba becomes king of the Pride Lands." },
      { w: "avatar", h: "Blue aliens on the moon Pandora." },
      { w: "jurassic park", h: "Theme park with cloned dinosaurs." },
      { w: "star wars", h: "Jedi vs. Sith in a galaxy far away." },
      { w: "harry potter", h: "The boy who lived goes to Hogwarts." },
      { w: "lord of the rings", h: "A hobbit must destroy a powerful ring." },
      { w: "fight club", h: "Underground society with strict rules on talking." },
      { w: "the shining", h: "A writer goes mad in a haunted hotel." },
      { w: "psycho", h: "Alfred Hitchcock's thriller about a motel." },
      { w: "jaws", h: "A giant shark terrorizes a beach town." },
      { w: "back to the future", h: "Marty McFly travels in a DeLorean." },
      { w: "mad max", h: "High-octane car chases in a wasteland." },
      { w: "the simpsons", h: "Longest-running animated family sitcom." },
      { w: "south park", h: "Four boys in a Colorado mountain town." },
      { w: "friends", h: "Six people living in Manhattan." },
      { w: "seinfeld", h: "A classic show about nothing." },
      { w: "the sopranos", h: "Mob boss goes to therapy." },
      { w: "twin peaks", h: "Mystery about who killed Laura Palmer." },
      { w: "the witcher", h: "Geralt hunts monsters for coin." },
      { w: "the boys", h: "Corrupt superheroes vs. vigilantes." },
      { w: "naruto", h: "Ninja with a fox spirit inside." },
      { w: "demon slayer", h: "Tanjiro hunts demons to save his sister." },
      { w: "fullmetal alchemist", h: "Brothers use alchemy to find their bodies." },
      { w: "cowboy bebop", h: "Bounty hunters in space with jazz." },
      { w: "dragon ball z", h: "Goku defends Earth from powerful foes." },
      { w: "my hero academia", h: "School for aspiring superheroes." },
      { w: "bleach", h: "Ichigo becomes a Soul Reaper." },
      { w: "hunter x hunter", h: "Gon searches for his father." },
      { w: "death note", h: "Notebook that can kill whose name is written." },
      { w: "attack on titan", h: "Humans fight giant humanoid monsters." },
      { w: "one piece", h: "Pirates search for the ultimate treasure." },
      { w: "evangelion", h: "Teenagers pilot mechs to fight angels." },
      { w: "your name", h: "Two teens swap bodies across Japan." },
      { w: "akira", h: "Cyberpunk cult classic set in Neo-Tokyo." },
      { w: "ghost in the shell", h: "Cyborg policewoman hunts a hacker." },
      { w: "midsommar", h: "Cult horror set in sunny Sweden." },
      { w: "her", h: "Man falls in love with an AI." },
      { w: "get out", h: "Social horror about a weekend visit." },
      { w: "parasite", h: "Dark social commentary from South Korea." },
      { w: "the mandalorian", h: "Bounty hunter protects a green child." },
      { w: "black mirror", h: "Dystopian show about tech gone wrong." },
      { w: "squid game", h: "Deadly games played for prize money." },
      { w: "the last of us", h: "Survival story in a fungus apocalypse." },
      { w: "better call saul", h: "The legal trials of Jimmy McGill." },
      { w: "arcane", h: "Animated series based on League of Legends." },
      { w: "the crown", h: "Drama about the reign of Queen Elizabeth." },
      { w: "ted lasso", h: "American coach manages British football." },
      { w: "severance", h: "Work-life balance taken to a creepy extreme." },
      { w: "bojack horseman", h: "Former sitcom star who is also a horse." },
      { w: "rick and morty", h: "Interdimensional sci-fi chaos." },
      { w: "the office", h: "Mockumentary about a paper company." },
      { w: "interstellar", h: "Space travel through a wormhole." },
      { w: "inception", h: "Infiltrating dreams within dreams." },
      { w: "the dark knight", h: "Batman faces off against the Joker." },
      { w: "dune", h: "War over the spice on a desert planet." },
      { w: "whiplash", h: "Intense drama about a jazz drummer." },
      { w: "citizen kane", h: "Classic film about a media tycoon." },
      { w: "the truman show", h: "Man realizes his life is a TV set." },
      { w: "blade runner", h: "Detective hunts bioengineered replicants." },
      { w: "seven samurai", h: "Village hires warriors for protection." },
      { w: "spirited away", h: "Girl trapped in a world of spirits." },
      { w: "goodfellas", h: "Life in the mob based on a true story." },
      { w: "alien", h: "Terror on a commercial spaceship." },
      { w: "the silence of the lambs", h: "FBI trainee meets Hannibal Lecter." },
      { w: "titanic", h: "Tragic romance on a doomed ship." },
      { w: "spider man", h: "Teenager gains powers from a spider bite." },
      { w: "the avengers", h: "Superhero team defends the Earth." },
      { w: "the lion king", h: "Young lion claims his place as king." },
      { w: "frozen", h: "Princess with ice powers seeks her sister." },
      { w: "up", h: "Old man flies his house to South America." },
      { w: "ratatouille", h: "Rat becomes a chef in Paris." },
      { w: "wall-e", h: "Lonely robot cleans up a deserted Earth." },
      { w: "coco", h: "Boy visits the Land of the Dead." },
      { w: "the incredibles", h: "Family of undercover superheroes." },
      { w: "finding nemo", h: "Fish travels the ocean to find his son." },
      { w: "monsters inc", h: "Monsters collect screams for energy." },
      { w: "toy story", h: "Toys that come to life when kids leave." },
      { w: "cars", h: "Race car learns about life in a small town." },
      { w: "braveheart", h: "Scottish warrior leads a rebellion." },
      { w: "saving private ryan", h: "WWII mission to bring a soldier home." },
      { w: "the terminator", h: "Cyborg assassin sent from the future." },
      { w: "predator", h: "Elite team hunted by an alien warrior." },
      { w: "die hard", h: "Cop fights terrorists in a skyscraper." },
      { w: "rocky", h: "Underdog boxer gets a title shot." },
      { w: "top gun", h: "Elite fighter pilots in training." },
      { w: "indiana jones", h: "Archaeologist hunts for ancient relics." },
      { w: "ghostbusters", h: "Scientists start a spirit removal service." },
      { w: "the goonies", h: "Kids search for a pirate's treasure." },
      { w: "beetlejuice", h: "Ghost couple hires a bio-exorcist." },
      { w: "home alone", h: "Boy defends his house from burglars." },
      { w: "jurassic world", h: "New disaster at the dinosaur theme park." }
    ],
    tech: [
      { w: "graphics card", h: "Processes visual data for your monitor." },
      { w: "processor", h: "The brain of the computer (CPU)." },
      { w: "ethernet", h: "Wired connection for the internet." },
      { w: "artificial intelligence", h: "Machines mimicking human intelligence." },
      { w: "blockchain", h: "Decentralized ledger technology." },
      { w: "cryptocurrency", h: "Digital or virtual currency." },
      { w: "metaverse", h: "Shared virtual world environment." },
      { w: "pixel", h: "The smallest unit of a digital image." },
      { w: "algorithm", h: "Set of rules for a computer to follow." },
      { w: "cloud computing", h: "Storing data on remote servers." },
      { w: "firewall", h: "Network security system." },
      { w: "malware", h: "Software designed to harm a computer." },
      { w: "phishing", h: "Fraudulent emails seeking private info." },
      { w: "hard drive", h: "Long-term storage for computer data." },
      { w: "keyboard", h: "Input device used for typing." },
      { w: "monitor", h: "Screen used to display visual output." },
      { w: "mouse", h: "Handheld pointing device." },
      { w: "router", h: "Sends data between your network and internet." },
      { w: "bandwidth", h: "The capacity of a data connection." },
      { w: "python", h: "Popular high-level programming language." },
      { w: "javascript", h: "Language used for web interactivity." },
      { w: "typescript", h: "Strict syntactical superset of JavaScript." },
      { w: "html", h: "Markup language for creating web pages." },
      { w: "css", h: "Used for styling web documents." },
      { w: "react", h: "JavaScript library for building UIs." },
      { w: "database", h: "Organized collection of structured data." },
      { w: "encryption", h: "Converting data into secret code." },
      { w: "open source", h: "Software with publicly available code." },
      { w: "android", h: "Google’s mobile operating system." },
      { w: "iphone", h: "Apple’s flagship smartphone." },
      { w: "tesla", h: "Electric car and clean energy company." },
      { w: "spacex", h: "Private aerospace manufacturer." },
      { w: "virtual reality", h: "Simulated experience in a 3D world." },
      { w: "augmented reality", h: "Overlaying digital info on the real world." },
      { w: "raspberry pi", h: "Small, affordable single-board computer." },
      { w: "overclocking", h: "Running a component faster than its spec." },
      { w: "solid state drive", h: "Faster storage than a traditional HDD." },
      { w: "ram", h: "Temporary memory for active tasks." },
      { w: "bios", h: "Firmware used during computer startup." },
      { w: "kernel", h: "The core part of an operating system." },
      { w: "github", h: "Platform for hosting and sharing code." },
      { w: "docker", h: "Platform for containerizing applications." },
      { w: "kubernetes", h: "System for automating container scaling." },
      { w: "api", h: "Allows two applications to talk to each other." },
      { w: "json", h: "Lightweight data-interchange format." },
      { w: "markdown", h: "Simple markup language for text formatting." },
      { w: "visual studio code", h: "Popular code editor by Microsoft." },
      { w: "stack overflow", h: "Q&A site for programmers." },
      { w: "machine learning", h: "Computers learning from data patterns." },
      { w: "neural network", h: "Computing system inspired by the brain." },
      { w: "cybersecurity", h: "Protecting systems from digital attacks." },
      { w: "vpn", h: "Creates a secure connection over the internet." },
      { w: "bitrate", h: "The amount of data processed per second." },
      { w: "latency", h: "Delay before a transfer of data begins." },
      { w: "resolution", h: "Number of pixels on a display." },
      { w: "refresh rate", h: "How many times a screen updates per second." },
      { w: "supercomputer", h: "High-performance computing system." },
      { w: "quantum computing", h: "Uses subatomic particles for calculations." },
      { w: "semiconductor", h: "Material used to make microchips." },
      { w: "server", h: "Computer providing data to other computers." },
      { w: "nanotechnology", h: "Tech on a molecular or atomic scale." },
      { w: "broadband", h: "High-speed internet access." },
      { w: "fiber optics", h: "Uses light pulses to transmit data." },
      { w: "dark web", h: "Hidden part of the internet." },
      { w: "proxy", h: "Intermediate server between user and web." },
      { w: "firmware", h: "Permanent software programmed into hardware." },
      { w: "big data", h: "Extremely large sets of information." },
      { w: "iot", h: "The Internet of Things." },
      { w: "nft", h: "Non-fungible token." },
      { w: "stable diffusion", h: "AI model for generating images." },
      { w: "linux", h: "Open-source operating system." },
      { w: "windows", h: "Microsoft’s operating system." },
      { w: "bluetooth", h: "Short-range wireless technology." },
      { w: "motherboard", h: "Main circuit board of a computer." },
      { w: "playstation", h: "A popular Sony gaming console." },
      { w: "nintendo", h: "Gaming giant known for Mario." },
      { w: "discord", h: "Gaming-focused chat platform." },
      { w: "zoom", h: "Popular video conferencing tool." },
      { w: "slack", h: "Business communication platform." },
      { w: "shopify", h: "E-commerce platform for stores." },
      { w: "wordpress", h: "Popular content management system." },
      { w: "frontend", h: "Client-side of a website." },
      { w: "backend", h: "Server-side of a website." },
      { w: "full stack", h: "Developer who works on both ends." },
      { w: "debugging", h: "Finding and fixing code errors." },
      { w: "compiler", h: "Translates code into machine language." },
      { w: "mainframe", h: "Large computer for massive data processing." },
      { w: "peripherals", h: "External devices like printers or scanners." },
      { w: "encryption", h: "Securing data with coded keys." },
      { w: "cookies", h: "Small files tracking website data." },
      { w: "bandwidth", h: "Maximum rate of data transfer." },
      { w: "hotspot", h: "Physical location offering Wi-Fi." },
      { w: "cache", h: "Temporary storage for faster access." },
      { w: "mainframe", h: "High-capacity computer for organizations." },
      { w: "motherboard", h: "Heart of the computer hardware." },
      { w: "gigabyte", h: "Unit of digital information storage." },
      { w: "terabyte", h: "One thousand gigabytes." },
      { w: "mainframe", h: "Powerful server for large-scale tasks." },
      { w: "modem", h: "Connects your network to the ISP." },
      { w: "broadband", h: "High-speed data transmission." }
    ],
    biblical: [
      { w: "revelation", h: "The final book of the New Testament." },
      { w: "psalms", h: "A collection of sacred songs and poems." },
      { w: "proverbs", h: "Book of wise sayings and advice." },
      { w: "noahs ark", h: "Large boat built to survive the flood." },
      { w: "david and goliath", h: "Young shepherd defeats a giant." },
      { w: "the ten commandments", h: "Laws given to Moses on Mt. Sinai." },
      { w: "the last supper", h: "Jesus’ final meal with his apostles." },
      { w: "garden of eden", h: "The paradise where Adam and Eve lived." },
      { w: "the sermon on the mount", h: "Where Jesus gave the Beatitudes." },
      { w: "tower of babel", h: "Origin of different human languages." },
      { w: "cain and abel", h: "The story of the first two brothers." },
      { w: "sampson and delilah", h: "Strong man loses power via his hair." },
      { w: "parting of the red sea", h: "Miracle that allowed Israel to escape." },
      { w: "manna from heaven", h: "Food provided to Israelites in the desert." },
      { w: "the burning bush", h: "How God first spoke to Moses." },
      { w: "daniel in the lions den", h: "Faithful man survived being eaten." },
      { w: "the nativity", h: "The story of the birth of Jesus." },
      { w: "holy spirit", h: "The third person of the Trinity." },
      { w: "the prodigal son", h: "Parable of a father’s forgiveness." },
      { w: "jonah and the whale", h: "Prophet swallowed by a large fish." },
      { w: "job", h: "Man who remained faithful despite suffering." },
      { w: "solomon", h: "King known for his immense wisdom." },
      { w: "abraham", h: "The father of many nations." },
      { w: "jacobs ladder", h: "A dream of a staircase to heaven." },
      { w: "jericho", h: "City whose walls fell after trumpet blasts." },
      { w: "bethlehem", h: "The birthplace of Jesus." },
      { w: "nazareth", h: "The hometown of Jesus." },
      { w: "jerusalem", h: "The holy city and site of the Temple." },
      { w: "the beatitudes", h: "Blessings listed in the Sermon on the Mount." },
      { w: "armageddon", h: "The site of the final battle." },
      { w: "the four horsemen", h: "Symbols of conquest, war, famine, death." },
      { w: "john the baptist", h: "Preacher who baptized Jesus." },
      { w: "mary magdalene", h: "Follower of Jesus and witness to the tomb." },
      { w: "judas iscariot", h: "The disciple who betrayed Jesus." },
      { w: "pontius pilate", h: "Roman governor who ordered the crucifixion." },
      { w: "the crucifixion", h: "The execution of Jesus on the cross." },
      { w: "apostle paul", h: "Wrote many letters in the New Testament." },
      { w: "gospel of mark", h: "Shortest of the four Gospels." },
      { w: "gospel of luke", h: "Gospel written by a physician." },
      { w: "gospel of john", h: "Gospel focusing on Jesus’ divinity." },
      { w: "acts of the apostles", h: "History of the early church." },
      { w: "melchizedek", h: "Mysterious king and priest." },
      { w: "the golden calf", h: "Idol made by the Israelites." },
      { w: "sodom and gomorrah", h: "Cities destroyed for their wickedness." },
      { w: "lot’s wife", h: "Turned into a pillar of salt." },
      { w: "the ark of the covenant", h: "Chest containing the stone tablets." },
      { w: "tabernacle", h: "Portable dwelling place for God’s presence." },
      { w: "leviticus", h: "Book detailing laws and rituals." },
      { w: "deuteronomy", h: "Moses’ final speeches to Israel." },
      { w: "esther", h: "Queen who saved her people from Haman." },
      { w: "ruth", h: "Moabite woman who remained loyal to Naomi." },
      { w: "isaiah", h: "Major prophet who foretold the Messiah." },
      { w: "jeremiah", h: "The weeping prophet." },
      { w: "ezekiel", h: "Prophet who saw a valley of dry bones." },
      { w: "the valley of death", h: "Famous imagery from Psalm 23." },
      { w: "lords prayer", h: "The prayer Jesus taught his disciples." },
      { w: "baptism", h: "Ritual of purification with water." },
      { w: "communion", h: "Christian rite involving bread and wine." },
      { w: "parable", h: "A simple story used to illustrate a moral." },
      { w: "the great commission", h: "Instruction to spread the Gospel." },
      { w: "genesis", h: "The first book of the Bible." },
      { w: "exodus", h: "Moses leads Israel out of Egypt." },
      { w: "good samaritan", h: "Parable about loving your neighbor." },
      { w: "water into wine", h: "Jesus’ first miracle at Cana." },
      { w: "resurrection", h: "Jesus rose from the dead." },
      { w: "pentecost", h: "Descending of the Holy Spirit on the apostles." },
      { w: "mount sinai", h: "Where Moses received the Law." },
      { w: "the garden of gethsemane", h: "Where Jesus prayed before his arrest." },
      { w: "zacchaeus", h: "The short tax collector who climbed a tree." },
      { w: "the transfiguration", h: "Jesus shines with divine glory on a mountain." },
      { w: "nehemiah", h: "He led the rebuilding of Jerusalem's walls." },
      { w: "elijah", h: "Prophet taken to heaven in a whirlwind." },
      { w: "elisha", h: "Prophet who received a double portion of Elijah's spirit." },
      { w: "hezekiah", h: "Faithful king who prayed for deliverance from Assyria." },
      { w: "josiah", h: "The boy king who rediscovered the Book of the Law." },
      { w: "gideon", h: "Judge who defeated an army with only 300 men." },
      { w: "deborah", h: "Prophetess and the only female judge of Israel." },
      { w: "joshua", h: "Leader who took the Israelites into the Promised Land." },
      { w: "balaam’s donkey", h: "Animal that spoke to warn its owner." },
      { w: "shadrach meshach and abednego", h: "Three men who survived the fiery furnace." },
      { w: "the wall of jericho", h: "Fortification that crumbled after a shout." },
      { w: "lazarus", h: "Friend of Jesus raised from the dead." },
      { w: "nicodemus", h: "Pharisee who visited Jesus at night." },
      { w: "stephen", h: "The first Christian martyr." },
      { w: "cornelius", h: "The first Gentile convert to Christianity." },
      { w: "philip and the eunuch", h: "Apostle who explained Isaiah in a chariot." },
      { w: "the conversion of saul", h: "Blinding light on the road to Damascus." },
      { w: "the fruit of the spirit", h: "Qualities like love, joy, and peace." },
      { w: "the armor of god", h: "Spiritual metaphors for defense and truth." },
      { w: "the rainbow", h: "God's sign that he would never flood the earth again." },
      { w: "the tree of life", h: "Tree in Eden and the New Jerusalem." },
      { w: "the bread of life", h: "Jesus’ metaphor for himself." },
      { w: "the light of the world", h: "Jesus’ description of his mission." },
      { w: "the way the truth and the life", h: "Jesus’ declaration of exclusivity." },
      { w: "the narrow gate", h: "Metaphor for the difficult path to life." },
      { w: "the wise and foolish builders", h: "Parable about building on rock vs. sand." },
      { w: "the sower and the seed", h: "Parable about how hearts receive the Word." },
      { w: "the mustard seed", h: "Smallest seed representing the Kingdom." },
      { w: "the pearl of great price", h: "Parable about the value of the Kingdom." },
      { w: "the lost sheep", h: "Parable about God seeking one individual." }
    ],
  };

  const modeSel = document.getElementById("mode");
  const diffSel = document.getElementById("difficulty");
  const catSel  = document.getElementById("category");
  const newGameBtn = document.getElementById("newGameBtn");
  const resetHistoryBtn = document.getElementById("resetHistoryBtn");

  const hintBtn = document.getElementById("hintBtn");
  const hintEl = document.getElementById("hint");
  const p1Label = document.getElementById("p1Label");
  const p2Label = document.getElementById("p2Label");
  const p1ScoreEl = document.getElementById("p1Score");

  const p2ScoreEl = document.getElementById("p2Score");
  const livesEl = document.getElementById("lives");
  const statusEl = document.getElementById("status");
  const wordEl = document.getElementById("word");
  const usedEl = document.getElementById("usedLetters");

  const logEl = document.getElementById("log");
  const guessInput = document.getElementById("guessInput");
  const guessBtn = document.getElementById("guessBtn");
  const skipBtn = document.getElementById("skipBtn");

  const canvas = document.getElementById("hangCanvas");
  const ctx = canvas.getContext("2d");
  const flash = document.getElementById("flash");
  const historyEl = document.getElementById("history");

  const DIFF_LIVES = { easy: 10, normal: 8, hard: 6 };

  let mode = "pvp"; 
  let maxLives = 8;
  let lives = 8;
  let p1 = { name: "Player 1", score: 0 };
  let p2 = { name: "Player 2", score: 0 };
  let turn = 1; 
  let secret = "";
  let hint = "";
  let used = []; 
  let revealed = []; 
  let gameOver = false;

  function revealOne(letter){
    letter = letter.toLowerCase();
    for (let i = 0; i < secret.length; i++){
      if (!revealed[i] && secret[i] === letter){
        revealed[i] = true;
        return true; 
      }
    }
    return false; 
  }

  function wordSolved(){
    for (let i = 0; i < secret.length; i++){
      if (secret[i] === " ") continue;
      if (!revealed[i]) return false;
    }
    return true;
  }

  function currentMasked(){
    let out = "";
    for (let i = 0; i < secret.length; i++){
      const ch = secret[i];
      if (ch === " ") out += "   ";
      else out += (revealed[i] ? ch.toUpperCase() : "_") + " ";
    }
    return out.trimEnd();
  }

  function setStatus(s){ statusEl.textContent = `Status: ${s}`; }

  function flashFX(type){
    flash.classList.remove("good","bad");
    flash.classList.add(type === "good" ? "good" : "bad");
    setTimeout(() => flash.classList.remove("good","bad"), 180);
  }

  function setHUD(){
    p1Label.textContent = p1.name;
    p2Label.textContent = mode === "cpu" ? "CPU" : p2.name;
    p1ScoreEl.textContent = String(p1.score);
    p2ScoreEl.textContent = String(p2.score);
    livesEl.textContent = String(lives);
    wordEl.textContent = currentMasked();
    usedEl.textContent = used.length ? used.join(" ") : "—";
  }

  function clearCanvas(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

  function drawBase(){
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#ffffff";
    for (let x=0; x<canvas.width; x+=24){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for (let y=0; y<canvas.height; y+=24){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.beginPath(); ctx.moveTo(90,320); ctx.lineTo(270,320); ctx.stroke();      
    ctx.beginPath(); ctx.moveTo(140,320); ctx.lineTo(140,70); ctx.stroke();      
    ctx.beginPath(); ctx.moveTo(140,70);  ctx.lineTo(320,70); ctx.stroke();      
    ctx.beginPath(); ctx.moveTo(320,70);  ctx.lineTo(320,110); ctx.stroke();     
    ctx.restore();
  }

  function drawHangmanParts(wrong){
    const parts = 6;
    const progress = Math.min(parts, Math.round((wrong / maxLives) * parts));
    ctx.save();
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,.78)";
    if (progress >= 1){ ctx.beginPath(); ctx.arc(320,145,32,0,Math.PI*2); ctx.stroke(); }
    if (progress >= 2){ ctx.beginPath(); ctx.moveTo(320,178); ctx.lineTo(320,255); ctx.stroke(); }
    if (progress >= 3){ ctx.beginPath(); ctx.moveTo(320,200); ctx.lineTo(285,228); ctx.stroke(); }
    if (progress >= 4){ ctx.beginPath(); ctx.moveTo(320,200); ctx.lineTo(355,228); ctx.stroke(); }
    if (progress >= 5){ ctx.beginPath(); ctx.moveTo(320,255); ctx.lineTo(290,300); ctx.stroke(); }
    if (progress >= 6){ ctx.beginPath(); ctx.moveTo(320,255); ctx.lineTo(350,300); ctx.stroke(); }
    ctx.restore();
  }

  function redrawCanvas(){
    clearCanvas(); drawBase();
    const wrong = maxLives - lives;
    drawHangmanParts(wrong);
  }

  const HISTORY_KEY = "hangman_history_v1";
  function loadHistory(){ try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } }
  function saveHistory(items){ localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20))); }
  function addHistory(result){
    const items = loadHistory(); items.unshift(result);
    saveHistory(items); renderHistory();
  }
  function renderHistory(){
    const items = loadHistory();
    historyEl.innerHTML = items.length ? "" : `<div class="history-item">No matches yet.</div>`;
    for (const it of items){
      const div = document.createElement("div"); div.className = "history-item";
      div.innerHTML = `<div><strong>${it.winner}</strong> won • <span class="small">${it.mode} • ${it.diff} • ${it.category}</span></div>
        <div class="small">Word: <span style="opacity:.9">${it.word}</span> • Score: ${it.p1} - ${it.p2}</div>`;
      historyEl.appendChild(div);
    }
  }

  function pickWord(category){
    const arr = BANK[category] || BANK.media;
    const pick = arr[Math.floor(Math.random() * arr.length)];
    return { word: pick.w.toLowerCase(), hint: pick.h };
  }

  function promptNames() {
    p1.name = localStorage.getItem("playerName") || "Kani";
    const modeValue = modeSel.value.toLowerCase();
    if (modeValue === "cpu" || modeValue === "ranked") {
      p2.name = modeValue === "cpu" ? "CPU" : "Ranked"; 
      return;
    }
    p2.name = (prompt("Enter Player 2 name:", "Player 2") || "").trim() || "Player 2";
  }

  function setupNextWord() {
    used = [];
    hintEl.hidden = true;
    hintEl.textContent = "";
    const { word, hint: h } = pickWord(catSel.value);
    secret = word;
    hint = h;
    revealed = new Array(secret.length).fill(false);
    for (let i=0; i<secret.length; i++){ if (secret[i] === " ") revealed[i] = true; }
    setHUD();
    redrawCanvas();
    guessInput.value = "";
    guessInput.focus();
  }

  function startNewGame(){
    mode = modeSel.value;
    maxLives = DIFF_LIVES[diffSel.value] ?? 8;
    lives = maxLives;
    p1.score = 0; p2.score = 0;
    turn = 1; gameOver = false;
    promptNames();
    logEl.textContent = "Battle log will appear here…";
    setupNextWord();
    setStatus(`${p1.name}'s turn — guess a letter`);
  }

  function currentPlayer(){ return turn === 1 ? p1 : p2; }
  function otherPlayer(){ return turn === 1 ? p2 : p1; }

  function switchTurn(){
    if (mode === "cpu" || mode === "ranked"){ turn = 1; return; }
    turn = (turn === 1 ? 2 : 1);
  }

  function endGame(winnerName){
    gameOver = true;
    setStatus(`Game Over — Winner: ${winnerName}`);
    logEl.innerHTML = `<a href="../leaderboard.html" style="color: #a78bfa; text-decoration: underline; font-weight: bold;">Check your Global Rank here!</a>\n` + logEl.innerHTML;
    addHistory({
      winner: winnerName,
      mode: mode.toUpperCase(),
      diff: diffSel.value,
      category: catSel.value,
      word: secret,
      p1: p1.score,
      p2: p2.score
    });

   if (mode === "ranked" && p1.name === localStorage.getItem("playerName")) {
        setStatus(`Game Over. Syncing score of ${p1.score}...`);
        submitHangmanScore(p1.score);
    }
  }

  function scoreCorrect(pl){ /* No points for individual letters anymore */ }
  function scoreWrong(pl){ /* No penalties for individual letters anymore */ }
  
  function scoreWinWord(pl){
    const letterCount = secret.replace(/\s/g, "").length;
    pl.score += letterCount;
  }

  const FREQ = "etaoinshrdlcumwfgypbvkjxqz".split("");
  function cpuGuess(){
    const available = FREQ.filter(ch => !used.includes(ch.toUpperCase()));
    if (diffSel.value === "hard"){
      const candidates = [];
      for (const ch of FREQ){ if (secret.includes(ch) && !used.includes(ch.toUpperCase())) candidates.push(ch); }
      if (candidates.length && Math.random() < 0.75) return candidates[Math.floor(Math.random() * candidates.length)];
    }
    if (diffSel.value === "normal") return available[Math.floor(Math.random() * Math.min(10, available.length))];
    const a = "abcdefghijklmnopqrstuvwxyz";
    return a[Math.floor(Math.random()*a.length)];
  }

  function revealWouldWork(letter){
    letter = letter.toLowerCase();
    for (let i = 0; i < secret.length; i++){ if (!revealed[i] && secret[i] === letter) return true; }
    return false;
  }

  function applyGuess(letter, byCPU = false){
    if (gameOver) return;
    letter = (letter || "").toLowerCase();
    if (!/^[a-z]$/.test(letter)){ if (!byCPU) setStatus("Type ONE letter (A-Z)"); return; }

    const pl = currentPlayer();
    used.push(letter.toUpperCase());
    const hit = revealOne(letter);

    if (hit){
      flashFX("good");
      logEl.textContent = `${pl.name} guessed: ${letter.toUpperCase()} ✅\n` + logEl.textContent;
      setStatus(`${pl.name} got a letter!`);
    } else {
      flashFX("bad");
      lives -= 1;
      logEl.textContent = `${pl.name} guessed: ${letter.toUpperCase()} ❌ (Lives -1)\n` + logEl.textContent;
      setStatus(`${pl.name} missed.`);
    }

    setHUD();
    redrawCanvas();

    if (wordSolved()){
      const pointsAdded = secret.replace(/\s/g, "").length;
      scoreWinWord(pl);
      setHUD();
      
      if (mode === "ranked") {
          logEl.textContent = `🎯 WORD SOLVED! (+${pointsAdded} pts). Loading next word...\n` + logEl.textContent;
          setStatus("Correct! Moving to next word...");
          setTimeout(() => {
              if (!gameOver) setupNextWord();
          }, 1000);
          return;
      } else {
          setStatus(`${pl.name} won! (+${pointsAdded})`);
          endGame(pl.name);
          return;
      }
    }

    if (lives <= 0){
      const winner = (p1.score === p2.score) ? "Draw" : (p1.score > p2.score ? p1.name : (mode === "cpu" ? "CPU" : p2.name));
      setStatus(`Out of lives! Word was: ${secret}`);
      endGame(winner);
      return;
    }

    if (mode === "cpu" && !byCPU){
      turn = 2; setHUD(); setStatus("CPU is thinking…");
      setTimeout(() => {
        applyGuess(cpuGuess(), true);
        turn = 1; setHUD();
        if (!gameOver) setStatus(`${p1.name}'s turn — guess a letter`);
      }, 450);
      return;
    }

    if (mode !== "ranked") switchTurn();
    setHUD();
    if (!gameOver) setStatus(`${currentPlayer().name}'s turn — guess a letter`);
  }

  function skipTurn(){
    if (gameOver || mode === "cpu" || mode === "ranked") return;
    switchTurn(); setHUD();
    setStatus(`${currentPlayer().name}'s turn — guess a letter`);
  }

  function showHint(){
    if (gameOver) return;
    const pl = currentPlayer();
    pl.score = Math.max(0, pl.score - 5);
    hintEl.hidden = false;
    hintEl.textContent = `HINT: ${hint}`;
    setHUD();
    setStatus(`${pl.name} used a hint (-5)`);
  }

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--mx", `${x}%`);
    document.documentElement.style.setProperty("--my", `${y}%`);
  }, { passive: true });

  newGameBtn.addEventListener("click", startNewGame);
  hintBtn.addEventListener("click", showHint);
  resetHistoryBtn.addEventListener("click", () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); });
  modeSel.addEventListener("change", () => { mode = modeSel.value; if (mode === "cpu") p2.name = "CPU"; setHUD(); });
  guessBtn.addEventListener("click", () => { const v = guessInput.value.trim(); guessInput.value = ""; guessInput.focus(); applyGuess(v); });
  guessInput.addEventListener("keydown", (e) => { if (e.key === "Enter"){ e.preventDefault(); guessBtn.click(); } });
  skipBtn.addEventListener("click", skipTurn);

  renderHistory(); redrawCanvas(); setHUD();
})();

async function submitHangmanScore(finalScore) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return; 
    try {
        await fetch('https://kani-game-center-api.onrender.com/api/game/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ Points: finalScore })
        });
        console.log("Hangman score synced to Render!");
    } catch (err) {
        console.error("Hangman API Sync failed:", err);
    }
}