const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

const grantAccessContainer = document.querySelector(".grant-access-container");
const searchForm = document.querySelector(".form-container");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let currentTab = userTab;
currentTab.classList.add("current-tab");
const API_KEY = "d83c174ee027b066b0ea509e5fc87bcc";

// Function to switch tabs
function switchTab(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (currentTab===searchTab) {
      // If the search tab is active, show the search form and hide others
      
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      // If the user weather tab is active, show the user weather info
      userInfoContainer.classList.remove("active")
      searchForm.classList.remove("active");
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

// Function to get coordinates from session storage
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    searchForm.classList.remove("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

function getPermissionStatus() {
  const permissionStatus = sessionStorage.getItem("permission-status");
  if (permissionStatus === "granted") {
    // If permission is granted, proceed with fetching weather info
    getFromSessionStorage();
  } else {
    // If permission is not granted or not set, show the grant permission container
    grantAccessContainer.classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getPermissionStatus();
});

// Function to fetch user weather information
async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (error) {
    loadingScreen.classList.remove("active");
    console.error("There is some error", error);
  }
}

// Function to render weather information in the UI
function renderWeatherInfo(data) {
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const weatherDesc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-clouds]");

  // Displaying data on the UI
  cityName.innerText = data?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
  weatherDesc.innerText = data?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
  temp.innerText = `${data?.main?.temp} °C`;
  windspeed.innerText = `${data?.wind?.speed} m/s`;
  humidity.innerText = `${data?.main?.humidity}%`;
  cloudiness.innerText = `${data?.clouds?.all}%`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getlocation);

function getlocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
  } else {
    alert("Geolocation is not supported by this browser."); 
  }
}
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  sessionStorage.setItem("permission-status", "granted");
  fetchUserWeatherInfo(userCoordinates);
}

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;
  if (cityName === "") {
    return;
  } else {
    fetchSearchWeatherInfo(cityName);
  }
});

async function fetchSearchWeatherInfo(cityName) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (error) {
    console.log(error);
  }
}
