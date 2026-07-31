import { Routes } from '@angular/router';
import { EvaluacionClinica } from './features/evaluacion-clinica/evaluacion-clinica';
import { CapturasFotograficas } from './features/capturas-fotograficas/capturas-fotograficas';

export const routes: Routes = [
  { path: '', redirectTo: 'evaluacion-clinica', pathMatch: 'full' },
  { path: 'evaluacion-clinica', component: EvaluacionClinica },
  { path: 'capturas-fotograficas', component: CapturasFotograficas },
];
