import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  activePage: string = '';  // To track the active page
  showBottomNavbar: boolean = true;  // Flag to control the visibility of the bottom navbar

  constructor(private router: Router, private menuController: MenuController) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarVisibility(event.urlAfterRedirects);
      }
    });
  }

  private updateNavbarVisibility(url: string) {
    // Check the route and hide the navbar for landing, login, and signup pages
    if (url.includes('landing') || url.includes('login') || url.includes('signup')) {
      this.showBottomNavbar = false;
    } else {
      this.showBottomNavbar = true;
    }

    // Update the active page to highlight the correct button
    if (url.includes('colleges')) {
      this.activePage = 'colleges';
    } else if (url.includes('map')) {
      this.activePage = 'map';
    } else if (url.includes('profile')) {
      this.activePage = 'profile';
    } else {
      this.activePage = '';  // Default if no match
    }
  }

  navigateTo(page: string) {
    this.menuController.close();
    this.router.navigate([`/${page}`]);
  }

  logout() {
    this.menuController.close();
    this.router.navigate(['/login']);
  }
}