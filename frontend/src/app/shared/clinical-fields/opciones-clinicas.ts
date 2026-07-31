export interface OpcionSelect {
  value: string;
  label: string;
}

// Debe coincidir con GradoFuerza en backend/models.py.
export const OPCIONES_FUERZA: OpcionSelect[] = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4-', label: '4-' },
  { value: '4', label: '4' },
  { value: '4+', label: '4+' },
  { value: '5', label: '5' },
];

// Debe coincidir con GradoAshworth en backend/models.py.
export const OPCIONES_ASHWORTH: OpcionSelect[] = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '1+', label: '1+' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

// Debe coincidir con ResultadoSigno en backend/models.py.
export const OPCIONES_SIGNO: OpcionSelect[] = [
  { value: 'positivo', label: 'Positivo' },
  { value: 'negativo', label: 'Negativo' },
];

// Escala de reflejos osteotendinosos (ROT): 0 = ausente, hasta 4+ = hiperreflexia con clonus.
export const OPCIONES_ROT: OpcionSelect[] = [
  { value: '0', label: '0' },
  { value: '1+', label: '1+' },
  { value: '2+', label: '2+' },
  { value: '3+', label: '3+' },
  { value: '4+', label: '4+' },
];
