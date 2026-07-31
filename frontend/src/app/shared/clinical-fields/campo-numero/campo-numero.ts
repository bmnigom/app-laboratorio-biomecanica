import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-campo-numero',
  imports: [ReactiveFormsModule],
  templateUrl: './campo-numero.html',
  styleUrl: './campo-numero.scss',
  host: { style: 'display: contents' },
})
export class CampoNumero {
  readonly control = input.required<FormControl<number | null>>();
  readonly label = input.required<string>();
  readonly unidad = input('°');
  readonly min = input(-90);
  readonly max = input(180);
}
