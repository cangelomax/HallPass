import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
})
export class ProfileMenuComponent {

  constructor(private popoverController: PopoverController, private router: Router) {}

  // Handle logout and navigate to the login page
  logout() {
    // Optionally, clear session or user data if needed
    // localStorage.removeItem('userToken');
    this.router.navigate(['/login']);
    this.popoverController.dismiss(); // Close the popover menu after logout
  }
  
  closePopover() {
    this.popoverController.dismiss();
  }
}
