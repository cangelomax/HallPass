import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';

// Import the ProfileMenuComponent
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';

@NgModule({
  declarations: [AppComponent, ProfileMenuComponent], // Declare ProfileMenuComponent
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md', // Use Material Design style
      animated: true // Enable animations
    }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase), // Initialize Firebase
    AngularFireAuthModule, // Auth module
    AngularFirestoreModule // Firestore module
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
