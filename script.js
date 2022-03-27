"use strict";

const type = document.getElementById("type");
const distance = document.getElementById("distance");
const duration = document.getElementById("duration");
const cadence = document.getElementById("cadence");
const form = document.querySelector("form");
const mapSection = document.querySelector(".map-section");
const inputForCadence = document.querySelector("[for = 'cadence']");
const inputs = document.querySelectorAll("input");
const displaySection = document.querySelector(".display-section");

class Workout {
  date = new Date();
  id = Date.now();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}
class Running extends Workout {
  type = "Running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = "Cycling";
  constructor(coords, distance, duration, elv) {
    super(coords, distance, duration);
    this.elv = elv;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #lat;
  #lng;
  #workouts = [];
  constructor() {
    this._getPosition();
    this._fetchLocalStopage();
    form.addEventListener("keyup", this._newWorkOut.bind(this));
    type.addEventListener("change", this._toggleElevationField);
    displaySection.addEventListener("click", this._moveTo.bind(this));
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem("lats", position.coords.latitude);
        localStorage.setItem("lngs", position.coords.longitude);
        this._loadMap(position);
      },
      () => {
        alert("we can not access to your positon");
      }
    );
  }
  _loadMap(position) {
    this.#map = L.map("map").setView(
      [position.coords.latitude, position.coords.longitude],
      13
    );
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
    ).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
    for (const wor of this.#workouts) {
      this._displayMarker(wor);
    }
  }
  _fetchLocalStopage() {
    if (!JSON.parse(localStorage.getItem("workouts"))) return;
    this.#workouts = JSON.parse(localStorage.getItem("workouts"));

    for (const wor of this.#workouts) {
      this._displayWorkOut(wor);
    }
  }

  _showForm(e) {
    form.classList.remove("hidden");
    distance.focus();
    this.#lat = e.latlng.lat;
    this.#lng = e.latlng.lng;
  }
  _toggleElevationField() {
    if (type.value === "Cycling") {
      cadence.setAttribute("placeholder", "meters");
      inputForCadence.textContent = "Elev Gain";
    } else {
      cadence.setAttribute("placeholder", "step/min");
      inputForCadence.textContent = "Cadence";
    }
  }

  _newWorkOut(e) {
    if (e.key !== "Enter") return;
    function isValid(...inputs) {
      return (
        inputs.every((input) => Number.isFinite(input)) &&
        inputs.every((input) => input > 0)
      );
    }
    if (!isValid(+distance.value, +duration.value, +cadence.value))
      return alert("You should entre all fields with positive nember.");
    let coords = [this.#lat, this.#lng];
    let workout;

    if (type.value === "Running") {
      workout = new Running(
        coords,
        distance.value,
        duration.value,
        cadence.value
      );
    } else {
      workout = new Cycling(
        coords,
        distance.value,
        duration.value,
        cadence.value
      );
    }
    this.#workouts.push(workout);
    this._displayMarker(workout);
    this._displayWorkOut(workout);
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));

    form.classList.add("hidden");
    inputs.forEach((input) => (input.value = null));
  }
  _displayMarker(obj) {
    const marker = L.marker([+obj.coords[0], +obj.coords[1]]).addTo(this.#map);
    marker
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          minWidth: 150,
        }).setContent(
          `<h3> ${obj.type === "Running" ? "🏃" : "🚴‍♀️"} ${
            obj.type
          } on ${new Date(obj.date).toLocaleString(navigator.language, {
            month: "long",
            day: "2-digit",
          })}</h3>`
        )
      )

      .openPopup();
  }
  _displayWorkOut(obj) {
    const html = `
          
            
    <div class="programme ${
      obj.type === "Running" ? "work-run" : "work-cycle"
    }" data-id=${obj.id}>
     <h3>${obj.type} on ${new Date(obj.date).toLocaleString(
      navigator.language,
      {
        month: "long",
        day: "2-digit",
      }
    )}</h3>
     <p> <span>${obj.type === "Running" ? "🏃" : "🚴‍♀️"} ${
      obj.distance
    }</span>  km</p>
     <p> <span>⌛ ${obj.duration}</span>  min</p>
     <p> <span>⚡ ${
       obj.type === "Running" ? obj.pace.toFixed(1) : obj.speed.toFixed(1)
     }</span>  min/km</p>
     <p> <span>${obj.type === "Running" ? "👣" : "🏔️"} ${
      obj.type === "Running" ? obj.cadence : obj.elv
    }</span>  ${obj.type === "Running" ? "spm" : "m"}</p>
 <span></span>
   </div>
          `;
    form.insertAdjacentHTML("afterend", html);
  }
  _moveTo(e) {
    if (!e.target.closest(".programme")) return;

    const current = this.#workouts.find(
      (elm) => elm.id === +e.target.closest("div").dataset.id
    );
    this.#map.setView(current.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
