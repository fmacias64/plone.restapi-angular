import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import {
  TraversalModule,
  Resolver,
  Marker,
  TraverserOutlet,
  TraverserLink
} from 'angular-traversal';

import { AuthenticationService } from './authentication.service';
import { ConfigurationService } from './configuration.service';
import { ResourceService } from './resource.service';
import {
  InterfaceMarker,
  PloneTraverser,
  RESTAPIResolver,
} from './traversal';

import { ViewView } from './views/view';

import { Navigation } from './components/navigation';

@NgModule({
  declarations: [
    ViewView,
    Navigation,
  ],
  entryComponents: [
    ViewView,
  ],
  imports: [
    HttpModule,
    TraversalModule,
  ],
  providers: [
    AuthenticationService,
    ConfigurationService,
    ResourceService,
    PloneTraverser,
    { provide: Resolver, useClass: RESTAPIResolver },
    { provide: Marker, useClass: InterfaceMarker },
  ],
  exports: [
    ViewView,
    Navigation,
    TraverserOutlet,
    TraverserLink,
  ]
})
export class RESTAPIModule {}