import { Routes } from '@angular/router';
import { EvaluacionClinica } from './features/evaluacion-clinica/evaluacion-clinica';

export const routes: Routes = [
  { path: '', redirectTo: 'evaluacion-clinica', pathMatch: 'full' },
  { path: 'evaluacion-clinica', component: EvaluacionClinica },
];
