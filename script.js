"use strict";
const type = document.getElementById("type");
const distance = document.getElementById("distance");
const duration = document.getElementById("duration");
const cadence = document.getElementById("cadence");
const form = document.querySelector("form");
const mapSection = document.querySelector(".map-section");
const inputForCadence = document.querySelector("[for = 'cadence']");
const x = document.getElementById("demo");
let lat;
let lng;

var map = L.map("map");
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoiYm91YWxlbWRhaSIsImEiOiJjbDEzZmN5djkwMGhkM2pzNGl5eG91dXhzIn0.2NiVVMZ0ck2RlAaGM4SguQ",
  }
).addTo(map);

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      localStorage.setItem("lats", position.coords.latitude);
      localStorage.setItem("lngs", position.coords.longitude);
      map.setView([position.coords.latitude, position.coords.longitude], 13);
    },
    () => {
      console.log("default coords");
      map.setView([51, -0.6], 13);
    }
  );
}

if (localStorage.getItem("lats") && localStorage.getItem("lngs")) {
  map.setView(
    [+localStorage.getItem("lats"), +localStorage.getItem("lngs")],
    13
  );
} else {
  getLocation();
}
if (JSON.parse(localStorage.getItem("arr"))) {
  var arr = JSON.parse(localStorage.getItem("arr"));
  for (let element of arr) {
    const html = `
        <div class="foo">
          <div class=${
            element.type === "Running" ? "work-run" : "work-cycle"
          }></div>
           <div class="programme">
            <h3>${element.type} on ${new Date().toLocaleString(
      navigator.language,
      {
        month: "long",
        day: "2-digit",
      }
    )}</h3>
            <p> <span>${element.type === "Running" ? "🏃" : "🚴‍♀️"} ${
      element.distance
    }</span>  km</p>
            <p> <span>⌛ ${element.duration}</span>  min</p>
            <p> <span>⚡ ${
              element.duration / element.distance
            }</span>  min/km</p>
            <p> <span>${element.type === "Running" ? "👣" : "🏔️"} ${
      element.cadence
    }</span>  ${element.type === "Running" ? "spm" : "m"}</p>
        <span></span>
          </div>
          </div>
    
           `;
    form.insertAdjacentHTML("afterend", html);
    const marker = L.marker([element.lat, element.lng]).addTo(map);
    marker
      .bindPopup(
        `<h3 class="run-marker">${element.type} on ${new Date().toLocaleString(
          navigator.language,
          {
            month: "long",
            day: "2-digit",
          }
        )}</h3>`
      )
      .openPopup();
  }
} else {
  var arr = [];
}

type.addEventListener("change", () => {
  if (type.value === "Cycling") {
    cadence.setAttribute("placeholder", "meters");
    inputForCadence.textContent = "Elev Gain";
  } else {
    cadence.setAttribute("placeholder", "step/min");
    inputForCadence.textContent = "Cadence";
  }
});

form.addEventListener("keypress", (e) => {
  if (e.key !== "Enter") return;
  if (type.value && distance.value && duration.value && cadence.value) {
    const html = `
    <div class="foo">
      <div class=${type.value === "Running" ? "work-run" : "work-cycle"}></div>
       <div class="programme">
        <h3>${type.value} on ${new Date().toLocaleString(navigator.language, {
      month: "long",
      day: "2-digit",
    })}</h3>
        <p> <span>${type.value === "Running" ? "🏃" : "🚴‍♀️"} ${
      distance.value
    }</span>  km</p>
        <p> <span>⌛ ${duration.value}</span>  min</p>
        <p> <span>⚡ ${duration.value / distance.value}</span>  min/km</p>
        <p> <span>${type.value === "Running" ? "👣" : "🏔️"} ${
      cadence.value
    }</span>  ${type.value === "Running" ? "spm" : "m"}</p>
    <span></span>
      </div>
      </div>

       `;
    form.insertAdjacentHTML("afterend", html);
    const marker = L.marker([lat, lng]).addTo(map);
    marker
      .bindPopup(
        `<h3 class="run-marker">${type.value} on ${new Date().toLocaleString(
          navigator.language,
          {
            month: "long",
            day: "2-digit",
          }
        )}</h3>`
      )
      .openPopup();

    arr.push({
      lat: lat,
      lng: lng,
      type: type.value,
      distance: distance.value,
      duration: duration.value,
      cadence: cadence.value,
    });
    console.log(arr);
    localStorage.setItem("arr", JSON.stringify(arr));

    // localStorage.setItem("lngs",lngArr)

    form.classList.add("hidden");
  } else {
    alert("You should entre all fields with positive nember.");
  }
});

map.on("click", (e) => {
  form.classList.remove("hidden");

  lat = e.latlng.lat;
  lng = e.latlng.lng;
});
