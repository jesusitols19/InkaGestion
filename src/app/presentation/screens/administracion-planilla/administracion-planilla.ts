import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-administracion-planilla',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './administracion-planilla.html',
  styleUrl: './administracion-planilla.css'
})
export class AdministracionPlanilla implements OnInit{
  

  // === Periodos ===
  periodos: any[] = [];
  mostrarModalPeriodo = false;
  editandoPeriodo = false;
  formPeriodo: FormGroup;
  selectedPeriodoId: number | null = null;

  // === Planillas ===
  planillas: any[] = [];
  mostrarModalPlanilla = false;
  formPlanilla: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.formPeriodo = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      status: ['OPEN'],
    });

    this.formPlanilla = this.fb.group({
      employee_id: ['', Validators.required],
      period_id: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargarPeriodos();
    this.cargarPlanillas();
  }

  // ================= PERIODOS =================
  cargarPeriodos() {
    this.http.get<any>('http://localhost:8000/payroll-periods')
      .subscribe(res => this.periodos = res.data || []);
  }

  guardarPeriodo() {
    const data = this.formPeriodo.value;

    if (this.editandoPeriodo) {
      // DTO: PayrollPeriodUpdateDTO
      const payload = {
        id: this.selectedPeriodoId,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status
      };

      // alert(payload.id+" "+payload.start_date+ " " + payload.end_date + " " + payload.status);

      this.http.put('http://localhost:8000/update-payroll-period', payload)
        .subscribe(() => {
          this.cargarPeriodos();
          this.cerrarModalPeriodo();
        });

    } else {
      // DTO: PayrollPeriodCreateDTO
      const payload = {
        start_date: data.start_date,
        end_date: data.end_date,
      };

      this.http.post('http://localhost:8000/create-payroll-period', payload)
        .subscribe(() => {
          this.cargarPeriodos();
          this.cerrarModalPeriodo();
        });
    }
  }

  editarPeriodo(p: any) {
    this.editandoPeriodo = true;
    this.selectedPeriodoId = p.id;
    this.formPeriodo.patchValue(p);
    this.mostrarModalPeriodo = true;
  }

  abrirModalPeriodo() {
    this.formPeriodo.reset({ status: 'OPEN' });
    this.editandoPeriodo = false;
    this.mostrarModalPeriodo = true;
  }

  cerrarModalPeriodo() {
    this.mostrarModalPeriodo = false;
    this.editandoPeriodo = false;
  }

  // ================= PLANILLAS =================
  cargarPlanillas() {
    this.http.get<any>('http://localhost:8000/list-payrolls')
      .subscribe(res => this.planillas = res.data || []);
  }

  generarPlanilla() {
    const idUsuario = localStorage.getItem('id_usuario_actual');
    const payload = {
      ...this.formPlanilla.value,
      processed_by: Number(idUsuario)
    };

    console.log(payload);

    this.http.post('http://localhost:8000/generate-payroll', payload)
      .subscribe(() => {
        this.cargarPlanillas();
        this.cerrarModalPlanilla();
      });
  }

  abrirModalPlanilla() {
    this.formPlanilla.reset();
    this.mostrarModalPlanilla = true;
  }

  cerrarModalPlanilla() {
    this.mostrarModalPlanilla = false;
  }


}
