import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface SeccionClinica {
  key: 'bipedo' | 'supino' | 'prono' | 'sedente';
  label: string;
}

@Component({
  selector: 'app-evaluacion-clinica',
  imports: [ReactiveFormsModule],
  templateUrl: './evaluacion-clinica.html',
  styleUrl: './evaluacion-clinica.scss',
})
export class EvaluacionClinica {
  private readonly fb = inject(FormBuilder);

  // Orden posicional clínico: Bípedo -> Supino -> Prono -> Sedente.
  protected readonly secciones: SeccionClinica[] = [
    { key: 'bipedo', label: 'Bípedo' },
    { key: 'supino', label: 'Supino' },
    { key: 'prono', label: 'Prono' },
    { key: 'sedente', label: 'Sedente' },
  ];

  protected readonly seccionActiva = signal<SeccionClinica['key']>('bipedo');

  protected readonly evaluacionForm = this.fb.group({
    bipedo: this.fb.group({}),
    supino: this.fb.group({
      flexionCadera: [null as number | null, [Validators.required, Validators.min(0), Validators.max(180)]],
      anguloPopliteo: [null as number | null, [Validators.required, Validators.min(0), Validators.max(180)]],
    }),
    prono: this.fb.group({}),
    sedente: this.fb.group({}),
  });

  protected irASeccion(key: SeccionClinica['key']): void {
    this.seccionActiva.set(key);
  }

  protected siguienteSeccion(): void {
    const indiceActual = this.secciones.findIndex((s) => s.key === this.seccionActiva());
    if (indiceActual < this.secciones.length - 1) {
      this.seccionActiva.set(this.secciones[indiceActual + 1].key);
    }
  }

  protected anteriorSeccion(): void {
    const indiceActual = this.secciones.findIndex((s) => s.key === this.seccionActiva());
    if (indiceActual > 0) {
      this.seccionActiva.set(this.secciones[indiceActual - 1].key);
    }
  }

  protected guardar(): void {
    if (this.evaluacionForm.invalid) {
      this.evaluacionForm.markAllAsTouched();
      return;
    }
    console.log(this.evaluacionForm.getRawValue());
  }
}
