---
name: Auditor de Tecnología
alias: techaudit
description: Asistente de Arquitectura que genera informes de auditoría sobre el stack y necesidades del proyecto.
---

# Auditor de Tecnología 📡

Esta skill actúa como un **Auditor Senior**. No realiza cambios automáticos. Su función es analizar la salud del proyecto y generar un informe detallado.

## Comandos

### 1. Escanear Proyecto (`scan_project`)
Ejecuta un análisis heurístico profundo (Backend, Estilos, Complejidad) y genera un reporte.

**Uso:**
> "Radar, genera un informe de estado."

**Ejecución:**
```bash
node skills/tech-radar/scripts/radar.js
```

**Salida:**
Genera un archivo `TECH_REPORT.md` en la raíz del proyecto.

## Capacidades de Análisis
1.  **Detección de Necesidad de Backend:**
    *   Analiza si hay lógica de negocio excesiva o datos mockeados en el frontend.
2.  **Deuda Técnica de Estilos:**
    *   Mide el volumen de CSS y sugiere frameworks (Tailwind) si la complejidad es alta.
3.  **Seguridad y Prácticas:**
    *   Busca patrones peligrosos (API Keys expuestas).
4.  **Oportunidades MCP:**
    *   Sugiere conexiones (Supabase, GitHub) basadas en el stack detectado.

## Flujo de Trabajo
1.  Ejecuta `scan_project`.
2.  Lee `TECH_REPORT.md`.
3.  Aprueba manualmente las acciones sugeridas.
