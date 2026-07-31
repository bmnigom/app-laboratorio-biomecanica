import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-campo-texto',
  imports: [ReactiveFormsModule],
  templateUrl: './campo-texto.html',
  styleUrl: './campo-texto.scss',
  host: { style: 'display: contents' },
})
export class CampoTexto {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input.required<string>();
  readonly multilinea = input(false);
}
