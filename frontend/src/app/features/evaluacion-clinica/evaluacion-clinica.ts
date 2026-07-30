import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

interface SeccionClinica {
  key: 'bipedo' | 'supino' | 'prono' | 'sedente';
  label: string;
}

interface CampoFotoBipedo {
  key: string;
  titulo: string;
  detalle: string;
}

interface GrupoFotosBipedo {
  titulo: string;
  campos: CampoFotoBipedo[];
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

  // Checklist de fotografías del Bípedo inicial, según lista.docx y Fotos.docx.
  protected readonly gruposFotosBipedo: GrupoFotosBipedo[] = [
    {
      titulo: 'Postura corporal',
      campos: [
        { key: 'fotoAnterior', titulo: 'Anterior', detalle: 'Plano frontal, de frente, cuerpo entero' },
        { key: 'fotoLateralIzquierda', titulo: 'Lateral izquierda', detalle: 'Plano sagital, lado izquierdo, cuerpo entero' },
        { key: 'fotoLateralDerecha', titulo: 'Lateral derecha', detalle: 'Plano sagital, lado derecho, cuerpo entero' },
        { key: 'fotoPosterior', titulo: 'Posterior', detalle: 'Plano frontal, de espaldas, cuerpo entero' },
      ],
    },
    {
      titulo: 'Test de Adams',
      campos: [
        { key: 'fotoAdams', titulo: 'Test de Adams', detalle: 'Flexión de tronco hacia adelante' },
      ],
    },
    {
      titulo: 'Pies',
      campos: [
        { key: 'fotoPiesFrontal', titulo: 'Frontal', detalle: 'Vista frontal de ambos pies con apoyo' },
        { key: 'fotoPiesLateralIzquierdo', titulo: 'Lateral izquierdo', detalle: 'Cara interna y externa, pie izquierdo con apoyo' },
        { key: 'fotoPiesLateralDerecho', titulo: 'Lateral derecho', detalle: 'Cara interna y externa, pie derecho con apoyo' },
        { key: 'fotoTalones', titulo: 'Talones', detalle: 'Vista posterior de talones con apoyo' },
      ],
    },
  ];

  protected readonly seccionActiva = signal<SeccionClinica['key']>('bipedo');

  // Vistas previas (object URLs) de las fotos seleccionadas, por clave de campo.
  protected readonly previsualizaciones = signal<Record<string, string>>({});

  protected readonly evaluacionForm = this.fb.group({
    bipedo: this.construirGrupoBipedo(),
    supino: this.fb.group({
      flexionCadera: [null as number | null, [Validators.required, Validators.min(0), Validators.max(180)]],
      anguloPopliteo: [null as number | null, [Validators.required, Validators.min(0), Validators.max(180)]],
    }),
    prono: this.fb.group({}),
    sedente: this.fb.group({}),
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const url of Object.values(this.previsualizaciones())) {
        URL.revokeObjectURL(url);
      }
    });
  }

  private construirGrupoBipedo() {
    const controles: Record<string, FormControl<File | null>> = {};
    for (const grupo of this.gruposFotosBipedo) {
      for (const campo of grupo.campos) {
        controles[campo.key] = this.fb.control<File | null>(null, Validators.required);
      }
    }
    return this.fb.group(controles);
  }

  protected controlFotoBipedo(key: string) {
    return this.evaluacionForm.get(['bipedo', key]);
  }

  protected onFotoSeleccionada(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.controlFotoBipedo(key)?.setValue(archivo);
    this.controlFotoBipedo(key)?.markAsTouched();
    this.actualizarPrevisualizacion(key, archivo);
  }

  protected quitarFotoBipedo(key: string, input: HTMLInputElement): void {
    input.value = '';
    this.controlFotoBipedo(key)?.setValue(null);
    this.controlFotoBipedo(key)?.markAsTouched();
    this.actualizarPrevisualizacion(key, null);
  }

  private actualizarPrevisualizacion(key: string, archivo: File | null): void {
    const actuales = this.previsualizaciones();
    if (actuales[key]) {
      URL.revokeObjectURL(actuales[key]);
    }
    if (archivo) {
      this.previsualizaciones.set({ ...actuales, [key]: URL.createObjectURL(archivo) });
    } else {
      const { [key]: _omitida, ...resto } = actuales;
      this.previsualizaciones.set(resto);
    }
  }

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
