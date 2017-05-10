import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class PiService {

  constructor(private http: Http) {}

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'Basic ' +
      btoa('pistol:shrimp'));
  }

  getOutlets():Observable<any> {
    let headers = new Headers();
    //this.createAuthorizationHeader(headers);
    return this.http.get('http://10.0.1.4:3000/api/outlets',{headers: headers})
      .map((res:Response) => res.json() || {});
  }

  putOutlet(outlet, state):Observable<any> {
    return this.http.put('http://10.0.1.4:3000/api/outlets/' + outlet + '/' + state, JSON.stringify({}))
      .map((res:Response) => res.json() || {});
  }


}
