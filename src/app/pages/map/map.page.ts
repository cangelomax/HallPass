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
  currentStepContainer: HTMLDivElement | null = null;
  toggleButton: HTMLButtonElement | null = null;
  isStepContainerVisible: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
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

  private createToggleButton() {
    // Create toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'toggle-steps-btn leaflet-bar';
    this.toggleButton.style.position = 'absolute';
    this.toggleButton.style.top = '10px';
    this.toggleButton.style.right = '10px';
    this.toggleButton.style.zIndex = '1001';
    this.toggleButton.style.backgroundColor = 'white';
    this.toggleButton.style.border = '1px solid #ccc';
    this.toggleButton.style.borderRadius = '5px';
    this.toggleButton.style.padding = '5px';
    this.toggleButton.style.cursor = 'pointer';
    this.toggleButton.style.display = 'flex';
    this.toggleButton.style.alignItems = 'center';
    this.toggleButton.style.justifyContent = 'center';
    this.toggleButton.style.width = '40px';
    this.toggleButton.style.height = '40px';

    // Create SVG container for the icon
    const iconContainer = document.createElement('div');
    
    // Add click event listener
    this.toggleButton.addEventListener('click', () => this.toggleStepContainer());

    // Add the button to the map
    if (this.map) {
      // Render the initial down icon
      this.renderToggleIcon(iconContainer, true);
      this.toggleButton.appendChild(iconContainer);
      this.map.getContainer().appendChild(this.toggleButton);
    }
  }

  private renderToggleIcon(container: HTMLElement, isDown: boolean) {
    // Clear previous content
    container.innerHTML = '';

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.style.color = '#333'; // Dark gray color for better visibility

    // Path for the icon
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', isDown 
      ? 'M6 9l6 6 6-6'  // Chevron down
      : 'M18 15l-6-6-6 6'  // Chevron up
    );

    svg.appendChild(path);
    container.appendChild(svg);
  }

  private toggleStepContainer() {
    if (!this.currentStepContainer || !this.toggleButton) return;

    this.isStepContainerVisible = !this.isStepContainerVisible;

    if (this.isStepContainerVisible) {
      this.currentStepContainer.style.display = 'block';
      this.renderToggleIcon(this.toggleButton.querySelector('div') as HTMLElement, true);
    } else {
      this.currentStepContainer.style.display = 'none';
      this.renderToggleIcon(this.toggleButton.querySelector('div') as HTMLElement, false);
    }
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
        iconUrl: '../../../assets/images/profile-icon.png',
        iconSize: [32, 21],
        iconAnchor: [16, 22],
      });
      L.marker(userLocation, { icon: userIcon }).addTo(this.map).bindPopup('Your Location').openPopup();

      // Define destination based on query params (or fallback to default)
      const destination: L.LatLngExpression = [
        Number(defaultLatitude) || 17.659532,
        Number(defaultLongitude) || 121.751897
      ];

      // Remove the old route if there is one
      if (this.routeControl) {
        this.routeControl.remove();
      }

      // Remove any existing step container
      if (this.currentStepContainer) {
        this.currentStepContainer.remove();
      }

      // Remove any existing toggle button
      if (this.toggleButton) {
        this.toggleButton.remove();
      }

      // Create a container for the current step
      this.currentStepContainer = document.createElement('div');
      this.currentStepContainer.className = 'current-step-container leaflet-bar';
      this.currentStepContainer.style.position = 'absolute';
      this.currentStepContainer.style.top = '10px';
      this.currentStepContainer.style.right = '10px';
      this.currentStepContainer.style.zIndex = '1000';
      this.currentStepContainer.style.backgroundColor = 'white';
      this.currentStepContainer.style.padding = '10px';
      this.currentStepContainer.style.borderRadius = '5px';
      this.currentStepContainer.style.maxWidth = '250px';

      // Add the container to the map
      this.map.getContainer().appendChild(this.currentStepContainer);

      // Create toggle button
      this.createToggleButton();

      // Add routing control with custom instructions
      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation),
          L.latLng(destination),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: 'blue', weight: 5, opacity: 0.7 }],
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving',
        }),
        // Custom instructions display
        show: false,
        createRoutesContainer: () => {
          // Return an empty container to suppress default routing UI
          return document.createElement('div');
        }
      }).addTo(this.map);

      // Listen for routing instructions
      this.routeControl?.on('routesfound', (e) => {
        const routes = e.routes;
        if (routes.length > 0) {
          const firstRoute = routes[0];
          if (firstRoute.instructions && firstRoute.instructions.length > 0) {
            // Get the first 5 steps (or all available steps if less than 5)
            const nextSteps = firstRoute.instructions.slice(0, 5);
      
            // Update the current step container with the next 5 steps
            if (this.currentStepContainer) {
              const stepsHTML = nextSteps.map((instruction: any, index: number) => `
                <div class="route-step">
                  <strong>Step ${index + 1}:</strong>
                  ${instruction.text}
                  <br>
                  <small>Distance: ${instruction.distance.toFixed(2)} m</small>
                </div>
              `).join('');
      
              this.currentStepContainer.innerHTML = `
                <h3>Directions:</h3>
                ${stepsHTML}
              `;
            }
          }
        }
      });
      if (this.routeControl) {
        const routingContainer = document.querySelector('.leaflet-routing-container');
        if (routingContainer) {
          routingContainer.remove();
        }
      }

      // Add destination marker with name as popup
      const destinationIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41],
      });
      
      L.marker(destination, { icon: destinationIcon }).addTo(this.map).bindPopup(destinationName).openPopup();

    } catch (error) {
      console.error('Error getting geolocation:', error);

      // Fallback location handling (similar to previous implementation)
      const fallbackLocation: L.LatLngExpression = [17.659282, 121.752497];
      this.map.setView(fallbackLocation, 18);

      const destination: L.LatLngExpression = [
        Number(defaultLatitude) || 17.659532,
        Number(defaultLongitude) || 121.751897
      ];

      // Similar routing control setup as above, but for fallback location
      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(fallbackLocation),
          L.latLng(destination),
        ],
        routeWhileDragging: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: 'blue', weight: 5, opacity: 0.7 }],
        },
      }).addTo(this.map);

      // Add the destination marker
      const destinationIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41],
      });
      L.marker(destination, { icon: destinationIcon }).addTo(this.map).bindPopup(destinationName).openPopup();
    }
  }
}