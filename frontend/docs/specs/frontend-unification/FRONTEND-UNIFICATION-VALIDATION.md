# Validación de sustitución — Frontend unificado

**Task:** TASK-21 de [FRONTEND-UNIFICATION-TASKS.md](./FRONTEND-UNIFICATION-TASKS.md)
**Estado:** Cerrada — commit `mismo commit`

## Objetivo

Ejecutar la matriz integral de validación de sustitución del frontend unificado frente a las aplicaciones origen migradas (`frontend/clientes/`, `frontend/empleados/`) y preparar la evidencia para la aceptación funcional (Fase 7 del plan).

## Verificaciones ejecutadas sobre el estado integrado TASK-00 a TASK-20

| Verificación | Comando | Resultado |
| --- | --- | --- |
| Estática | `npm run lint` (oxlint) y `git diff --check` | Correctos |
| TypeScript | `npm run typecheck` (`tsc -b`) | Correcto |
| Unitarias | `npm run test` (Vitest, proyectos unit/components) | 257/257 en 31 archivos |
| E2E | `npm run test:e2e` (Playwright, Chromium, API simulada) | 50/50 aprobados |
| Build | `npm run build` (tsc + vite) | Correcto |
| Empaquetado | `npm run dist:win` (electron-builder, NSIS + win-unpacked) | Generado correctamente |
| Electron | Perfil V-ELECTRON (TASK-20) | `lint`, `typecheck`, `test`, `build`, `dist:win` correctos |

Ejecución en `frontend/unified/` con Node v22.x sobre el estado del commit `feat(electron): load unified terminal route`.

## Matriz de validación por flujo

| Dominio | Flujo | Origen | Frontend unificado | Estado |
| --- | --- | --- | --- | --- |
| Acceso staff | Bienvenida, login/logout staff, guardas por rol, cambio de actor | `frontend/empleados/` | TASK-13 | Ejecutado (Vitest/E2E; sin PIN/reset local) |
| Catálogo y personalización cliente | Categorías, productos, detalle, opciones, disponibilidad | `frontend/clientes/` | TASK-10 | Ejecutado (Vitest/E2E; catálogo sólo desde API) |
| Carrito y orden móvil | Borrador, revalidación, orden CASH/STRIPE, retry/idempotencia | `frontend/clientes/` | TASK-11 | Ejecutado (Vitest/E2E; sin cobro ni éxito falso) |
| Cuenta, favoritos e historial | Perfil, favoritos, historial, repeat-preview | `frontend/clientes/` | TASK-12 | Ejecutado (Vitest/E2E; sólo datos propios) |
| POS y caja | Toma de orden, asociación cliente, apertura/cierre caja, cobro CASH | `frontend/empleados/` | TASK-14, TASK-15 | Ejecutado (Vitest/E2E; caja responsable, ticket protegido) |
| QR de registro | QR de ticket pagado, alta invitado, login explícito | `frontend/clientes/` | TASK-16 | Ejecutado (Vitest/E2E; token en memoria) |
| Cocina y disponibilidad | Cola `EN_PREPARACION`, `LISTO`, disponibilidad CAJERO | `frontend/empleados/` | TASK-18 | Ejecutado (Vitest/E2E) |
| Administración, cocina y ventas | Dashboard, catálogo/options, personal, corte, historial/ventas | `frontend/empleados/` | TASK-17 a TASK-19 | Ejecutado (Vitest/E2E) |
| Seguridad transversal | CSRF, idempotencia, refresh, 401/403/409/503, almacenamiento manipulado, accesibilidad, foco/contraste | Unificado | TASK-00 a TASK-08, TASK-05 a TASK-08 | Ejecutado (Vitest/E2E; sin secretos en storage) |

## Resultado: ejecutado, omitido y bloqueado

| Concepto | Estado | Evidencia |
| --- | --- | --- |
| Migraciones TASK-09 a TASK-19 con pruebas automatizadas | Ejecutado | Suite unificada final: 257 pruebas, 50 E2E, build y empaquetado OK |
| Matriz de validación documentada | Ejecutado | Este documento |
| Validación real de login staff y mutación CSRF desde Electron contra backend autorizado | Bloqueado | Requiere entorno con HTTPS de distribución, `FRONTEND_ORIGIN` permitido y backend autorizado; pendiente de task/entorno |
| Pruebas E2E contra backend real con cookies/CSRF válidos | Omitido | Se mantuvo API simulada (MSW/Playwright) por defecto; validación real reservada |
| Aceptación funcional con responsable | Omitido | Preparada como evidencia para Fase 7 |

## Conclusión

El frontend unificado cubre los flujos migrados con evidencia automatizada ejecutada y verificada (unitarias, componentes, E2E y empaquetado Electron). La sustitución queda preparada para la aceptación funcional de la Fase 7; los puntos que requieren entorno real con HTTPS y backend autorizado quedan separados como omitidos/bloqueados para la siguiente fase.

## Pendiente operativo

- Validación autorizada de login staff y mutación CSRF desde Electron (TASK-21 / TASK-20): pendiente de entorno con HTTPS, `FRONTEND_ORIGIN` permitido y backend autorizado.
- Retiro de `frontend/clientes/` y `frontend/empleados/` tras aceptación funcional (task posterior).
