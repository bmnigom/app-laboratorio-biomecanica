import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CampoMedidaBilateral } from '../../shared/clinical-fields/campo-medida-bilateral/campo-medida-bilateral';
import { CampoSelectBilateral } from '../../shared/clinical-fields/campo-select-bilateral/campo-select-bilateral';
import { CampoTestRetraccion } from '../../shared/clinical-fields/campo-test-retraccion/campo-test-retraccion';
import { CampoTexto } from '../../shared/clinical-fields/campo-texto/campo-texto';
import { OPCIONES_ASHWORTH, OPCIONES_FUERZA, OPCIONES_ROT, OPCIONES_SIGNO } from '../../shared/clinical-fields/opciones-clinicas';

interface SeccionClinica {
  key: 'paciente' | 'supino' | 'prono' | 'sedente' | 'bipedo';
  label: string;
}

interface Subseccion {
  id: string;
  label: string;
}

@Component({
  selector: 'app-evaluacion-clinica',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CampoMedidaBilateral,
    CampoSelectBilateral,
    CampoTestRetraccion,
    CampoTexto,
  ],
  templateUrl: './evaluacion-clinica.html',
  styleUrl: './evaluacion-clinica.scss',
})
export class EvaluacionClinica {
  private readonly fb = inject(FormBuilder);

  protected readonly opcionesFuerza = OPCIONES_FUERZA;
  protected readonly opcionesAshworth = OPCIONES_ASHWORTH;
  protected readonly opcionesSigno = OPCIONES_SIGNO;
  protected readonly opcionesRot = OPCIONES_ROT;

  // Orden en la interfaz: Paciente -> Supino -> Prono -> Sedente -> Bípedo.
  // El orden de los campos dentro de cada posición sigue estrictamente
  // docs/clinico/lista.docx. La captura fotográfica vive en el módulo aparte
  // "capturas-fotograficas".
  protected readonly secciones: SeccionClinica[] = [
    { key: 'paciente', label: 'Paciente' },
    { key: 'supino', label: 'Supino' },
    { key: 'prono', label: 'Prono' },
    { key: 'sedente', label: 'Sedente' },
    { key: 'bipedo', label: 'Bípedo' },
  ];

  protected readonly seccionActiva = signal<SeccionClinica['key']>('paciente');

  // Mini-navegación para saltar entre subsecciones dentro de una pestaña larga.
  protected readonly subseccionesPorSeccion: Record<SeccionClinica['key'], Subseccion[]> = {
    paciente: [
      { id: 'paciente-identificacion', label: 'Identificación' },
      { id: 'paciente-diagnostico', label: 'Diagnóstico' },
      { id: 'paciente-perinatal', label: 'Antecedentes perinatales' },
      { id: 'paciente-desarrollo', label: 'Desarrollo psicomotor' },
      { id: 'paciente-antecedentes', label: 'Antecedentes médicos' },
      { id: 'paciente-tratamientos', label: 'Tratamientos y ayudas' },
      { id: 'paciente-imagenes', label: 'Imágenes diagnósticas' },
      { id: 'paciente-otros', label: 'Otros' },
    ],
    // Supino y Prono no se agrupan en subsecciones: lo importante es respetar
    // el orden literal en que se toman las pruebas (docs/clinico/lista.docx),
    // no una categorización por articulación.
    supino: [],
    prono: [],
    sedente: [
      { id: 'sedente-neurologico', label: 'Neurológico' },
      { id: 'sedente-fuerza', label: 'Fuerza y tono' },
    ],
    bipedo: [],
  };

