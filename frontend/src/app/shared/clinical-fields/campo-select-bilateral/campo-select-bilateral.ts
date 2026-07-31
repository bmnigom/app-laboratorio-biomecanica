import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OpcionSelect } from '../opciones-clinicas';

@Component({
  selector: 'app-campo-select-bilateral',
  imports: [ReactiveFormsModule],
  templateUrl: './campo-select-bilateral.html',
  styleUrl: './campo-select-bilateral.scss',
  host: { style: 'display: contents' },
})
export class CampoSelectBilateral {
  readonly grupo = input.required<FormGroup>();
  readonly label = input.required<string>();
  readonly opciones = input.required<OpcionSelect[]>();

  protected get derecho(): FormControl {
    return this.grupo().get('derecho') as FormControl;
  }

  protected get izquierdo(): FormControl {
    return this.grupo().get('izquierdo') as FormControl;
  }
}
