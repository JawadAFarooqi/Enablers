import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  //city display
  dispCity: string = "";

  // default map settings
  lat: number = 33.0;
  lng: number = 73.0;
  zoom: number = 6;

  // marker placed by user
  markerLat: number = null;
  markerLng: number = null;

  // for current weather conditions
  sky: string = null;
  icon: string = null;
  temperature: number = null;
  humidity: string = null
  windSpeed: number = null;
  windDir: string = null;
  rain: number = null;
  snow: number = null;

  // forecast for upcoming days
  forecast: any = [];
  showForecast: boolean = false;

  // entered city
  city: string = '';


  constructor(private dataService: DataService) {
  }


  // handling click on the map
  mapClicked(event) {
    this.markerLat = event.coords.lat;
    this.markerLng = event.coords.lng;
    this.city = '';
    console.log("mapClicked ", event)
    // getting current weather data for clicked place
    this.dataService.getCurrentWeatherByCoodrs(event.coords.lat, event.coords.lng).subscribe(response => {
      console.log("dataService.getCurrentWeatherByCoodrs response", response)
      this.sky = response.weather[0].description;
      this.icon = response.weather[0].icon;
      this.temperature = Math.round(response.main.temp - 273.15);
      this.humidity = response.main.humidity;
      this.windSpeed = Math.round(response.wind.speed * 3.6);
      this.windDir = this.mapWindDir(response.wind.deg);
      this.rain = (response.rain) ? response.rain['3h'] : 0;
      this.snow = (response.snow) ? response.snow['3h'] : null;
      this.dispCity = response.name ? response.name : null;
    });
  }


  // replacing wind dierenction in degrees with arrow
  mapWindDir(deg) {
    const value = Math.floor((deg / 45) + 0.5);
    const arrows = ['&#8595;', '&#8601;', '&#8592;', '&#8598;', '&#8593;', '&#8599;', '&#8594;', '&#8600;', '&#8595;'];
    return arrows[value % 8];
  }


  // handling entering city name
  findByCity(e) {
    e.preventDefault();
    console.log("findByCity clicked", e)
    // getting current weather data for entered city
    this.dataService.getCurrentWeatherByCity(this.city).subscribe(
      response => {
        console.log("dataService.getCurrentWeatherByCity response", response)
        // placing makrer on the map
        this.lat = response.coord.lat;
        this.lng = response.coord.lon;
        this.markerLat = response.coord.lat;
        this.markerLng = response.coord.lon;
        this.zoom = 8;

        this.sky = response.weather[0].description;
        this.icon = response.weather[0].icon;
        this.temperature = Math.round(response.main.temp - 273.15);
        this.humidity = response.main.humidity;
        this.windSpeed = Math.round(response.wind.speed * 3.6);
        this.windDir = this.mapWindDir(response.wind.deg);
        this.rain = (response.rain) ? response.rain['3h'] : 0;
        this.snow = (response.snow) ? response.snow['3h'] : null;
        this.dispCity = response.name ? response.name : null;
      },
      error => { // resetting map is no such place exists
        this.resetMap();
      }
    );
  }


  // handling click on "Forecast" button
  forecastButtonClicked() {
    // getting 10 days forecast for given place
    this.dataService.getForecastByCoords(this.markerLat, this.markerLng).subscribe(response => {
      this.forecast = response.list;
      this.showForecast = true;
    });
  }


  // handling click on "X" button - closing modal
  closeForecastModal() {
    this.showForecast = false;
  }


  // rounding temperature to full degrees Celcuis
  roundTemperature(temp) {
    return Math.round(temp - 273.15);
  }


  // returning date string in DD.MM.YYYY format
  getDateString(dt) {
    const date = new Date(dt * 1000);
    return date.toLocaleDateString();
  }


  // returning day of the week based on day number (0-6)
  getDay(dt) {
    const date = new Date(dt * 1000);
    const day = date.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }


  // resetting map and all weather conditions / forecasts
  resetMap() {
    this.lat = 33.0;
    this.lng = 73.0;
    this.markerLat = null;
    this.markerLng = null;
    this.zoom = 6;
    this.sky = null;
    this.icon = null;
    this.temperature = null;
    this.humidity = null;
    this.windSpeed = null;
    this.windDir = null;
    this.rain = null;
    this.snow = null;
    this.forecast = [];
    this.dispCity = null;
  }

  /* ---- Dropdown ---- */
  dropdownSettings = {
    singleSelect: {
      singleSelection: true,
      allowSearchFilter: false,
      closeDropDownOnSelection: true,
      idField: 'layer_option',
      textField: 'shape_name',
    }
  }

  /*----- AGM Open Weather Layers -----*/
  weatherMapSource = "";
  weatherOption = {};
  weatherMapSourceApiKey = "9f4d67fc449f30b9c2a33a138be6b54e";
  mapWeatherLayers = [
    { shape_name: "Wind Speed", layer_option: { layer_value: "wind_new", legendMin: "0 m/s", legendAvg: "100 m/s", legendMax: "200 m/s", legendTitle: "Wind Speed", scaleClass: "weather-wind" } },
    { shape_name: "Temperature", layer_option: { layer_value: "temp_new", legendMin: "-40 deg C", legendAvg: "0 deg C", legendMax: "40 deg C", legendTitle: "Temperature", scaleClass: "weather-temperature" } },
    { shape_name: "Pressure", layer_option: { layer_value: "pressure_new", legendMin: "949.92 hPa", legendAvg: "1013.25 hPa", legendMax: "1070.63 hPa", legendTitle: "Pressure", scaleClass: "weather-pressure" } },
    { shape_name: "Percipitation", layer_option: { layer_value: "precipitation_new", legendMin: "0 mm", legendAvg: "100 mm", legendMax: "200 mm", legendTitle: "Snow", scaleClass: "weather-percepitation" } },
    { shape_name: "Clouds", layer_option: { layer_value: "clouds_new", legendMin: "0 %", legendAvg: "50 %", legendMax: "100 %", legendTitle: "Cloud", scaleClass: "weather-cloud" } }
  ];
  selectedWeatherLayer = [];
  mapInstance: any;
  addWeatherLayer() {
    this.weatherMapSource = "https://tile.openweathermap.org/map/" + this.selectedWeatherLayer[0]["layer_option"]["layer_value"] + "/";
    this.weatherOption = this.selectedWeatherLayer[0]["layer_option"]
    this.plotWeatherLayers(this.mapInstance);
  }
  removeWeatherLayer() {
    this.weatherMapSource = "";
    this.mapInstance.overlayMapTypes.clear();
  }
  doSomethingWithTheMapInstance(event) {
    this.mapInstance = event;
  }
  plotWeatherLayers(event) {
    let weatherMapProvider = this.weatherMapSource;
    let weatherApiKey = this.weatherMapSourceApiKey;
    event.overlayMapTypes.clear();
    event.overlayMapTypes.insertAt(0, new agmMapType({ width: 256, height: 256, f: "px", b: "px" }));
    function agmMapType(tileSize) {
      this.tileSize = tileSize;
    }
    agmMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
      var div = ownerDocument.createElement('div');
      div.style.width = this.tileSize.width + 'px';
      div.style.height = this.tileSize.height + 'px';
      div.style.fontSize = '10';
      div.style['background-image'] = 'url(' + weatherMapProvider + zoom + "/" + coord.x + "/" + coord.y + ".png?appid=" + weatherApiKey + ')';
      return div;
    };
  }
}
