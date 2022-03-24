"use strict";
const type = document.getElementById("type");
const distance = document.getElementById("distance");
const duration = document.getElementById("duration");
const cadence = document.getElementById("cadence");
const form = document.querySelector("form");
const mapSection = document.querySelector(".map-section");
const inputForCadence = document.querySelector("[for = 'cadence']");
const  x = document.getElementById("demo");
let lat;
let lng;



function getLocation(){
navigator.geolocation.getCurrentPosition((position)=>{
  console.log(position);
 localStorage.setItem("lats",`${position.coords.latitude}`);
 localStorage.setItem("lngs",`${position.coords.longitude}`);
 
},()=>{
  console.log("not possibal");
})
}
getLocation()


const latLocal=+localStorage.getItem("lats")||51
const lngLocal=+localStorage.getItem("lngs")||-0.6
  


var map = L.map("map").setView([latLocal, lngLocal], 13);
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
    //   document.querySelector(".leaflet-popup-content-wrapper").classList.add("popup-warper")
    //   document.querySelector(".leaflet-popup-content").style.width="fit-content"
    form.classList.add("hidden");
  } else {
    alert("You should entre all fields with positive nember.");
  }
});

map.on("click", (e) => {
  form.classList.remove("hidden");
  lat = e.latlng.lat;
  lng = e.latlng.lng;
  localStorage.setItem("x",`${e.latlng.lat}`)
  localStorage.setItem("y",`${e.latlng.lat}`)
 
});


