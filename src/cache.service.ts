import { EventEmitter, Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { APIService } from './api.service';
import { AuthenticationService } from './authentication.service';

import { ConfigurationService } from './configuration.service';


@Injectable()
export class CacheService {

  private cache: { [key: string]: Observable<any> } = {};
  private refreshDelay: number;
  private maxSize: number;
  public revoke: EventEmitter<string | null> = new EventEmitter();
  public hits: { [key: string]: number } = {};

  constructor(
    private auth: AuthenticationService,
    public api: APIService,
    public config: ConfigurationService
  ) {
    const service = this;
    this.auth.isAuthenticated.subscribe(() => {
      this.revoke.emit();
    });
    service.refreshDelay = service.config.get('CACHE_REFRESH_DELAY', 10000);
    service.maxSize = service.config.get('CACHE_MAX_SIZE', 1000);
    service.revoke.subscribe((revoked: string | null) => {
      if (!revoked) {
        service.cache = {};
        service.hits = {}
      } else if (typeof revoked === 'string') {
        delete service.cache[revoked];
        delete service.hits[revoked];
      }
    })
  }

  /*
   * gets an observable
   * that broadcasts a ReplaySubject
   * which emits the response of a get request
   * during environment.dataRefreshDelay ms without sending a new http request
   */
  public get<T>(url: string): Observable<T> {
    const service = this;
    if (!service.cache.hasOwnProperty(url)) {
      // TODO: do not revoke everything
      if (Object.keys(service.cache).length > service.maxSize) {
        this.revoke.emit();
      }
      service.cache[url] = service.api.get(url)
      // create a ReplaySubject that stores and emit last response during delay
        .publishReplay(1, service.refreshDelay)
        // broadcast ReplaySubject
        .refCount()
        // complete each observer after response has been emitted
        .take(1)
        .map((observable: Observable<T>) => {
          const hits = this.hits[url];
          service.hits[url] = hits ? hits + 1 : 1;
          return observable;
        });
    }
    return service.cache[url];
  }

  /*
   Make the observable revoke the cache when it emits
   */
  public revoking<T>(observable: Observable<T>, revoked?: string | null): Observable<T> {
    const service = this;
    return observable.map((val: T): T => {
      service.revoke.emit(revoked);
      return val;
    });
  }

}
