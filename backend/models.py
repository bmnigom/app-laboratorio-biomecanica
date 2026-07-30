"""
Modelos Pydantic para la API del Laboratorio de Biomecánica.

La estructura de EvaluacionClinica respeta el protocolo clínico real del
laboratorio (ver lista.docx): las pruebas se agrupan por posición corporal
y deben ejecutarse en el orden obligatorio Bípedo -> Supino -> Prono ->
Sedente -> Bípedo (regla clínica también definida en CLAUDE.md).

Nota clínica (lista.docx): varias pruebas de fuerza pueden requerir cambiar
la posición según la respuesta muscular del paciente; aun así, la secuencia
base de posiciones debe respetar el orden anterior.
"""

from datetime import date
from enum import Enum
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, computed_field, field_validator

# ---------------------------------------------------------------------------
# Tipos y escalas comunes
# ---------------------------------------------------------------------------

GradoFuerza = Literal["0", "1", "2", "3", "4-", "4", "4+", "5"]
GradoAshworth = Literal["0", "1", "1+", "2", "3", "4"]
ResultadoSigno = Literal["positivo", "negativo"]


class MedidaBilateral(BaseModel):
    """Medida angular (grados) tomada en ambos lados."""

    derecho: Optional[float] = None
    izquierdo: Optional[float] = None


class FuerzaBilateral(BaseModel):
    """Fuerza muscular manual (escala 0-5) en ambos lados."""

    derecho: Optional[GradoFuerza] = None
    izquierdo: Optional[GradoFuerza] = None


class AshworthBilateral(BaseModel):
    """Escala de Ashworth Modificada (tono muscular) en ambos lados."""

    derecho: Optional[GradoAshworth] = None
    izquierdo: Optional[GradoAshworth] = None


class SignoClinicoBilateral(BaseModel):
    """Resultado positivo/negativo de un signo clínico en ambos lados."""

    derecho: Optional[ResultadoSigno] = None
    izquierdo: Optional[ResultadoSigno] = None


class TestRetraccion(BaseModel):
    """Estructura común para las pruebas de retracción muscular."""

    resultado: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    angulo_grados: Optional[MedidaBilateral] = None
    observaciones: Optional[str] = None


# ---------------------------------------------------------------------------
# Paciente
# ---------------------------------------------------------------------------

class Sexo(str, Enum):
    MASCULINO = "masculino"
    FEMENINO = "femenino"
    OTRO = "otro"


class Lateralidad(str, Enum):
    DERECHA = "derecha"
    IZQUIERDA = "izquierda"
    AMBIDIESTRO = "ambidiestro"


class Paciente(BaseModel):
    id: str
    nombres: str
    apellidos: str
    fecha_nacimiento: date
    sexo: Sexo
    peso_kg: float = Field(gt=0)
    talla_cm: float = Field(gt=0)
    lateralidad_dominante: Optional[Lateralidad] = None
    diagnostico_medico: Optional[str] = None
    motivo_consulta: Optional[str] = None
    fecha_registro: date = Field(default_factory=date.today)

    @computed_field
    @property
    def edad(self) -> int:
        hoy = date.today()
        nacimiento = self.fecha_nacimiento
        return hoy.year - nacimiento.year - (
            (hoy.month, hoy.day) < (nacimiento.month, nacimiento.day)
        )


# ---------------------------------------------------------------------------
# Orden de captura (regla clínica obligatoria)
# ---------------------------------------------------------------------------

class PosicionCaptura(str, Enum):
    BIPEDO_INICIAL = "bipedo_inicial"
    SUPINO = "supino"
    PRONO = "prono"
    SEDENTE = "sedente"
    BIPEDO_FINAL = "bipedo_final"


ORDEN_CLINICO_OBLIGATORIO: tuple[PosicionCaptura, ...] = (
    PosicionCaptura.BIPEDO_INICIAL,
    PosicionCaptura.SUPINO,
    PosicionCaptura.PRONO,
    PosicionCaptura.SEDENTE,
    PosicionCaptura.BIPEDO_FINAL,
)


# ---------------------------------------------------------------------------
# Bloques por posición (según lista.docx)
# ---------------------------------------------------------------------------

class CapturaBipedoInicial(BaseModel):
    """Fotos de postura estática. Las rutas deben apuntar a imágenes ya
    recortadas/anonimizadas por el pipeline de OpenCV antes de guardarse."""

    foto_postura_anterior: Optional[str] = None
    foto_postura_lateral_derecha: Optional[str] = None
    foto_postura_lateral_izquierda: Optional[str] = None
    foto_postura_posterior: Optional[str] = None
    test_adams: Optional[ResultadoSigno] = None
    foto_test_adams: Optional[str] = None
    foto_pies: Optional[str] = None


