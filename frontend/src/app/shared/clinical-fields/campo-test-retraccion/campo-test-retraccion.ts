import { Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CampoMedidaBilateral } from '../campo-medida-bilateral/campo-medida-bilateral';
import { CampoSelectBilateral } from '../campo-select-bilateral/campo-select-bilateral';
import { OPCIONES_SIGNO } from '../opciones-clinicas';

@Component({
  selector: 'app-campo-test-retraccion',
  imports: [ReactiveFormsModule, CampoMedidaBilateral, CampoSelectBilateral],
  templateUrl: './campo-test-retraccion.html',
  styleUrl: './campo-test-retraccion.scss',
})
export class CampoTestRetraccion {
  readonly grupo = input.required<FormGroup>();
  readonly label = input.required<string>();

  protected readonly opcionesSigno = OPCIONES_SIGNO;
  private readonly destroyRef = inject(DestroyRef);

  protected get resultado(): FormGroup {
    return this.grupo().get('resultado') as FormGroup;
  }

  protected get anguloGrados(): FormGroup {
    return this.grupo().get('angulo_grados') as FormGroup;
  }

  // Si el resultado de un lado es negativo, no se toma el ángulo para ese lado.
  protected ngOnInit(): void {
    for (const lado of ['derecho', 'izquierdo'] as const) {
      const controlResultado = this.resultado.get(lado);
      const controlAngulo = this.anguloGrados.get(lado);
      if (!controlResultado || !controlAngulo) {
        continue;
      }
      this.actualizarAngulo(controlResultado.value, controlAngulo);
      controlResultado.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((valor) => {
        this.actualizarAngulo(valor, controlAngulo);
      });
    }
  }

  private actualizarAngulo(valorResultado: string | null, controlAngulo: AbstractControl): void {
    if (valorResultado === 'negativo') {
      controlAngulo.reset(null, { emitEvent: false });
      controlAngulo.disable({ emitEvent: false });
    } else {
      controlAngulo.enable({ emitEvent: false });
    }
  }
}
