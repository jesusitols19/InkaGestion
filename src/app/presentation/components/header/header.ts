import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
 currentPage: string = '';
  username: string = '';
  showNotifications = false;
  showUserMenu = false;
  notifications: string[] = [
    'Se generó una nueva planilla de pago.',
    'Hay un nuevo reporte disponible.',
    'Recordatorio: Jornada especial mañana.'
  ];

  constructor(private router: Router) {
    this.username = JSON.parse(localStorage.getItem('nombre_usuario_actual') || '"Invitado"');

    // Detectar cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentPage = this.getPageTitle(event.urlAfterRedirects);
        this.closeMenus();
      }
    });
  }

  getPageTitle(url: string): string {
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('mis-datos')) return 'Mis Datos';
    if (url.includes('usuarios-roles')) return 'Gestión de Usuarios';
    if (url.includes('trabajadores')) return 'Trabajadores';
    if (url.includes('jornada-horarios')) return 'Jornadas y Horarios';
    if (url.includes('planillas')) return 'Planillas';
    if (url.includes('pagos-adelantos')) return 'Pagos y Adelantos';
    if (url.includes('analisis-predictivo')) return 'Análisis Predictivo';
    if (url.includes('reportes')) return 'Reportes';
    return 'Inicio';
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  clearNotifications() {
    this.notifications = [];
  }

  closeMenus() {
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  logout(): void {
    console.log('👋 Cierre de sesión');
    localStorage.removeItem("id_usuario_actual");
    localStorage.removeItem("nombre_usuario_actual");
    localStorage.removeItem("correo_usuario_actual");
    this.router.navigateByUrl('/login');
  }
  
}