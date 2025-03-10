# Gobernanza
![Gobernanza](govbanner.webp)

## Introducción

El DAO de Cosmicrafts pone a la comunidad en el centro, otorgando a los participantes una voz real en el crecimiento de la franquicia. Construido sobre tecnología probada, el DAO utiliza la equidad, la transparencia y la toma de decisiones impulsada por la comunidad para asegurar que Cosmicrafts se mantenga fiel a su visión.

::: info Guía de Lectura
Este documento describe el marco de gobernanza del DAO de Cosmicrafts, enfocándose en los procesos de toma de decisiones, sistemas de propuestas y participación comunitaria. Complementa el documento de [Tokenomía](/tokenomics), que cubre los aspectos económicos.

- **Enfoque Principal**: Procesos de gobernanza, votación y toma de decisiones comunitaria
- **Documento Complementario**: [Tokenomía](/tokenomics) para economía de tokens y utilidad
- **Referencias Cruzadas**: Busca los cuadros de información que enlazan a secciones relevantes de tokenomía
:::

## Principios Fundamentales del DAO

| Principio | Descripción |
|-----------|-------------|
| **Soberanía Comunitaria** | • Poder de decisión colectivo<br>• Proceso de gobernanza transparente<br>• Votación en cadena y ejecución automatizada<br>|
| **Crecimiento Sostenible** | • Creación de valor a largo plazo<br>• Desarrollo equilibrado del ecosistema<br>• Gestión de tesorería impulsada por la comunidad<br>• Sistema de evaluación basado en datos |
| **Participación Abierta** | • Estructura de gobernanza inclusiva<br>• Bajas barreras de entrada<br>• Expansión impulsada por la comunidad<br>• Accesibilidad multicadena |


## Distribución del Poder de Voto

<div class="tokenomics-diagram">
  <img src="src/assets/icons/votingpower.svg" alt="Distribución de Tokens SPIRAL" />
</div>

<style>
.tokenomics-diagram {
  text-align: center;
  width: 100%;
  margin: 4rem auto;
}

.tokenomics-diagram img {
  width: 65%;
  max-width: 800px;
  height: auto;
  filter: none;
  box-shadow: none;
  background: transparent;
  margin: 0 auto;
  display: block;
}

@media (max-width: 768px) {
  .tokenomics-diagram img {
    width: 100%;
    max-width: 100%;
  }

}
</style>

::: info Poder de Voto Dinámico
La distribución real del poder de voto fluctuará según las decisiones de los participantes respecto a:
- Cantidad de tokens bloqueados en neuronas
- Duración del período de disolución elegido
- Edad acumulada de las neuronas
Estos factores pueden cambiar significativamente la influencia relativa de los diferentes grupos de participantes a lo largo del tiempo.
:::

| Grupo de Participantes | Cuota de Votación | Tokens Base | Propósito |
|------------------------|-------------------|--------------|------------|
| **Participantes SNS** | 50% | 120M | - Mayor bloque de votación<br>- Gobernanza impulsada por la comunidad<br>- Potencial de aumentar la influencia mediante participación |
| **Equipo de Desarrollo** | 33,3% | 80M | - Toma de decisiones estratégicas<br>- Período de disolución de 8 años con consolidación de 1 año<br>- Reducción gradual de influencia |
| **Genesis/Semilla** | 16,7% | 40M | - Representación de primeros patrocinadores<br>- Períodos de disolución escalonados (0-7 años)<br>- Influencia inicial equilibrada |


### Multiplicadores de Poder

| Factor | Bonificación Máxima | Tiempo para Alcanzar |
|--------|---------------------|---------------------|
| **Retraso de Disolución** | +100% | 8 años |
| **Edad de la Neurona** | +100% | 1 año |
| **Retraso Mínimo de Disolución** | N/A | 1 mes |
| **Límite Combinado** | 3x poder base | N/A |

## Integración SNS

El DAO de Cosmicrafts aprovecha el [Sistema Nervioso de Servicio (SNS)](https://internetcomputer.org/docs/building-apps/governing-apps/overview) de Internet Computer para su infraestructura de gobernanza. Esto proporciona un marco probado y seguro para la toma de decisiones descentralizada.

### Características Principales

- **Votación Basada en Neuronas**: Bloquea tokens SPIRAL para crear neuronas y participar en la gobernanza
- **Bonificaciones por Retraso de Disolución**: Períodos de bloqueo más largos aumentan el poder de voto
- **Bonificaciones por Edad**: Las neuronas ganan más poder de voto con el tiempo
- **Sistema de Propuestas**: Marco estándar de propuestas SNS para todas las acciones de gobernanza

::: info Configuración SNS
Para parámetros técnicos detallados de nuestra configuración SNS, incluyendo stakes mínimos, períodos de votación y tasas de recompensa, consulta los parámetros de inicialización SNS en nuestra documentación.
:::

### Parámetros de Gobernanza

| Parámetro | Valor | Propósito |
|-----------|-------|-----------|
| **Tarifa de Rechazo** | 1.000 SPIRAL | Prevenir propuestas spam |
| **Período Inicial de Votación** | 7 días | Tiempo estándar de deliberación |
| **Extensión Máxima de Plazo** | 1 día | Permitir participación tardía |
| **Stake Mínimo para Crear Neurona** | 1.000 SPIRAL | Umbral base de participación |


## Mecánicas de Staking de Neuronas

### Requisitos Base

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| **Stake Mínimo** | 1.000 SPIRAL | Cantidad base requerida para crear una neurona |
| **Período Mínimo de Bloqueo** | 30 días | Menor retraso de disolución permitido |
| **Período Máximo de Bloqueo** | 8 años | Mayor retraso de disolución posible |
| **Comisión por Transacción** | 0,01 SPIRAL | Costo de operación de red |

### Calendario de Maduración

| Período de Bloqueo | Multiplicador de Bonificación | Poder Efectivo |
|-------------------|---------------------------|-----------------|
| 30 días | 1,0x | Poder Base |
| 6 meses | 1,25x | +25% |
| 1 año | 1,5x | +50% |
| 2 años | 1,75x | +75% |
| 4 años | 1,85x | +85% |
| 8 años | 2,0x | +100% |


## Marco de Toma de Decisiones

### Áreas de Gobernanza

1. **Gestión de Tesorería**
   - Campañas de Marketing
   - Financiamiento de Desarrollo
   - Alianzas Estratégicas

2. **Políticas Económicas**
   - Ajustes de Tokenomía
   - Tasas de Staking
   - Estructuras de Comisiones

3. **Plan de Desarrollo**
   - Priorización de Funcionalidades
   - Expansiones del Juego
   - Mejoras Técnicas

### Sistema de Propuestas

| Etapa | Duración | Requisitos |
|-------|----------|------------|
| **Presentación** | N/A | Stake de 1.000 SPIRAL |
| **Revisión** | 24 horas | Retroalimentación de la comunidad |
| **Votación** | 7 días | Requiere neurona activa |
| **Ejecución** | Variable | Automatizada si se aprueba |

::: info Implementación Comunitaria
Para detalles prácticos sobre gestión de tesorería, programas comunitarios e iniciativas de crecimiento del ecosistema, consulta nuestro marco de [Comunidad](/community).
:::

