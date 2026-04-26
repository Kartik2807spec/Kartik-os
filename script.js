const breakfasts = [
  {
    name: "Masala Idli",
    time: "15 min",
    ingredients: "Idli batter, Oil, Mustard seeds, Curry leaves, Onions, Green chilies",
    prep: "Steam idlis, temper with spices, serve hot",
    video: "https://www.youtube.com/watch?v=4vJc5W5b3nE"
  },
  {
    name: "Poha (Flattened Rice)",
    time: "10 min",
    ingredients: "Poha, Oil, Mustard seeds, Peanuts, Onions, Potatoes, Turmeric, Lemon",
    prep: "Rinse poha, sauté ingredients, mix and serve",
    video: "https://www.youtube.com/watch?v=5vJc6W6b4nF"
  },
  {
    name: "Upma",
    time: "15 min",
    ingredients: "Semolina, Oil, Mustard seeds, Urad dal, Onions, Vegetables, Curry leaves",
    prep: "Roast semolina, sauté spices and veggies, cook together",
    video: "https://www.youtube.com/watch?v=6vJc7W7b5nG"
  },
  {
    name: "Aloo Paratha",
    time: "20 min",
    ingredients: "Wheat flour, Potatoes, Spices, Oil",
    prep: "Make dough, stuff with spiced potatoes, cook on tawa",
    video: "https://www.youtube.com/watch?v=7vJc8W8b6nH"
  },
  {
    name: "Dosa",
    time: "20 min",
    ingredients: "Dosa batter, Oil, Potato filling (optional)",
    prep: "Spread batter on hot tawa, cook, serve with chutney",
    video: "https://www.youtube.com/watch?v=8vJc9W9b7nI"
  }
];

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function showRandomBreakfast() {
  const random = getRandomItem(breakfasts);
  document.getElementById('rbName').textContent = random.name;
  document.getElementById('rbTime').textContent = random.time;
  document.getElementById('rbIngredients').textContent = random.ingredients;
  document.getElementById('rbPrep').textContent = random.prep;
  const videoId = random.video.split('v=')[1];
  document.getElementById('rbVideo').src = `https://www.youtube.com/embed/${videoId}`;
  document.getElementById('randomBreakfast').style.display = 'block';
}

let isOnBreak = false;
let breakTimer = null;

function startBreak() {
  if (isOnBreak) return;

  isOnBreak = true;
  let seconds = 10; // change duration if needed

  const status = document.getElementById("break-status");
  if (!status) return;

  status.innerText = "Break started: " + seconds + "s";

  breakTimer = setInterval(() => {
    seconds--;

    status.innerText = "Break: " + seconds + "s remaining";

    if (seconds <= 0) {
      clearInterval(breakTimer);
      isOnBreak = false;
      status.innerText = "Break over. Back to work!";
    }
  }, 1000);
}

// ===== BREAK SYSTEM END =====