// REPLICATE
const replicateProxy = "https://replicate-api-proxy.glitch.me"

let imageData; // for storing image of stew
let stewNameData; // stores "name" of stew
let resulting_text;
let userName = "guest"

let emojiSize = 64;

// This sets up all the neccesary information to connect to FireBase.21
const firebaseConfig = {
  apiKey: "AIzaSyDXX9CGbVzuoHtLyRaibXxXDDh75gSZDQ4",
  authDomain: "class-test-791e9.firebaseapp.com",
  projectId: "class-test-791e9",
  storageBucket: "class-test-791e9.appspot.com",
  messagingSenderId: "616586933931",
  appId: "1:616586933931:web:88f2124257bc581105e9ee",
  measurementId: "G-MQ8HZC9DFG"
};

// GROUP: Folder that data is stored in
// typeOfThing: Subfolder that data is stored in.

let group = "perpetualstew";
let typeOfThing = "foodItems";

// db: for later use in database
let db;
let strokeDots = [];
let allStrokesLocal = {};

function setup() {
  let mo = month();
  let d = day();
  let h = hour();
  let m = minute();
  let s = second();
  let currentTimeString;
  


  createCanvas(windowWidth, windowHeight);
  
  
  
  connectToFirebase();
  resulting_text = "";
  
  let ingredientListRaw = "";
  for (var key in allStrokesLocal) {
    let thisItem = allStrokesLocal[key];
    if (currentTimeInMins < thisItem.ExpireTime) {
      ingredientListRaw +=thisItem.Foodname + ", ";    
    }
  }
  
  askForWords("Return a creative name for a soup that is made of:" + ingredientListRaw + " Only return three to six words and NOTHING else. Do not say sure! or any filler words. simply return the name of the soup. also return it in quotes. Do not repeat answers. The name MUST relate to the ingredients provided, and cannot include the names of ingredients not found in the ingredient list");

  let stewPrompt = "An centered overhead view of a singular blue bowl of stew,  made of these ingredients: " + ingredientListRaw;
  
  
  addIngredientUI();
  addUsernameUI();
  //screenshot
  let screenshotButton = createButton("Take a Picture!");
  screenshotButton.position(width*3.5, height*0.83);
  
  screenshotButton.mousePressed(() => {
    //save();
  });

  askForImage(stewPrompt);

}


function draw() {
  bg();
  //background(240);
  push();
  fill(250,250,250, 230);
  ellipse(10,50,10000,16000);
  pop();
  drawTitle();
  drawRecipe();
  textAlign(CENTER);
  
  // Stew Name
  text(resulting_text, width/2, height*0.75)
  
  // Current Time
  time();
  text(currentTimeString, width/2, height*0.73)

  drawStew();
  
  userName = nameInput.value();
  text(nameInput.value(),40,50)

}

function drawTitle() {
  push();
  textSize(60);
  textAlign(CENTER);
  textFont('Courier New');
  text('Perpetual Stew!', width/2 + random(-1,.5), height*0.1 + random(-.5,1));
  pop();
}

function drawStew() {
  if (imageData) {
    imageMode(CENTER);
    image(imageData, width/2, height*0.45, 0.5*height, 0.5*height);
  }
}

function drawRecipe() {
  // Loop through all key values inside of our local storage of ingredients
  let ingredient_list = "INGREDIENT LIST: \n";
  for (var key in allStrokesLocal) {
    let thisItem = allStrokesLocal[key];
    if (thisItem.ExpireTime > currentTimeInMins) {
      ingredient_list += thisItem.Foodname + "(" + (thisItem.ExpireTime - currentTimeInMins) +"m)" + " - " + thisItem.Chef +"\n";
    }
    
  }
  push();
  textAlign(LEFT);
  textSize(20);
  textFont('Courier New');
  text(ingredient_list, width/8, height*(0.25));
  
  pop();
}

function addIngredientUI() {
  
  input = createInput('Add an ingredient!');
  input.position(width/2 - 60, height*0.8);
  
  let button = createButton("Add");
  button.position(width/2 - 20, height*0.83);
  
  button.mousePressed(() => {
    addFoodToDB(input.value(), currentTimeInMins, userName,int( currentTimeInMins+random(200)));
  });
}

