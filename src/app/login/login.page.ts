import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { environment } from 'src/environments/environment';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  // Initialize Firebase
  oApp = initializeApp(environment.firebase);

  // Initialize Firebase Authentication and get a reference to the service
  oAuth = getAuth(this.oApp);

  gEmail = "";
  gPassword = "";

  constructor(
    private menuCtrl: MenuController, 
    private router: Router
  ) { }

  ngOnInit() {}

  // Disable the menu when the login page is entered
  ionViewWillEnter() {
    this.menuCtrl.enable(false); // Disable menu
  }

  // Re-enable the menu when leaving the login page
  ionViewWillLeave() {
    this.menuCtrl.enable(true); // Re-enable menu
  }

  loginUser() {
    signInWithEmailAndPassword(this.oAuth, this.gEmail, this.gPassword)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user);
        // Navigate to the colleges page after successful login
        this.router.navigate(['/colleges']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  }
}