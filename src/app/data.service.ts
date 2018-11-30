import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  apiBaseUrl = 'https://api.openweathermap.org/data/2.5/';
  apiKey = '75259c47cb3b351a43a89ce46060850b';


  constructor(public http: Http) { }

  // current weather conditions for entered city name
  getCurrentWeatherByCoodrs(lat, lng) {
    return this.http.get(`${this.apiBaseUrl}weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}`)
      .pipe(
        map(res => res.json())
      );
  }

  // current weather conditions for a place clicked on the map
  getCurrentWeatherByCity(city) {
    return this.http.get(`${this.apiBaseUrl}weather?q=${city}&appid=${this.apiKey}`)
      .pipe(
        map(res => res.json())
      );
  }

  // weather forecast for selected place
  getForecastByCoords(lat, lng) {
    return this.http.get(`${this.apiBaseUrl}forecast/daily?lat=${lat}&lon=${lng}&cnt=10&appid=${this.apiKey}`)
      .pipe(
        map(res => res.json())
      );
  }
}
