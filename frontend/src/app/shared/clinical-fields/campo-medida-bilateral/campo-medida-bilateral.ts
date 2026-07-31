import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-campo-medida-bilateral',
  imports: [ReactiveFormsModule],
  templateUrl: './campo-medida-bilateral.html',
  styleUrl: './campo-medida-bilateral.scss',
  // display: contents en el host permite que las 3 celdas (etiqueta, derecho, izquierdo)
  // se integren como items directos de la grilla `.tabla-bilateral` del componente padre.
  host: { style: 'display: contents' },
})
export class CampoMedidaBilateral {
  readonly grupo = input.required<FormGroup>();
  readonly label = input.required<string>();
  readonly unidad = input('°');
  readonly min = input(-90);
  readonly max = input(180);

  protected get derecho(): FormControl {
    return this.grupo().get('derecho') as FormControl;
  }

  protected get izquierdo(): FormControl {
    return this.grupo().get('izquierdo') as FormControl;
  }
}
