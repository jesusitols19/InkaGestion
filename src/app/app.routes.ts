import { Routes } from '@angular/router';
import { Sidebar } from './presentation/screens/sidebar/sidebar';
import { Dashboard } from './presentation/screens/dashboard/dashboard';
import { MisDatos } from './presentation/screens/mis-datos/mis-datos';
import { UsuariosRoles } from './presentation/screens/usuarios-roles/usuarios-roles';
import { ControlAsistencia } from './presentation/screens/control-asistencia/control-asistencia';
import { JornadasHorarios } from './presentation/screens/jornadas-horarios/jornadas-horarios';
import { AdministracionPlanilla } from './presentation/screens/administracion-planilla/administracion-planilla';
import { PagosAdelantos } from './presentation/screens/pagos-adelantos/pagos-adelantos';
import { AnalisisPredictivo } from './presentation/screens/analisis-predictivo/analisis-predictivo';
import { ReportesAdministrativos } from './presentation/screens/reportes-administrativos/reportes-administrativos';

export const routes: Routes = [
    {
        path: '',
        component: Sidebar,
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'mis-datos',
                component: MisDatos
            },
            {
                path: 'usuarios-roles',
                component: UsuariosRoles
            },
            {
                path: 'asistencia',
                component: ControlAsistencia
            },
            {
                path: 'jornada-horarios',
                component: JornadasHorarios
            },
            {
                path: 'planillas',
                component: AdministracionPlanilla
            },
            {
                path: 'pagos-adelantos',
                component: PagosAdelantos
            },
            {
                path: 'analisis-predictivo',
                component: AnalisisPredictivo
            },
            {
                path: 'reportes',
                component: ReportesAdministrativos
            },
        ]
    }
];
