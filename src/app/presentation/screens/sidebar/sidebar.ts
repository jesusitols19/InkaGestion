import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  constructor(private router: Router) {}

  toggleSidebar(): void {
    const sidebar = document.querySelector('#sidebar');
    sidebar?.classList.toggle('expand');
  }

  
  logout(): void {
    console.log('👋 Cierre de sesión');
    localStorage.removeItem("id_usuario_actual");
    localStorage.removeItem("nombre_usuario_actual");
    localStorage.removeItem("correo_usuario_actual");
    this.router.navigateByUrl('/login');
  }
}
