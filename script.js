const breakfasts = [
  {
    name: "Peanut Butter Banana Toast",
    time: "5 min",
    ingredients: "Bread, Peanut Butter, Banana",
    prep: "Toast bread, spread peanut butter, add banana slices",
    video: "https://www.youtube.com/watch?v=1APZ3Z7Qx0Q"
  },
  {
    name: "Overnight Oats",
    time: "Prep at night",
    ingredients: "Oats, Milk, Honey",
    prep: "Mix and keep in fridge overnight",
    video: "https://www.youtube.com/watch?v=Lkl9_3-jX6c"
  },
  {
    name: "Egg Sandwich",
    time: "10 min",
    ingredients: "Eggs, Bread, Butter",
    prep: "Cook egg and place inside toasted bread",
    video: "https://www.youtube.com/watch?v=G2rQ8C9yF8Q"
  }
];

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}
// ===== BREAK SYSTEM START =====

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