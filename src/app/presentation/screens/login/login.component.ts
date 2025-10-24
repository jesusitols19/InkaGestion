import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environments';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent { 

  loginForm: FormGroup;
  isDarkMode = false;
  isDevelopmentMode = true; // Cambiar a false cuando uses la BD real

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      CORREO: ['', Validators.required],
      CONTRASENIA: ['', Validators.required]
    });
  }

toggleTheme() {
  this.isDarkMode = !this.isDarkMode;

  const body = document.body;
  if (this.isDarkMode) {
    body.classList.add('dark-theme');
  } else {
    body.classList.remove('dark-theme');
  }
}

onSubmit() {
  if (this.loginForm.valid) {
    const { CORREO, CONTRASENIA } = this.loginForm.value;

    if (this.isDevelopmentMode) {
      // Modo desarrollo - sin conectar a BD
      this.loginDevelopment(CORREO, CONTRASENIA);
    } else {
      // Modo producción - conectar a BD
      this.loginProduction(CORREO, CONTRASENIA);
    }
  } else {
    this.loginForm.markAllAsTouched();
  }
}

// Login en modo desarrollo (sin BD)
private loginDevelopment(email: string, password: string) {
  // Datos de prueba
  const mockUsers = [
    { id: 1, nombre: 'Admin User', correo: 'admin@test.com', password: '123456' },
    { id: 2, nombre: 'Test User', correo: 'test@test.com', password: '123456' },
    { id: 3, nombre: 'Developer', correo: 'dev@test.com', password: '123456' }
  ];

  const user = mockUsers.find(u => u.correo === email && u.password === password);

  if (user) {
    console.log('✅ Login exitoso (DESARROLLO):', user);
    // Guardar en localStorage
    localStorage.setItem('id_usuario_actual', JSON.stringify(user.id));
    localStorage.setItem('nombre_usuario_actual', JSON.stringify(user.nombre));
    localStorage.setItem('correo_usuario_actual', JSON.stringify(user.correo));
    this.router.navigate(['/dashboard']);
  } else {
    alert('Credenciales incorrectas (DESARROLLO)\n\nUsuarios disponibles:\nadmin@test.com\ntest@test.com\ndev@test.com\nContraseña: 123456');
  }
}

// Login en modo producción (con BD)
private loginProduction(email: string, password: string) {
  const body = {
    email: email,
    password: password
  };

  this.http.post<any>(`${environment.apiUrl}/login`, body).subscribe({
    next: res => {
      if(res.status === "success"){
        console.log('✅ Login exitoso:', res);
        // Guardar en localStorage
        localStorage.setItem('id_usuario_actual', JSON.stringify(res.data.id));
        localStorage.setItem('nombre_usuario_actual', JSON.stringify(res.data.nombre));
        localStorage.setItem('correo_usuario_actual', JSON.stringify(res.data.correo));
        this.router.navigate(['/dashboard']);
      }
      else{
        alert('Credenciales incorrectas');
      }
    },
    error: err => {
      console.error('❌ Error de login:', err);
      alert('Credenciales incorrectas o error en el servidor');
    }
  });
}

}