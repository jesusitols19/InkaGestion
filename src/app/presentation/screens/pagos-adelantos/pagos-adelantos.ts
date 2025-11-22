import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagos-adelantos',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './pagos-adelantos.html',
  styleUrl: './pagos-adelantos.css'
})
export class PagosAdelantos implements OnInit {

  adelantos: any[] = [];
  corridas: any[] = [];

  employees: any[] = [];

  formAdelanto: FormGroup;
  formItem: FormGroup;

  mostrarModalAdelanto = false;
  mostrarModalAprobacion = false;
  mostrarModalItem = false;

  adelantoSeleccionado: any = null;
  corridaSeleccionada: any = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.formAdelanto = this.fb.group({
      employee_id: ['', Validators.required],
      amount: ['', Validators.required],
      note: ['']
    });

    this.formItem = this.fb.group({
      employee_id: ['', Validators.required],
      amount: ['', Validators.required],
      bank_account: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarAdelantos();
    this.cargarCorridas();
    this.loadEmployees();
  }

  // ================= ADELANTOS =================
  cargarAdelantos() {
    this.http.get<any>('http://localhost:8000/get-all-advances').subscribe(res => this.adelantos = res.data || []);
  }

  crearAdelanto() {
    const idUsuario = localStorage.getItem('id_usuario_actual');
    const payload = { ...this.formAdelanto.value, requested_by: idUsuario };
    this.http.post('http://localhost:8000/request-advance', payload)
      .subscribe(() => {
        this.cerrarModalAdelanto();
        this.cargarAdelantos();
      });
  }

  abrirModalAdelanto() {
    this.formAdelanto.reset();
    this.mostrarModalAdelanto = true;
  }

  cerrarModalAdelanto() {
    this.mostrarModalAdelanto = false;
  }

  abrirModalAprobacion(a: any) {
    this.adelantoSeleccionado = a;
    this.mostrarModalAprobacion = true;
  }

  cerrarModalAprobacion() {
    this.mostrarModalAprobacion = false;
  }

  aprobarAdelanto(approve: boolean) {
    const idUsuario = localStorage.getItem('id_usuario_actual');
    const payload = {
      advance_id: this.adelantoSeleccionado.id,
      approved_by: idUsuario,
      approve
    };
    this.http.put('http://localhost:8000/approve-advance', payload)
      .subscribe(() => {
        this.cerrarModalAprobacion();
        this.cargarAdelantos();
      });
  }

  marcarPagado(id: number) {
    this.http.put(`http://localhost:8000/mark-paid/${id}`, {})
      .subscribe(() => this.cargarAdelantos());
  }

  colorEstado(status: string) {
    return status === 'APPROVED' ? 'success'
         : status === 'PENDING' ? 'warning'
         : status === 'PAID' ? 'primary'
         : 'secondary';
  }

  // ================= CORRIDAS =================
  cargarCorridas() {
    this.http.get<any>('http://localhost:8000/get-all-payment-runs').subscribe(res => this.corridas = res.data || []);
  }

  crearCorrida() {
    const idUsuario = localStorage.getItem('id_usuario_actual');
    this.http.post(`http://localhost:8000/create-payment-run/${idUsuario}`, {})
      .subscribe(() => this.cargarCorridas());
  }

  abrirModalItem(c: any) {
    this.corridaSeleccionada = c;
    this.mostrarModalItem = true;
  }

  cerrarModalItem() {
    this.mostrarModalItem = false;
  }

  agregarItem() {
    const payload = { ...this.formItem.value, run_id: this.corridaSeleccionada.id };
    this.http.post('http://localhost:8000/add-item', payload)
      .subscribe(() => {
        this.cerrarModalItem();
        this.cargarCorridas();
      });
  }

  generarArchivoBanco(c: any) {
    this.http.put(`http://localhost:8000/generate-file_bank/${c.id}`, {})
      .subscribe(() => this.cargarCorridas());
  }

  cerrarCorrida(c: any) {
    this.http.put(`http://localhost:8000/close-run/${c.id}`, {})
      .subscribe(() => this.cargarCorridas());
  }

  colorEstadoCorrida(status: string) {
    return status === 'PROCESSED' ? 'success'
         : status === 'FAILED' ? 'danger'
         : 'warning';
  }

  loadEmployees(){

    this.http.get('http://localhost:8000/list-employees').subscribe((res: any) => {
      this.employees = res.data || [];
    });

  }
}