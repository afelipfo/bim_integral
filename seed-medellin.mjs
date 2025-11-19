import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function seedMedellinData() {
  console.log("🌱 Iniciando seed de datos de Medellín...");

  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    
    // Insert projects
    console.log("📍 Insertando proyectos de infraestructura...");
    
    await connection.execute(`
      INSERT INTO projects (name, description, status, latitude, longitude, address, city, country, budget, actualCost, startDate, endDate, completionPercentage, createdBy)
      VALUES 
      (
        'Metro de la 80',
        'Sistema de metro ligero que conectará el occidente de Medellín de norte a sur. Longitud de 13.25 km con 14 paradas y 3 estaciones de integración (Caribe, San Germán, Aguacatala). Tiempo de recorrido: 32 minutos.',
        'construction',
        6.2476,
        -75.5658,
        'Avenida 80, desde Estación Caribe hasta Estación Aguacatala',
        'Medellín',
        'Colombia',
        2800000000000,
        1680000000000,
        '2020-01-15',
        '2028-12-31',
        42,
        1
      ),
      (
        'Modernización Sistema de Agua EPM',
        'Proyecto de modernización de infraestructura de acueducto y alcantarillado usando metodología BIM. Incluye 115 km de acueductos y 51 km de alcantarillado. Reducción del 15% en tiempo del proyecto.',
        'construction',
        6.2442,
        -75.5812,
        'Centro de Medellín',
        'Medellín',
        'Colombia',
        450000000000,
        382500000000,
        '2019-03-01',
        '2026-06-30',
        68,
        1
      ),
      (
        'Doble Calzada Avenida 34',
        'Proyecto de modelamiento 3D BIM premiado por Excelencia BIM Colombia 2020. Desarrollado por EDU (Empresa de Desarrollo Urbano de Medellín).',
        'completed',
        6.2167,
        -75.5901,
        'Avenida 34, Medellín',
        'Medellín',
        'Colombia',
        180000000000,
        175000000000,
        '2018-06-01',
        '2021-11-30',
        100,
        1
      ),
      (
        'Expansión Aeropuerto José María Córdova',
        'Expansión de infraestructura aeroportuaria con enfoque BIM. Incluye edificios CITAC, Policía y parqueaderos. Ubicado en Rionegro, área metropolitana de Medellín.',
        'design',
        6.1645,
        -75.4233,
        'Aeropuerto José María Córdova, Rionegro',
        'Rionegro',
        'Colombia',
        650000000000,
        0,
        '2024-01-01',
        '2027-12-31',
        15,
        1
      ),
      (
        'Tranvía de Ayacucho',
        'Sistema de tranvía que conecta el centro de Medellín con la zona nororiental. Integrado con el sistema Metro y cables alimentadores.',
        'completed',
        6.2566,
        -75.5653,
        'Calle Ayacucho, Medellín',
        'Medellín',
        'Colombia',
        420000000000,
        418000000000,
        '2012-01-01',
        '2016-03-31',
        100,
        1
      )
    `);

    // Insert BIM models
    console.log("🏗️ Insertando modelos BIM...");
    
    await connection.execute(`
      INSERT INTO bimModels (projectId, name, description, discipline, version, fileUrl, fileKey, fileType, fileSize, uploadedBy)
      VALUES
      (1, 'Metro 80 - Arquitectura', 'Modelo arquitectónico completo del Metro de la 80 incluyendo 14 estaciones', 'architecture', 3, 'https://storage.example.com/metro80-arch.ifc', 'metro80-arch-v3.2.ifc', 'IFC', 245000000, 1),
      (1, 'Metro 80 - Estructura', 'Modelo estructural de viaductos, puentes y estaciones elevadas', 'structural', 3, 'https://storage.example.com/metro80-struct.ifc', 'metro80-struct-v3.1.ifc', 'IFC', 189000000, 1),
      (1, 'Metro 80 - MEP', 'Sistemas mecánicos, eléctricos y plomería de estaciones', 'mep', 2, 'https://storage.example.com/metro80-mep.ifc', 'metro80-mep-v2.8.ifc', 'IFC', 312000000, 1),
      (2, 'Acueducto Norte', 'Modelo de red de acueducto zona norte de Medellín - 45 km', 'civil', 4, 'https://storage.example.com/acueducto-norte.ifc', 'acueducto-norte-v4.0.ifc', 'IFC', 156000000, 1),
      (2, 'Alcantarillado Centro', 'Sistema de alcantarillado del centro de Medellín - 28 km', 'civil', 3, 'https://storage.example.com/alcantarillado-centro.ifc', 'alcantarillado-centro-v3.9.ifc', 'IFC', 142000000, 1),
      (3, 'Av 34 - Vial', 'Modelo vial completo de la doble calzada Avenida 34', 'civil', 5, 'https://storage.example.com/av34-vial.ifc', 'av34-vial-v5.0.ifc', 'IFC', 98000000, 1),
      (4, 'Aeropuerto - Terminal', 'Expansión de terminal de pasajeros', 'architecture', 1, 'https://storage.example.com/airport-terminal.ifc', 'airport-terminal-v1.5.ifc', 'IFC', 278000000, 1)
    `);

    // Insert IFC models with LOD information
    console.log("📦 Insertando archivos IFC con niveles LOD...");
    
    await connection.execute(`
      INSERT INTO ifcModels (modelId, fileName, fileUrl, fileSize, ifcVersion, ifcSchema, discipline, lod, elementCount, buildingStoreys, spaces, uploadedBy)
      VALUES
      (1, 'metro80-arch-v3.2.ifc', 'https://storage.example.com/metro80-arch.ifc', 245000000, 'IFC4', 'IFC4_ADD2', 'architecture', 'LOD_350', 15420, 14, 280, 1),
      (2, 'metro80-struct-v3.1.ifc', 'https://storage.example.com/metro80-struct.ifc', 189000000, 'IFC4', 'IFC4_ADD2', 'structure', 'LOD_350', 8920, 14, 0, 1),
      (3, 'metro80-mep-v2.8.ifc', 'https://storage.example.com/metro80-mep.ifc', 312000000, 'IFC4', 'IFC4_ADD2', 'mep', 'LOD_300', 22340, 14, 280, 1),
      (4, 'acueducto-norte-v4.0.ifc', 'https://storage.example.com/acueducto-norte.ifc', 156000000, 'IFC4', 'IFC4_ADD2', 'civil', 'LOD_400', 5680, 0, 0, 1),
      (5, 'alcantarillado-centro-v3.9.ifc', 'https://storage.example.com/alcantarillado-centro.ifc', 142000000, 'IFC4', 'IFC4_ADD2', 'civil', 'LOD_400', 4920, 0, 0, 1),
      (6, 'av34-vial-v5.0.ifc', 'https://storage.example.com/av34-vial.ifc', 98000000, 'IFC4', 'IFC4_ADD2', 'civil', 'LOD_500', 3240, 0, 0, 1),
      (7, 'airport-terminal-v1.5.ifc', 'https://storage.example.com/airport-terminal.ifc', 278000000, 'IFC4', 'IFC4_ADD2', 'architecture', 'LOD_300', 18760, 3, 450, 1)
    `);

    // Insert clash detections
    console.log("⚠️ Insertando detecciones de colisiones...");
    
    await connection.execute(`
      INSERT INTO clashDetections (projectId, runId, clashType, severity, status, element1Id, element1Type, element1Discipline, element2Id, element2Type, element2Discipline, clashPoint, distance, volume, detectedBy, notes)
      VALUES
      (1, 'RUN-2025-001', 'hard', 'critical', 'active', '3x5Hj8kP5BwQc0000000001', 'IfcColumn', 'structure', '3x5Hj8kP5BwQc0000000002', 'IfcDuctSegment', 'mep', '{"x": 6.2476, "y": -75.5658, "z": 12.5}', 0.08, 0.003, 'AI', 'Colisión entre columna estructural y ducto de ventilación en Estación San Germán'),
      (1, 'RUN-2025-001', 'soft', 'high', 'reviewed', '3x5Hj8kP5BwQc0000000003', 'IfcBeam', 'structure', '3x5Hj8kP5BwQc0000000004', 'IfcPipeSegment', 'mep', '{"x": 6.2490, "y": -75.5670, "z": 8.2}', 0.15, 0.001, 'AI', 'Clearance insuficiente entre viga y tubería de agua'),
      (1, 'RUN-2025-001', 'clearance', 'medium', 'resolved', '3x5Hj8kP5BwQc0000000005', 'IfcWall', 'architecture', '3x5Hj8kP5BwQc0000000006', 'IfcCableCarrierSegment', 'mep', '{"x": 6.2510, "y": -75.5680, "z": 3.5}', 0.05, 0.0005, 'Navisworks', 'Bandeja de cables muy cercana a muro - Resuelto ajustando ruta'),
      (2, 'RUN-2025-002', 'hard', 'high', 'active', '3x5Hj8kP5BwQc0000000007', 'IfcPipeSegment', 'civil', '3x5Hj8kP5BwQc0000000008', 'IfcPipeSegment', 'civil', '{"x": 6.2442, "y": -75.5812, "z": -2.1}', 0.12, 0.004, 'AI', 'Cruce de tuberías de acueducto y alcantarillado'),
      (2, 'RUN-2025-002', 'duplicate', 'low', 'ignored', '3x5Hj8kP5BwQc0000000009', 'IfcValve', 'civil', '3x5Hj8kP5BwQc0000000010', 'IfcValve', 'civil', '{"x": 6.2450, "y": -75.5820, "z": -1.8}', 0.0, 0.0, 'AI', 'Válvula duplicada en modelo - Ignorado, es intencional para redundancia')
    `);

    // Insert BIM Execution Plans
    console.log("📋 Insertando BIM Execution Plans (BEP)...");
    
    await connection.execute(`
      INSERT INTO bimExecutionPlans (projectId, version, status, informationRequirements, levelOfInformation, commonDataEnvironment, leadAppointedParty, taskTeamLeaders, deliverables, milestones, createdBy, approvedBy, approvedAt)
      VALUES
      (1, '2.0', 'active', '{"standards": ["ISO 19650-1", "ISO 19650-2"], "formats": ["IFC4", "BCF"], "lod": "LOD 350"}', 'LOI_4', 'BIM 360', 'Metro de Medellín', '["Arquitectura: Juan Pérez", "Estructura: María González", "MEP: Carlos Rodríguez"]', '["Modelos IFC", "Planos 2D", "Reportes de colisiones", "Cronograma 4D"]', '["Diseño conceptual: 2020-06", "Diseño detallado: 2022-03", "Construcción fase 1: 2024-12", "Puesta en marcha: 2028-12"]', 1, 1, '2020-02-15'),
      (2, '1.5', 'active', '{"standards": ["ISO 19650-1"], "formats": ["IFC4"], "lod": "LOD 400"}', 'LOI_5', 'Autodesk Construction Cloud', 'EPM - Empresas Públicas de Medellín', '["Civil: Ana Martínez", "Hidráulica: Pedro Sánchez"]', '["Modelos IFC", "Planos as-built", "Datos COBie"]', '["Fase 1 Norte: 2021-06", "Fase 2 Centro: 2023-09", "Fase 3 Sur: 2026-06"]', 1, 1, '2019-04-20'),
      (3, '1.0', 'archived', '{"standards": ["ISO 19650-1"], "formats": ["IFC2x3"], "lod": "LOD 500"}', 'LOI_6', 'Trimble Connect', 'EDU - Empresa de Desarrollo Urbano', '["Vial: Luis Gómez"]', '["Modelos IFC", "Planos as-built", "Manual de mantenimiento"]', '["Diseño: 2018-12", "Construcción: 2020-06", "Entrega: 2021-11"]', 1, 1, '2018-07-10')
    `);

    // Insert coordination sessions
    console.log("🤝 Insertando sesiones de coordinación...");
    
    await connection.execute(`
      INSERT INTO coordinationSessions (projectId, title, description, sessionType, status, scheduledDate, startedAt, completedAt, organizer, participants, disciplines, agenda, decisions, actionItems)
      VALUES
      (1, 'Revisión Semanal de Colisiones - Metro 80', 'Revisión de colisiones críticas detectadas en la semana 45', 'clash_review', 'completed', '2025-11-10 09:00:00', '2025-11-10 09:05:00', '2025-11-10 11:30:00', 1, '[1, 2, 3]', '["architecture", "structure", "mep"]', 'Revisión de 15 colisiones críticas, Actualización de modelos, Definición de responsables', '["Ajustar elevación de ductos en Estación San Germán", "Reubicar columna C-45", "Aprobar cambio de ruta de cableado"]', '["Arquitectura: Actualizar modelo v3.3 - Fecha: 2025-11-17", "MEP: Validar nuevas rutas - Fecha: 2025-11-15", "Estructura: Revisar interferencias - Fecha: 2025-11-18"]'),
      (1, 'Coordinación Multidisciplinaria Mensual', 'Reunión mensual de coordinación general del proyecto Metro 80', 'coordination', 'scheduled', '2025-12-05 14:00:00', NULL, NULL, 1, '[1, 2, 3, 4, 5]', '["architecture", "structure", "mep", "civil"]', 'Estado general del proyecto, Revisión de hitos, Planificación próximo mes', NULL, NULL),
      (2, 'Aprobación Fase 2 - Sistema de Agua', 'Sesión de aprobación de diseños Fase 2 Centro', 'approval', 'completed', '2025-10-20 10:00:00', '2025-10-20 10:10:00', '2025-10-20 12:00:00', 1, '[1, 2]', '["civil"]', 'Presentación de diseños Fase 2, Revisión de cumplimiento normativo, Votación de aprobación', '["Aprobar diseños Fase 2", "Iniciar construcción en enero 2026"]', '["Preparar documentación de construcción - Fecha: 2025-12-15"]')
    `);

    // Insert quality checks
    console.log("✅ Insertando verificaciones de calidad...");
    
    await connection.execute(`
      INSERT INTO modelQualityChecks (modelId, checkType, status, issuesFound, criticalIssues, warnings, results, recommendations, checkedBy)
      VALUES
      (1, 'iso19650', 'passed', 0, 0, 0, '{"compliance": "100%", "standards": ["ISO 19650-1", "ISO 19650-2"], "checks": ["Naming convention", "Level of Information", "File format"]}', 'Modelo cumple con todos los requisitos ISO 19650', 'AI'),
      (1, 'geometry', 'passed', 0, 0, 0, '{"duplicates": 0, "overlaps": 0, "gaps": 0}', 'Geometría limpia sin errores', 'AI'),
      (1, 'metadata', 'warning', 12, 0, 12, '{"missing_properties": 12, "incomplete_classifications": 0}', 'Completar propiedades faltantes en 12 elementos', 'AI'),
      (3, 'geometry', 'failed', 8, 3, 5, '{"duplicates": 3, "overlaps": 5, "gaps": 0}', 'Corregir 3 elementos duplicados y 5 superposiciones en modelo MEP', 'AI'),
      (4, 'iso19650', 'passed', 0, 0, 0, '{"compliance": "100%", "standards": ["ISO 19650-1"], "lod": "LOD 400"}', 'Modelo de acueducto cumple estándares', 'AI')
    `);

    // Insert issues/RFIs
    console.log("📝 Insertando issues y RFIs...");
    
    await connection.execute(`
      INSERT INTO issues (projectId, title, description, type, priority, status, discipline, modelId, createdBy, assignedTo, dueDate)
      VALUES
      (1, 'Colisión crítica en Estación San Germán', 'Se detectó colisión entre columna estructural C-23 y ducto de ventilación D-45. Requiere ajuste urgente antes de construcción. Ubicación: Estación San Germán, Nivel 2.', 'clash', 'critical', 'in_progress', 'mep', 3, 1, 1, '2025-11-25'),
      (1, 'RFI: Especificación de acabados estación Aguacatala', 'Solicitud de información sobre especificaciones de acabados para pisos y muros de la estación Aguacatala. Planos no especifican material exacto. Ubicación: Estación Aguacatala, Hall principal.', 'rfi', 'medium', 'open', 'architecture', 1, 1, 1, '2025-12-01'),
      (2, 'Observación: Profundidad de tubería insuficiente', 'En sector de la Calle 50 con Carrera 65, la profundidad de instalación de tubería de acueducto es menor a la especificada en norma (1.2m vs 1.5m requerido).', 'observation', 'high', 'open', 'civil', 4, 1, 1, '2025-11-30'),
      (3, 'Issue: Drenaje pluvial en intersección', 'Falta diseño de sistema de drenaje pluvial en intersección de Avenida 34 con Calle 10. Requiere complementar diseño.', 'issue', 'medium', 'resolved', 'civil', 6, 1, 1, '2020-08-15')
    `);

    // Insert project members
    console.log("👥 Insertando miembros del equipo...");
    
    await connection.execute(`
      INSERT INTO projectMembers (projectId, userId, role)
      VALUES
      (1, 1, 'owner'),
      (2, 1, 'owner'),
      (3, 1, 'owner'),
      (4, 1, 'owner'),
      (5, 1, 'owner')
    `);

    // Insert notifications
    console.log("🔔 Insertando notificaciones...");
    
    await connection.execute(`
      INSERT INTO notifications (userId, title, message, type, isRead)
      VALUES
      (1, 'Nueva colisión crítica detectada', 'Se detectó una colisión crítica en el proyecto Metro de la 80. Requiere atención inmediata.', 'ai_alert', false),
      (1, 'RFI pendiente de respuesta', 'Tienes un RFI pendiente de respuesta en el proyecto Metro de la 80.', 'issue', false),
      (1, 'Sesión de coordinación programada', 'Sesión de coordinación multidisciplinaria programada para el 5 de diciembre.', 'project_update', false)
    `);

    await connection.end();
    
    console.log("✅ Seed de datos de Medellín completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log("   - 5 proyectos de infraestructura");
    console.log("   - 7 modelos BIM");
    console.log("   - 7 archivos IFC con LOD");
    console.log("   - 5 colisiones detectadas");
    console.log("   - 3 BIM Execution Plans");
    console.log("   - 3 sesiones de coordinación");
    console.log("   - 5 verificaciones de calidad");
    console.log("   - 4 issues/RFIs");
    console.log("   - Miembros de equipo y notificaciones");
    
  } catch (error) {
    console.error("❌ Error al ejecutar seed:", error);
    process.exit(1);
  }
}

seedMedellinData();
