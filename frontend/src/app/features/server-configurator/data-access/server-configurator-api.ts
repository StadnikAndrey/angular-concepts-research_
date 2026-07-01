import { Injectable, inject } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { fromEvent, throttleTime, map, scan, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServerConfiguratorApi {
    private http = inject(HttpClient);

    getData(id: any) {
        let res = this.http.get(`api/dedicated-server/${id}`).pipe(
            map((data: any) => {
                // throw new Error(`custom error thown when converting received data to pipe()`);                
                return data;
            }),
            catchError(err => {
                // this will both network erros (404, 500) and custom errors thown when converting received data to pipe()
                return throwError(() => new Error(err.message));
            })
        );
        return res;
    }
}