class EvaluacionSupino(BaseModel):
    # Cadera
    flexion_cadera: MedidaBilateral = Field(default_factory=MedidaBilateral)
    abduccion_cadera_rodilla_extension: MedidaBilateral = Field(default_factory=MedidaBilateral)
    aduccion_cadera: MedidaBilateral = Field(default_factory=MedidaBilateral)
    abduccion_cadera_rodilla_flexion: MedidaBilateral = Field(default_factory=MedidaBilateral)
    test_thomas: TestRetraccion = Field(default_factory=TestRetraccion)
    ashworth_aductores: AshworthBilateral = Field(default_factory=AshworthBilateral)
    ashworth_flexores_cadera: AshworthBilateral = Field(default_factory=AshworthBilateral)
    fuerza_abduccion_aduccion_cadera: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    cms_cadera: FuerzaBilateral = Field(default_factory=FuerzaBilateral)

    # Rodilla
    flexion_rodilla: MedidaBilateral = Field(default_factory=MedidaBilateral)
    extension_rodilla: MedidaBilateral = Field(default_factory=MedidaBilateral)
    angulo_popliteo: MedidaBilateral = Field(default_factory=MedidaBilateral)
    angulo_popliteo_bilateral_simultaneo: Optional[float] = None
    ashworth_isquiotibiales: AshworthBilateral = Field(default_factory=AshworthBilateral)
    ashworth_recto_femoral: AshworthBilateral = Field(default_factory=AshworthBilateral)

    # Tobillo / pie
    dorsiflexion_rodilla_extendida: MedidaBilateral = Field(default_factory=MedidaBilateral)
    flexion_plantar: MedidaBilateral = Field(default_factory=MedidaBilateral)
    test_silverskiold: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    ashworth_plantiflexores: AshworthBilateral = Field(default_factory=AshworthBilateral)
    ashworth_tibial_posterior: AshworthBilateral = Field(default_factory=AshworthBilateral)

    # Longitud de miembros / signos de cadera
    test_allis: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    test_galeazzi: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    test_ellis: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    longitud_real: MedidaBilateral = Field(default_factory=MedidaBilateral)
    longitud_aparente: MedidaBilateral = Field(default_factory=MedidaBilateral)
    eje_transmaleolar: MedidaBilateral = Field(default_factory=MedidaBilateral)

    # Decúbito lateral (dentro de la misma sesión de supino, según lista.docx)
    test_ober: TestRetraccion = Field(default_factory=TestRetraccion)


class EvaluacionProno(BaseModel):
    # Cadera
    extension_cadera: MedidaBilateral = Field(default_factory=MedidaBilateral)
    fuerza_extension_cadera: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    rotacion_interna_cadera: MedidaBilateral = Field(default_factory=MedidaBilateral)
    foto_rotacion_interna_cadera: Optional[str] = None
    rotacion_externa_cadera: MedidaBilateral = Field(default_factory=MedidaBilateral)
    foto_rotacion_externa_cadera: Optional[str] = None
    anteversion_femoral_clinica: MedidaBilateral = Field(default_factory=MedidaBilateral)

    # Rodilla
    fuerza_flexion_rodilla: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    flexion_rodilla: MedidaBilateral = Field(default_factory=MedidaBilateral)
    test_ely: TestRetraccion = Field(default_factory=TestRetraccion)

    # Tobillo / pie
    dorsiflexion_rodilla_flexionada: MedidaBilateral = Field(default_factory=MedidaBilateral)
    angulo_muslo_pie: MedidaBilateral = Field(default_factory=MedidaBilateral)
    foto_angulo_muslo_pie: Optional[str] = None
    segundo_dedo: Optional[str] = None
    inversion_pie: MedidaBilateral = Field(default_factory=MedidaBilateral)
    eversion_pie: MedidaBilateral = Field(default_factory=MedidaBilateral)


class EvaluacionSedente(BaseModel):
    # Neurológico
    clonus: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    babinski: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    hallazgos_rot: Optional[str] = None
    estado_confusion: Optional[bool] = None

    # Cadera
    fuerza_flexion_cadera: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    fuerza_rotaciones_cadera: FuerzaBilateral = Field(default_factory=FuerzaBilateral)

    # Rodilla
    fuerza_extension_rodilla: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    patela_alta: SignoClinicoBilateral = Field(default_factory=SignoClinicoBilateral)
    extensor_lag: MedidaBilateral = Field(default_factory=MedidaBilateral)
    cms_rodilla: FuerzaBilateral = Field(default_factory=FuerzaBilateral)

    # Tobillo / pie / dedos
    cms_tobillo: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    cms_pie: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    cms_dedos: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    fuerza_dorsiflexion: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    fuerza_inversion_eversion: FuerzaBilateral = Field(default_factory=FuerzaBilateral)
    ashworth_tono_general: AshworthBilateral = Field(default_factory=AshworthBilateral)


class CapturaBipedoFinal(BaseModel):
    fuerza_plantiflexores: FuerzaBilateral = Field(default_factory=FuerzaBilateral)


class PruebasRetraccion(BaseModel):
    """Vista consolidada de las tres pruebas de retracción muscular,
    aunque cada una se captura en su posición clínica correspondiente
    (Thomas y Ober en supino/decúbito lateral, Ely en prono)."""

    thomas: TestRetraccion
    ely: TestRetraccion
    ober: TestRetraccion


# ---------------------------------------------------------------------------
# Evaluación clínica completa
# ---------------------------------------------------------------------------

