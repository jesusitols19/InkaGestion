import { Routes } from '@angular/router';
import { Sidebar } from './presentation/screens/sidebar/sidebar';
import { Dashboard } from './presentation/screens/dashboard/dashboard';
import { MisDatos } from './presentation/screens/mis-datos/mis-datos';
import { UsuariosRoles } from './presentation/screens/usuarios-roles/usuarios-roles';
import { ControlAsistencia } from './presentation/screens/trabajadores-asistencia/gestion-asistencia/control-asistencia';
import { JornadasHorarios } from './presentation/screens/jornadas-horarios/jornadas-horarios';
import { AdministracionPlanilla } from './presentation/screens/administracion-planilla/administracion-planilla';
import { PagosAdelantos } from './presentation/screens/pagos-adelantos/pagos-adelantos';
import { AnalisisPredictivo } from './presentation/screens/analisis-predictivo/analisis-predictivo';
import { ReportesAdministrativos } from './presentation/screens/reportes-administrativos/reportes-administrativos';
import { LoginComponent } from './presentation/screens/login/login.component';
import { authGuard } from './guards/auth-guard';
import { TrabajadoresComponent } from './presentation/screens/trabajadores-asistencia/trabajadores/trabajadores/trabajadores.component';

export const routes: Routes = [
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'',
        redirectTo:'login',
        pathMatch:'full'
    },
    {
        path: '',
        component: Sidebar,
        children: [
            {
                path: 'dashboard',
                component: Dashboard,
                canActivate: [authGuard]
            },
            {
                path: 'mis-datos',
                component: MisDatos,
                canActivate: [authGuard]
            },
            {
                path: 'usuarios-roles',
                component: UsuariosRoles,
                canActivate: [authGuard]
            },
            {
                path: 'trabajadores',
                component: TrabajadoresComponent,
                canActivate: [authGuard]
            },
            {
                path: 'trabajadores/control-asistencia',
                component: ControlAsistencia,
                canActivate: [authGuard]
            },
            {
                path: 'jornada-horarios',
                component: JornadasHorarios,
                canActivate: [authGuard]
            },
            {
                path: 'planillas',
                component: AdministracionPlanilla,
                canActivate: [authGuard]
            },
            {
                path: 'pagos-adelantos',
                component: PagosAdelantos,
                canActivate: [authGuard]
            },
            {
                path: 'analisis-predictivo',
                component: AnalisisPredictivo,
                canActivate: [authGuard]
            },
            {
                path: 'reportes',
                component: ReportesAdministrativos,
                canActivate: [authGuard]
            },
        ]
    }
];
