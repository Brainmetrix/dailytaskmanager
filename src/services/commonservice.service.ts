import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonserviceService {

  constructor() { }
  getDataFromLocal(key) {
    return JSON.parse(localStorage.getItem(key));
  }
}
