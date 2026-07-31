import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

interface CampoFoto {
  key: string;
  titulo: string;
  detalle: string;
}

interface GrupoFotos {
  titulo: string;
  campos: CampoFoto[];
}

@Component({
  selector: 'app-capturas-fotograficas',
  imports: [ReactiveFormsModule],
  templateUrl: './capturas-fotograficas.html',
  styleUrl: './capturas-fotograficas.scss',
})
export class CapturasFotograficas {
  private readonly fb = inject(FormBuilder);

  // Checklist de fotografías del Bípedo, según lista.docx y Fotos.docx.
  // Módulo independiente de la evaluación clínica: alimenta un PDF fotográfico propio.
  protected readonly grupos: GrupoFotos[] = [
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
    {
      titulo: 'Prono',
      campos: [
        {
          key: 'fotoRotacionInternaCadera',
          titulo: 'Rotación interna de cadera',
          detalle: 'Acostado boca abajo, vista posterior, realizando la rotación interna de las caderas',
        },
        {
          key: 'fotoRotacionExternaCadera',
          titulo: 'Rotación externa de cadera',
          detalle: 'Acostado boca abajo, vista posterior, realizando la rotación externa de las caderas',
        },
        {
          key: 'fotoAnguloMusloPie',
          titulo: 'Ángulo muslo-pie',
          detalle: 'Vista desde arriba, boca abajo, con rodillas flejadas',
        },
      ],
    },
  ];

  // Vistas previas (object URLs) de las fotos seleccionadas, por clave de campo.
  protected readonly previsualizaciones = signal<Record<string, string>>({});

  protected readonly capturasForm = this.fb.group(this.construirGrupoFotos());

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const url of Object.values(this.previsualizaciones())) {
        URL.revokeObjectURL(url);
      }
    });
  }

  private construirGrupoFotos() {
    const controles: Record<string, FormControl<File | null>> = {};
    for (const grupo of this.grupos) {
      for (const campo of grupo.campos) {
        controles[campo.key] = this.fb.control<File | null>(null, Validators.required);
      }
    }
    return controles;
  }

  protected controlFoto(key: string) {
    return this.capturasForm.get(key);
  }

  protected onFotoSeleccionada(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.controlFoto(key)?.setValue(archivo);
    this.controlFoto(key)?.markAsTouched();
    this.actualizarPrevisualizacion(key, archivo);
  }

  protected quitarFoto(key: string, input: HTMLInputElement): void {
    input.value = '';
    this.controlFoto(key)?.setValue(null);
    this.controlFoto(key)?.markAsTouched();
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

  protected guardar(): void {
    if (this.capturasForm.invalid) {
      this.capturasForm.markAllAsTouched();
      return;
    }
    // TODO: enviar al backend para recorte/anonimización (OpenCV) y generación del PDF fotográfico.
    console.log(this.capturasForm.getRawValue());
  }
}