function addUsernameUI() {
  
  nameInput = createInput('Guest');
  nameInput.position(width/2 - 60, height*0.87);
  
  let nameButton = createButton("Take a Pic!");
  nameButton.position(width*(6.5/8)- 20, height*0.5);
  
  nameButton.mousePressed(() => {
    userName = nameInput.value();
    save();
  });
}

// add the stroke to the database
function addFoodToDB(_foodname, _addTimeInMins, _username, _expirydate) {
  let mydata = {
    Foodname: _foodname,
    AddTime: _addTimeInMins,
    Chef: _username,
    ExpireTime: _expirydate
  };
  //add a stroke
  let dbInfo = db.ref("group/" + group + "/" + typeOfThing +"/").push(mydata);
}

// [] CONNECT TO FIREBASE FUNCTION
// Taken directly from example code
function connectToFirebase() {
  const app = firebase.initializeApp(firebaseConfig);
  db = app.database();

  var myRef = db.ref("group/" + group+ "/" + typeOfThing +"/");
  myRef.on("child_added", (data) => {
    console.log("add", data.key, data.val());
    // Create a unique key
    let key = data.key;
    let value = data.val();
    //update our local variable
    allStrokesLocal[key] = value;
    //drawStrokes();
    drawRecipe();
    //console.log(allStrokesLocal);
  });
  
  //not used
  myRef.on("child_changed", (data) => {
    console.log("changed", data.key, data.val());
  });

  //not used 
  myRef.on("child_removed", (data) => {
    console.log("removed", data.key);
  });
}

// - REPLICATE GENERATION STUFF

async function askForImage(p_prompt) {
  const data = {
    "version": "dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
    input: {
      "prompt": p_prompt,
      "width": 512,
      "height": 512,
    },
  };

  console.log("BUILDING........", data);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const url = replicateProxy + "/create_n_get/";
  console.log("url", url, "options", options);

  const picture_info = await fetch(url, options);
  const proxy_said = await picture_info.json();

  console.log("Response from image generation service:", proxy_said);

  if (!proxy_said || !proxy_said.output || proxy_said.output.length === 0) {
    console.error("Image generation failed!");
  } else {
    const imageURL = proxy_said.output[0];
    imageData = await loadImage(imageURL);
  }
}

async function askForWords(p_prompt) {
    document.body.style.cursor = "progress";

    //resulting_text.html("Waiting for reply from Replicate...");
    const data = {
        "version": "35042c9a33ac8fd5e29e27fb3197f33aa483f72c2ce3b0b9d201155c7fd2a287",
        input: {
            prompt: p_prompt,
            max_tokens: 100,
            max_length: 100,
        },
    };
    console.log("Asking for Words From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
        },
        body: JSON.stringify(data),
    };
    const url = replicateProxy + "/create_n_get/"
    console.log("words url", url, "words options", options);
    const words_response = await fetch(url, options);
    console.log("words_response", words_response);
    const proxy_said = await words_response.json();
    if (proxy_said.output.length == 0) {
        //resulting_text.html("Something went wrong, try it again");
    } else {
        resulting_text = (proxy_said.output.join(""));
        console.log("proxy_said", proxy_said.output.join(""));

    }
   document.body.style.cursor = "auto";
}

function time() {
  mo = month();
  d = day();
  h = hour();
  m = minute();
  s = second();
  currentTimeString = mo + "-" + d + " " + h + ":" + m + ":" + s;
  currentTimeInMins = (mo * 43800) + (d*1440) + (h*60) + m;
  
  
}

function bg() {
  // Clear a small area to avoid trails
  clear(width / 3, height / 3, width / 3, height / 3);


  for (let x = 0; x < width; x += emojiSize) {
    for (let y = 0; y < height; y += emojiSize) {
      push(); 
      translate(x + emojiSize / 2, y + emojiSize / 2); 
      rotate(frameCount / 100); 
      fill(255, 215, 0); 
      textSize(emojiSize);
      text("🥫", 0, 0);
      pop();
    }
  }
}





