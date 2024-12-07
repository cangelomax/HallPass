import { Component, AfterViewInit, ViewEncapsulation, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';  
import { Geolocation } from '@capacitor/geolocation';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapPage implements AfterViewInit, OnInit {
  map!: L.Map;
  routeControl: L.Routing.Control | null = null;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Listen for route changes within the map page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Re-initialize the map when route changes
      this.initMap();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Destroy existing map if it exists
    if (this.map) {
      this.map.remove();
    }

    // Get current route parameters
    const params = this.activatedRoute.snapshot.queryParams;
    const { latitude, longitude, name } = params;

    // Initialize the map with a default zoom level
    this.map = L.map('map', {
      zoom: 18,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    
    // Define destination name with fallback value
    const destinationName = name || 'Destination';

    // Fetch the user's location and update the map accordingly
    this.getGeolocation(latitude, longitude, destinationName);
  }

  private async getGeolocation(defaultLatitude: string, defaultLongitude: string, destinationName: string) {
    try {
      // Get the current position of the user
      const position = await Geolocation.getCurrentPosition();
      const userLocation: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];

      // Center the map on the user's location
      this.map.setView(userLocation, 18);  // Zoom level 18 for a closer view

      // Add marker for user's location with custom icon
      const userIcon = L.icon({
        iconUrl: '../../../assets/images/profile-icon.png',  // Path to custom user marker icon
        iconSize: [32, 21],  // Set the size of the icon
        iconAnchor: [16, 22],  // Anchor the icon at the bottom
      });
      L.marker(userLocation, { icon: userIcon }).addTo(this.map).bindPopup('Your Location').openPopup();

      // Define destination based on query params (or fallback to default)
      const destination: L.LatLngExpression = [
        Number(defaultLatitude) || 17.659532,  // Use provided lat if available, otherwise fallback
        Number(defaultLongitude) || 121.751897  // Use provided lon if available, otherwise fallback
      ];

      // Remove the old route if there is one
      if (this.routeControl) {
        this.routeControl.remove();
      }

      // Add routing control to show the path from user's current location to destination with blue route color
      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation),  // User's current location as start point
          L.latLng(destination),  // Destination point
        ],
        routeWhileDragging: true,  // Allow route dragging
        createMarker: () => null,  // Disable default markers
        lineOptions: {
          styles: [{ color: 'blue', weight: 5, opacity: 0.7 }],  // Set route line color to blue
        },
      }).addTo(this.map);

      // Add destination marker with name as popup
      const destinationIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',  // Default Leaflet marker icon
        iconSize: [25, 41],  // Size of the icon
        iconAnchor: [12, 41],  // Anchor the icon to the bottom
        popupAnchor: [1, -34],  // Adjust popup position
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',  // Default shadow
        shadowSize: [41, 41],  // Size of the shadow
      });
      
      L.marker(destination, { icon: destinationIcon }).addTo(this.map).bindPopup(destinationName).openPopup();

    } catch (error) {
      console.error('Error getting geolocation:', error);

      // Fallback to a default location if geolocation fails
      const fallbackLocation: L.LatLngExpression = [17.659282, 121.752497];  // Fallback to default campus center
      this.map.setView(fallbackLocation, 18);

      // Add the destination marker with fallback coordinates
      const destination: L.LatLngExpression = [
        Number(defaultLatitude) || 17.659532,  // Default destination
        Number(defaultLongitude) || 121.751897
      ];

      // Add routing control from fallback location to the destination with blue route color
      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(fallbackLocation),  // Fallback location
          L.latLng(destination),  // Destination point
        ],
        routeWhileDragging: true,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: 'blue', weight: 5, opacity: 0.7 }],  // Set route line color to blue
        },
      }).addTo(this.map);

      // Add the destination marker with fallback name
      const destinationIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',  // Default Leaflet marker icon
        iconSize: [25, 41],  // Size of the icon
        iconAnchor: [12, 41],  // Anchor the icon to the bottom
        popupAnchor: [1, -34],  // Adjust popup position
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',  // Default shadow
        shadowSize: [41, 41],  // Size of the shadow
      });
      L.marker(destination, { icon: destinationIcon }).addTo(this.map).bindPopup(destinationName).openPopup();
    }
  }
}