class EvaluacionClinica(BaseModel):
    id: str
    paciente_id: str
    fecha_evaluacion: date = Field(default_factory=date.today)
    evaluador: Optional[str] = None

    orden_captura: List[PosicionCaptura] = Field(
        default_factory=lambda: list(ORDEN_CLINICO_OBLIGATORIO)
    )

    captura_bipedo_inicial: CapturaBipedoInicial = Field(default_factory=CapturaBipedoInicial)
    evaluacion_supino: EvaluacionSupino = Field(default_factory=EvaluacionSupino)
    evaluacion_prono: EvaluacionProno = Field(default_factory=EvaluacionProno)
    evaluacion_sedente: EvaluacionSedente = Field(default_factory=EvaluacionSedente)
    captura_bipedo_final: CapturaBipedoFinal = Field(default_factory=CapturaBipedoFinal)

    @field_validator("orden_captura")
    @classmethod
    def validar_orden_clinico(cls, valor: List[PosicionCaptura]) -> List[PosicionCaptura]:
        if tuple(valor) != ORDEN_CLINICO_OBLIGATORIO:
            raise ValueError(
                "El orden de captura debe respetar la regla clínica del laboratorio: "
                f"{[p.value for p in ORDEN_CLINICO_OBLIGATORIO]}"
            )
        return valor

    @computed_field
    @property
    def pruebas_retraccion(self) -> PruebasRetraccion:
        return PruebasRetraccion(
            thomas=self.evaluacion_supino.test_thomas,
            ely=self.evaluacion_prono.test_ely,
            ober=self.evaluacion_supino.test_ober,
        )

    @computed_field
    @property
    def metricas_cadera(self) -> Dict[str, object]:
        supino, prono, sedente = self.evaluacion_supino, self.evaluacion_prono, self.evaluacion_sedente
        return {
            "flexion": supino.flexion_cadera,
            "abduccion_rodilla_extension": supino.abduccion_cadera_rodilla_extension,
            "aduccion": supino.aduccion_cadera,
            "abduccion_rodilla_flexion": supino.abduccion_cadera_rodilla_flexion,
            "extension": prono.extension_cadera,
            "rotacion_interna": prono.rotacion_interna_cadera,
            "rotacion_externa": prono.rotacion_externa_cadera,
            "anteversion_femoral_clinica": prono.anteversion_femoral_clinica,
            "fuerza_flexion": sedente.fuerza_flexion_cadera,
            "fuerza_extension": prono.fuerza_extension_cadera,
            "fuerza_rotaciones": sedente.fuerza_rotaciones_cadera,
            "fuerza_abduccion_aduccion": supino.fuerza_abduccion_aduccion_cadera,
            "ashworth_aductores": supino.ashworth_aductores,
            "ashworth_flexores": supino.ashworth_flexores_cadera,
            "cms_cadera": supino.cms_cadera,
        }

    @computed_field
    @property
    def metricas_rodilla(self) -> Dict[str, object]:
        supino, prono, sedente = self.evaluacion_supino, self.evaluacion_prono, self.evaluacion_sedente
        return {
            "flexion_supino": supino.flexion_rodilla,
            "extension": supino.extension_rodilla,
            "angulo_popliteo": supino.angulo_popliteo,
            "angulo_popliteo_bilateral_simultaneo": supino.angulo_popliteo_bilateral_simultaneo,
            "flexion_prono": prono.flexion_rodilla,
            "fuerza_flexion": prono.fuerza_flexion_rodilla,
            "fuerza_extension": sedente.fuerza_extension_rodilla,
            "patela_alta": sedente.patela_alta,
            "extensor_lag": sedente.extensor_lag,
            "cms_rodilla": sedente.cms_rodilla,
            "ashworth_isquiotibiales": supino.ashworth_isquiotibiales,
            "ashworth_recto_femoral": supino.ashworth_recto_femoral,
        }

    @computed_field
    @property
    def metricas_tobillo(self) -> Dict[str, object]:
        supino, prono, sedente = self.evaluacion_supino, self.evaluacion_prono, self.evaluacion_sedente
        return {
            "dorsiflexion_rodilla_extendida": supino.dorsiflexion_rodilla_extendida,
            "flexion_plantar": supino.flexion_plantar,
            "test_silverskiold": supino.test_silverskiold,
            "dorsiflexion_rodilla_flexionada": prono.dorsiflexion_rodilla_flexionada,
            "angulo_muslo_pie": prono.angulo_muslo_pie,
            "inversion": prono.inversion_pie,
            "eversion": prono.eversion_pie,
            "fuerza_dorsiflexion": sedente.fuerza_dorsiflexion,
            "fuerza_inversion_eversion": sedente.fuerza_inversion_eversion,
            "fuerza_plantiflexores": self.captura_bipedo_final.fuerza_plantiflexores,
            "cms_tobillo": sedente.cms_tobillo,
            "cms_pie": sedente.cms_pie,
            "cms_dedos": sedente.cms_dedos,
            "ashworth_plantiflexores": supino.ashworth_plantiflexores,
            "ashworth_tibial_posterior": supino.ashworth_tibial_posterior,
        }
