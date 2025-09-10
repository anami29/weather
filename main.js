const api = {
  key: "fcc8de7015bbb202209bbf0261babf4c", // your API key
  base: "https://api.openweathermap.org/data/2.5/",
};

let isCelsius = true;
const app = document.querySelector(".app-wrap");
const searchBox = document.querySelector(".search-box");
const suggestionsList = document.getElementById("suggestions");

// 🌙 Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  if (app.classList.contains("darkmode")) {
    app.classList.remove("darkmode");
    app.classList.add("lightmode");
    document.body.classList.remove("darkmode");
    document.body.classList.add("lightmode");
  } else {
    app.classList.remove("lightmode");
    app.classList.add("darkmode");
    document.body.classList.remove("lightmode");
    document.body.classList.add("darkmode");
  }
});

// °C / °F toggle
document.getElementById("unit-toggle").addEventListener("click", () => {
  isCelsius = !isCelsius;
  const city = document
    .querySelector(".location .city")
    .innerText.split(",")[0];
  if (city) getResults(city);
});

// ========== Auto-suggestions ==========
searchBox.addEventListener("input", () => {
  let query = searchBox.value.trim();
  if (query.length < 2) {
    suggestionsList.innerHTML = "";
    return;
  }

  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${api.key}`
  )
    .then((res) => res.json())
    .then((data) => {
      suggestionsList.innerHTML = "";
      data.forEach((city) => {
        let li = document.createElement("li");
        li.textContent = `${city.name}, ${city.state ? city.state + ", " : ""}${
          city.country
        }`;
        li.addEventListener("click", () => {
          searchBox.value = li.textContent;
          suggestionsList.innerHTML = "";
          getWeatherByCoords(city.lat, city.lon);
        });
        suggestionsList.appendChild(li);
      });
    })
    .catch((err) => console.error("Geocoding API Error:", err));
});

// Fetch by coordinates
function getWeatherByCoords(lat, lon) {
  let unit = isCelsius ? "metric" : "imperial";
  fetch(
    `${api.base}weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${api.key}`
  )
    .then((res) => res.json())
    .then((weather) => displayResults(weather))
    .catch((err) => console.error("Weather API Error:", err));
}

// Fetch by city name (for °C/°F toggle & default)
function getResults(query) {
  let unit = isCelsius ? "metric" : "imperial";
  fetch(`${api.base}weather?q=${query}&units=${unit}&APPID=${api.key}`)
    .then((res) => res.json())
    .then((weather) => {
      if (weather.cod !== 200) {
        alert(`Error: ${weather.message}`);
        return;
      }
      displayResults(weather);
    })
    .catch((err) => console.error("API Fetch Error:", err));
}

function displayResults(weather) {
  if (!weather || !weather.main) return;

  document.querySelector(
    ".location .city"
  ).innerText = `${weather.name}, ${weather.sys.country}`;
  document.querySelector(".location .date").innerText = dateBuilder(new Date());
  document.querySelector(".current .temp").innerHTML = `${Math.round(
    weather.main.temp
  )}<span>°${isCelsius ? "C" : "F"}</span>`;
  document.querySelector(".current .weather").innerText =
    weather.weather[0].main;
  document.querySelector(".hi-low").innerText = `${Math.round(
    weather.main.temp_min
  )}° / ${Math.round(weather.main.temp_max)}°`;

  const icon = document.querySelector(".current .icon i");
  let condition = weather.weather[0].main.toLowerCase();

  if (condition.includes("cloud")) icon.className = "fas fa-cloud";
  else if (condition.includes("rain"))
    icon.className = "fas fa-cloud-showers-heavy";
  else if (condition.includes("snow")) icon.className = "fas fa-snowflake";
  else if (condition.includes("thunder")) icon.className = "fas fa-bolt";
  else if (condition.includes("mist") || condition.includes("fog"))
    icon.className = "fas fa-smog";
  else icon.className = "fas fa-sun";

  document.getElementById("humidity").innerText = `${weather.main.humidity}%`;
  document.getElementById("precip").innerText = weather.rain
    ? `${weather.rain["1h"] || 0} mm`
    : "0 mm";

  fetch(
    `${api.base}air_pollution?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${api.key}`
  )
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("aqi").innerText = data.list[0].main.aqi;
    });

  app.className = "app-wrap";
  clearWeatherAnimations();

  if (condition.includes("snow")) {
    app.classList.add("snowy");
    createSnowflakes(40);
  } else if (condition.includes("rain")) {
    if (weather.rain && weather.rain["1h"] > 5) {
      app.classList.add("heavyrainy");
      createRaindrops(120);
    } else {
      app.classList.add("rainy");
      createRaindrops(60);
    }
  } else if (condition.includes("cloud")) {
    app.classList.add("cloudy");
    createClouds(8);
  } else if (condition.includes("clear")) {
    let hour = new Date().getHours();
    if (hour >= 19 || hour <= 5) {
      app.classList.add("nightmode");
      createNightSky(50);
    } else {
      app.classList.add("sunny");
    }
  } else if (
    condition.includes("haze") ||
    condition.includes("mist") ||
    condition.includes("fog")
  ) {
    app.classList.add("hazy");
  } else {
    app.classList.add("nightmode");
    createNightSky(30);
  }
}

// Night sky
function createNightSky(starCount) {
  let moon = document.createElement("div");
  moon.classList.add("moon");
  document.body.appendChild(moon);

  for (let i = 0; i < starCount; i++) {
    let star = document.createElement("div");
    star.classList.add("star");
    let size = Math.random() * 3 + 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = Math.random() * 100 + "vh";
    star.style.left = Math.random() * 100 + "vw";
    star.style.animationDuration = 2 + Math.random() * 3 + "s";
    document.body.appendChild(star);
  }
}

// Date formatting
function dateBuilder(d) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return `${days[d.getDay()]} ${d.getDate()} ${
    months[d.getMonth()]
  } ${d.getFullYear()}`;
}

// Remove old weather elements
function clearWeatherAnimations() {
  document
    .querySelectorAll(".raindrop, .snowflake, .cloud, .star, .moon")
    .forEach((e) => e.remove());
}

// Effects
function createRaindrops(count) {
  for (let i = 0; i < count; i++) {
    let drop = document.createElement("div");
    drop.classList.add("raindrop");
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = 0.5 + Math.random() + "s";
    document.body.appendChild(drop);
  }
}

function createSnowflakes(count) {
  for (let i = 0; i < count; i++) {
    let snow = document.createElement("div");
    snow.classList.add("snowflake");
    snow.innerText = "❄";
    snow.style.left = Math.random() * 100 + "vw";
    snow.style.animationDuration = 5 + Math.random() * 5 + "s";
    snow.style.fontSize = 12 + Math.random() * 10 + "px";
    document.body.appendChild(snow);
  }
}

function createClouds(count) {
  for (let i = 0; i < count; i++) {
    let cloud = document.createElement("div");
    cloud.classList.add("cloud");
    cloud.style.width = "120px";
    cloud.style.height = "60px";
    cloud.style.top = Math.random() * 200 + "px";
    cloud.style.left = Math.random() * 100 + "vw";
    cloud.style.animationDuration = 15 + Math.random() * 10 + "s";
    document.body.appendChild(cloud);
  }
}

// Default city
getResults("Mumbai");
