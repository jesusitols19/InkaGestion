import { Component, OnInit } from '@angular/core';
import { ReusableTable } from '../../components/reusable-table/reusable-table';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-jornadas-horarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,           // ✅ Agrega esto
    ReusableTable,
    HttpClientModule
  ],
  templateUrl: './jornadas-horarios.html',
  styleUrl: './jornadas-horarios.css'
})
export class JornadasHorarios implements OnInit {

  apiBase = 'http://localhost:8000'; // ajusta según tu backend FastAPI

  // ===== TURNOS =====
  shifts: any[] = [];
  newShift: any = {
    name: '',
    start_time: '',
    end_time: '',
    tolerance_minutes: 0,
    description: '',
    created_by: localStorage.getItem('id_usuario_actual') || 1
  };

  // ===== ASIGNACIÓN EMPLEADO - TURNO =====
  employeeShifts: any[] = [];
  newEmployeeShift: any = {
    employee_id: '',
    shift_id: '',
    start_date: '',
    end_date: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadShifts();
    this.loadEmployeeShifts();
  }

  // === Turnos ===
  loadShifts() {
    this.http.get(`${this.apiBase}/get-all-shift`).subscribe((res: any) => {
      this.shifts = res.data || [];
    });
  }

  createShift() {
    if (!this.newShift.name || !this.newShift.start_time || !this.newShift.end_time) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    this.http.post(`${this.apiBase}/create-shift`, this.newShift).subscribe((res: any) => {
      alert('Turno creado correctamente');
      this.newShift = { name: '', start_time: '', end_time: '', tolerance_minutes: 0, description: '', created_by: localStorage.getItem('id_usuario_actual') || 1 };
      this.loadShifts();
    });
  }

  // === Asignación de Turnos ===
  loadEmployeeShifts() {
    this.http.get(`${this.apiBase}/get-all-employee-shift`).subscribe((res: any) => {
      this.employeeShifts = res.data || [];
    });
  }

  assignEmployeeShift() {
    if (!this.newEmployeeShift.employee_id || !this.newEmployeeShift.shift_id || !this.newEmployeeShift.start_date) {
      alert('Completa los datos requeridos.');
      return;
    }

    this.http.post(`${this.apiBase}/create-employee-shift`, this.newEmployeeShift).subscribe((res: any) => {
      alert('Turno asignado correctamente');
      this.newEmployeeShift = { employee_id: '', shift_id: '', start_date: '', end_date: '' };
      this.loadEmployeeShifts();
    });
  }
}