  protected irASubseccion(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private medidaBilateral() {
    return this.fb.group({
      derecho: this.fb.control<number | null>(null),
      izquierdo: this.fb.control<number | null>(null),
    });
  }

  private selectBilateral() {
    return this.fb.group({
      derecho: this.fb.control<string | null>(null),
      izquierdo: this.fb.control<string | null>(null),
    });
  }

  // Resultado + ángulo (el ángulo solo aplica si el resultado es positivo;
  // ver CampoTestRetraccion, que deshabilita el ángulo cuando es negativo).
  private signoAngulo() {
    return this.fb.group({
      resultado: this.selectBilateral(),
      angulo_grados: this.medidaBilateral(),
    });
  }

  private texto() {
    return this.fb.control<string | null>(null);
  }

  protected readonly evaluacionForm = this.fb.group({
    // Datos de identificación y antecedentes, según la primera tabla de
    // docs/clinico/"Evaluacion analisis de marcha niños.docx".
    paciente: this.fb.group({
      // Identificación
      nombre: this.texto(),
      sexo: this.texto(),
      fecha_nacimiento: this.fb.control<string | null>(null),
      fecha_estudio: this.fb.control<string | null>(this.fechaHoyIso()),
      identificacion: this.texto(),
      medico_remitente: this.texto(),
      direccion_residencia: this.texto(),
      telefono: this.texto(),
      estrato: this.texto(),
      ocupacion: this.texto(),
      escolaridad: this.texto(),
      grado: this.texto(),
      seguridad_social: this.texto(),

      // Diagnóstico
      diagnostico: this.texto(),
      procedimiento_propuesto: this.texto(),
      compromiso_topografico: this.texto(),
      tipo_tono: this.texto(),

      // Antecedentes perinatales
      tipo_parto: this.texto(),
      semanas_embarazo: this.texto(),
      permanencia_uci: this.texto(),
      peso_nacer: this.texto(),

      // Desarrollo psicomotor
      control_cabeza: this.texto(),
      rolados: this.texto(),
      sedestacion: this.texto(),
      gateo: this.texto(),
      marcha: this.texto(),
      actividad_fisica: this.texto(),

      // Antecedentes médicos
      antecedentes_terapeuticos: this.texto(),
      antecedentes_traumaticos: this.texto(),
      antecedentes_patologicos: this.texto(),
      antecedentes_quirurgicos: this.texto(),
      antecedentes_quirurgicos_ortopedicos: this.texto(),
      antecedentes_toxicos: this.texto(),
      antecedentes_familiares: this.texto(),
      alergias: this.texto(),
      convulsiones: this.texto(),
      problemas_asociados: this.texto(),
      lenguaje: this.texto(),
      lateralidad: this.texto(),

      // Tratamientos y ayudas
      medicamentos: this.texto(),
      toxina_botulinica: this.texto(),
      yesos: this.texto(),
      ortesis: this.texto(),
      bastones: this.texto(),
      caminador: this.texto(),
      silla_ruedas: this.texto(),

      // Imágenes diagnósticas
      radiografias: this.texto(),
      tac: this.texto(),
      rmn: this.texto(),

      // Otros
      miembros_superiores: this.texto(),
      lugar_familia: this.texto(),
      observaciones: this.texto(),
    }),
    supino: this.fb.group({
      // Orden literal de lista.docx: no se agrupa por articulación.
      flexion_cadera: this.medidaBilateral(),
      abduccion_cadera_rodilla_extension: this.medidaBilateral(),
      aduccion_cadera: this.medidaBilateral(),
      abduccion_cadera_rodilla_flexion: this.medidaBilateral(),
      flexion_rodilla: this.medidaBilateral(),
      extension_rodilla: this.medidaBilateral(),
      angulo_popliteo: this.medidaBilateral(),
      // Se toma en ambos lados; el hamstring shift se deriva de este valor
      // menos el ángulo poplíteo (ver calcularHamstringShift).
      angulo_popliteo_bilateral: this.medidaBilateral(),
      dorsiflexion_rodilla_extendida: this.medidaBilateral(),
      flexion_plantar: this.medidaBilateral(),
      test_silverskiold: this.selectBilateral(),
      test_allis_galeazzi: this.selectBilateral(),
      test_ellis: this.selectBilateral(),
      longitud_real: this.medidaBilateral(),
      longitud_aparente: this.medidaBilateral(),
      eje_transmaleolar: this.medidaBilateral(),
      test_thomas: this.signoAngulo(),
      ashworth_aductores: this.selectBilateral(),
      ashworth_isquiotibiales: this.selectBilateral(),
      ashworth_recto_femoral: this.selectBilateral(),
      ashworth_plantiflexores: this.selectBilateral(),
      ashworth_tibial_posterior: this.selectBilateral(),
      // Decúbito lateral: al test de Ober solo se le registra resultado, sin ángulo.
      test_ober: this.selectBilateral(),
      fuerza_abduccion_aduccion_cadera: this.selectBilateral(),
      cms_cadera: this.selectBilateral(),
      ashworth_flexores_cadera: this.selectBilateral(),

      // Observaciones por grupo articular, como en el template de evaluación
      // de marcha (no por cada prueba individual).
      comentarios_cadera: this.fb.control<string | null>(null),
      comentarios_rodilla: this.fb.control<string | null>(null),
      comentarios_tobillo: this.fb.control<string | null>(null),
    }),
    prono: this.fb.group({
      // Orden literal de lista.docx (sin subsecciones: intercala cadera/rodilla).
      extension_cadera: this.medidaBilateral(),
      fuerza_extension_cadera: this.selectBilateral(),
      fuerza_flexion_rodilla: this.selectBilateral(),
      flexion_rodilla: this.medidaBilateral(),
      rotacion_interna_cadera: this.medidaBilateral(),
      rotacion_externa_cadera: this.medidaBilateral(),
      anteversion_femoral_clinica: this.medidaBilateral(),
      // Ely evalúa 2 hallazgos independientes: retracción y tono/espasticidad.
      // Si ambos son negativos, no se toma ningún ángulo.
      test_ely: this.fb.group({
        retraccion: this.signoAngulo(),
        tono: this.signoAngulo(),
      }),
      dorsiflexion_rodilla_flexionada: this.medidaBilateral(),
      angulo_muslo_pie: this.medidaBilateral(),
      segundo_dedo: this.fb.control<string | null>(null),
      inversion_pie: this.medidaBilateral(),
      eversion_pie: this.medidaBilateral(),
      comentarios: this.fb.control<string | null>(null),
    }),
    sedente: this.fb.group({
      // Neurológico: ROT se registra por reflejo (patelar y aquiliano), cada
      // uno bilateral, según docs/clinico/"Evaluacion analisis de marcha niños.docx".
      rot_patelar: this.selectBilateral(),
      rot_aquiles: this.selectBilateral(),
      clonus: this.selectBilateral(),
      babinski: this.selectBilateral(),
      test_confusion: this.selectBilateral(),

      // Fuerza y tono
      fuerza_flexion_cadera: this.selectBilateral(),
      fuerza_extension_rodilla: this.selectBilateral(),
      fuerza_rotaciones_cadera: this.selectBilateral(),
      patela_alta: this.selectBilateral(),
      extensor_lag: this.medidaBilateral(),
      cms_rodilla: this.selectBilateral(),
      cms_tobillo: this.selectBilateral(),
      cms_pie: this.selectBilateral(),
      cms_dedos: this.selectBilateral(),
      fuerza_dorsiflexion: this.selectBilateral(),
      fuerza_inversion_eversion: this.selectBilateral(),
      ashworth_tono_general: this.selectBilateral(),
      comentarios: this.fb.control<string | null>(null),
    }),
    bipedo: this.fb.group({
      fuerza_plantiflexores: this.selectBilateral(),
    }),
  });

  private fechaHoyIso(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }

  private calcularEdad(): number | null {
    const valor = this.controlDe('paciente.fecha_nacimiento').value as string | null;
    if (!valor) {
      return null;
    }
    const nacimiento = new Date(valor);
    if (Number.isNaN(nacimiento.getTime())) {
      return null;
    }
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const antesDeCumpleanos =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
    if (antesDeCumpleanos) {
      edad--;
    }
    return edad;
  }

  protected formatoEdad(): string {
    const edad = this.calcularEdad();
    return edad === null ? 'Ingrese la fecha de nacimiento' : `${edad} años`;
  }

  // Hamstring shift = ángulo poplíteo - ángulo poplíteo bilateral, por lado.
  private calcularHamstringShift(lado: 'derecho' | 'izquierdo'): number | null {
    const popliteo = this.controlDe(`supino.angulo_popliteo.${lado}`).value as number | null;
    const bilateral = this.controlDe(`supino.angulo_popliteo_bilateral.${lado}`).value as number | null;
    if (popliteo === null || bilateral === null) {
      return null;
    }
    return popliteo - bilateral;
  }

  protected formatoHamstringShift(lado: 'derecho' | 'izquierdo'): string {
    const valor = this.calcularHamstringShift(lado);
    return valor === null ? '—' : `${valor}°`;
  }

  protected grupoDe(ruta: string): FormGroup {
    return this.evaluacionForm.get(ruta) as FormGroup;
  }

  protected controlDe(ruta: string): FormControl {
    return this.evaluacionForm.get(ruta) as FormControl;
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
