let savedCities = JSON.parse(localStorage.getItem("cities")) || [];

let btn = document.getElementById("getWeather");

btn.addEventListener("click", async function () {
  let city = document.getElementById("cityInput").value.trim();

  if (city === "") {
    alert("Please Enter a City");
    return;
  }

  let res = await fetch(`/api/weather?city=${city}`);
  let data = await res.json();

  let weather = data.weather;
  let forecast = data.forecast;

  // ❗ check error
  if (weather.cod !== 200) {
    alert(weather.message);
    return;
  }

  renderCities();

  let condition = weather.weather[0].main;

  document.getElementById("city").innerText = weather.name;
  document.getElementById("temp").innerText = weather.main.temp + "°C";

  document.getElementById("condition").innerText =
    "Condition: " + condition;

  document.getElementById("icon").innerHTML =
    getWeatherIcon(condition);

  document.getElementById("humidity").innerText =
    weather.main.humidity + "%";

  document.getElementById("visibility").innerText =
    (weather.visibility / 1000).toFixed(1) + " km";

  document.getElementById("wind").innerText =
    (weather.wind.speed * 3.6).toFixed(1) + " km/h";

  setWeatherBackground(condition);

  // ✅ forecast from backend
  renderForecast(forecast);
});

let saveBtn = document.getElementById("saveCity");

saveBtn.addEventListener("click", function () {
  let city = document.getElementById("city").innerText;

  if (city === "") {
    alert("No city to save");
    return;
  } 

  if (!savedCities.includes(city)) {
    savedCities.push(city);
    localStorage.setItem("cities", JSON.stringify(savedCities));
    renderCities();
  } else {
    alert("City already saved");
  }
});

// ✅ OUTSIDE (IMPORTANT)
function renderCities() {
  let list = document.getElementById("history");
  list.innerHTML = "";

  for (let i = 0; i < savedCities.length; i++) {
    let div = document.createElement("div");
    div.className = "history-card";

    div.innerHTML = `
      <span onclick="loadCity('${savedCities[i]}')" style="cursor:pointer;">
        <i class="fa-solid fa-location-dot"></i> ${savedCities[i]}
      </span>
      <button onclick="deleteCity(${i})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    list.appendChild(div);
  }
}

async function loadCity(city) {
  document.getElementById("cityInput").value = city;

  let res = await fetch(`/api/weather?city=${city}`);
  let data = await res.json();

  let weather = data.weather;
  let forecast = data.forecast;

  if (weather.cod !== 200) {
    alert(weather.message);
    return;
  }

  let condition = weather.weather[0].main;

  document.getElementById("city").innerText = weather.name;
  document.getElementById("temp").innerText =
    weather.main.temp + "°C";

  document.getElementById("condition").innerText =
    "Condition: " + condition;

  document.getElementById("icon").innerHTML =
    getWeatherIcon(condition);

  document.getElementById("humidity").innerText =
    weather.main.humidity + "%";

  document.getElementById("visibility").innerText =
    (weather.visibility / 1000).toFixed(1) + " km";

  document.getElementById("wind").innerText =
    (weather.wind.speed * 3.6).toFixed(1) + " km/h";

  setWeatherBackground(condition);

  renderForecast(forecast);
}

// Delete Cities
function deleteCity(index) {
  savedCities.splice(index, 1);
  localStorage.setItem("cities", JSON.stringify(savedCities));
  renderCities();
}

// Get Weather Icons
function getWeatherIcon(condition) {
  if (condition === "Clear") {
    return `<i class="fa-solid fa-sun sun"></i>`;
  } else if (condition === "Clouds") {
    return `<i class="fa-solid fa-cloud clouds"></i>`;
  } else if (condition === "Rain") {
    return `<i class="fa-solid fa-cloud-rain rain"></i>`;
  } else if (condition === "Mist" || condition === "Fog") {
    return `<i class="fa-solid fa-smog mist"></i>`;
  } else if (condition === "Haze" || condition === "Smoke") {
    return `<i class="fa-solid fa-smog haze"></i>`;
  } else {
    return `<i class="fa-solid fa-globe"></i>`;
  }
}

// ✅ Load on start
renderCities();

// Renders Forecast Data
function renderForecast(data) {
  let box = document.getElementById("forecast");
  box.innerHTML = "";

  for (let i = 0; i < data.list.length; i += 8) {
    let day = data.list[i];

    let div = document.createElement("div");
    div.className = "forecast-card";

    let date = new Date(day.dt * 1000);
    let dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    div.innerHTML = `
      <h4>${dayName}</h4>
      <div class="icon">${getWeatherIcon(day.weather[0].main)}</div>
      <p>${day.main.temp.toFixed(1)}°C</p>
      <small>${day.weather[0].main}</small>
    `;

    box.appendChild(div);
  }
}

function setWeatherBackground(condition) {
  let body = document.body;

  // Remove all previous classes
  body.classList.remove(
    "sunny-bg",
    "cloudy-bg",
    "rainy-bg",
    "mist-bg",
    "thunder-bg",
    "default-bg"
  );

  if (condition === "Clear") {
    body.classList.add("sunny-bg");
  }
  else if (condition === "Clouds") {
    body.classList.add("cloudy-bg");
  }
  else if (condition === "Rain") {
    body.classList.add("rainy-bg");
  }
  else if (condition === "Thunderstorm") {
    body.classList.add("thunder-bg");
  }
  else if (
    condition === "Mist" ||
    condition === "Fog" ||
    condition === "Haze" ||
    condition === "Smoke"
  ) {
    body.classList.add("mist-bg");
  }
  else {
    body.classList.add("default-bg");
  }
}

function getUserLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;

      console.log("Accurate coords:", lat, lon);

      // 🌤️ CURRENT WEATHER
      let res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3ead7b7033d5c5067489f30fff609d85&units=metric`
      );

      let data = await res.json();

      if (data.cod !== 200) {
        alert(data.message);
        return;
      }


      let condition = data.weather[0].main;

// 🌍 REVERSE GEOCODING (ADD HERE)
let geoRes = await fetch(
  `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=3ead7b7033d5c5067489f30fff609d85`
);

let geoData = await geoRes.json();

let cityName = geoData[0]?.name || data.name;

// ✅ USE CLEAN CITY NAME
document.getElementById("city").innerText = cityName;
      document.getElementById("temp").innerText = data.main.temp + "°C";

      document.getElementById("condition").innerText =
        "Condition: " + condition;

      document.getElementById("icon").innerHTML =
        getWeatherIcon(condition);

      document.getElementById("humidity").innerText =
        data.main.humidity + "%";

      document.getElementById("visibility").innerText =
        (data.visibility / 1000).toFixed(1) + " km";

      document.getElementById("wind").innerText =
        (data.wind.speed * 3.6).toFixed(1) + " km/h";

      // 🌈 Background
      setWeatherBackground(condition);

      // 📅 FORECAST
      let forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=3ead7b7033d5c5067489f30fff609d85&units=metric`
      );

      let forecastData = await forecastRes.json();
      renderForecast(forecastData);
    },

    function (error) {
      console.log(error);

      if (error.code === 1) {
        alert("Permission denied. Please allow location access.");
      } else if (error.code === 2) {
        alert("Location unavailable.");
      } else if (error.code === 3) {
        alert("Location request timed out.");
      } else {
        alert("Unknown error occurred.");
      }
    },

    // 🔥 THIS PART MAKES IT MORE ACCURATE
    {
      enableHighAccuracy: true, // 👈 VERY IMPORTANT
      timeout: 10000,           // wait up to 10 sec
      maximumAge: 0             // no cached location
    }
  );
}

getUserLocationWeather();