# Bahia Investment

CRM para venta de lotes, con oportunidades por proyecto y asesor, seguimiento comercial, embudo con requisitos de avance y ventas por mes.

## Aplicación operativa

https://lotes-gestion-comercial-marru.litodamm.chatgpt.site/

La aplicación publicada es privada y guarda los registros reales en su base de datos. Este repositorio contiene código, no datos de clientes ni credenciales. Se retiraron los clientes ficticios y el uso de datos antiguos del navegador como fuente inicial.

## Construcción

Requiere Node.js. Ejecuta `npm run build` para generar el Worker con los archivos de interfaz embebidos. La base D1 y las migraciones se configuran en `.openai/hosting.json` y `drizzle/`.

La interfaz necesita el servicio `/api/state`; abrir únicamente `index.html` o alojarlo en GitHub Pages no instala la base de datos. Cuando el servicio no está disponible, muestra un estado sin datos, nunca datos ficticios.

## Datos y sincronización

Fuentes iniciales: Leads Veranorte y Leads Grand Bay, de los CRM compartidos por el propietario. La importación conserva los campos originales y asigna IDs internos estables para mantener clientes distintos aunque compartan ID en Sheets. Los nombres abreviados y completos de Maria Camila Gómez y Maria José Mercado se unifican solo para filtrar; no se cambian responsables en las hojas. Registros asignados a Luisa o sin responsable se conservan.

La actualización diaria configurada en Codex usa fuentes de solo lectura, conserva cambios comerciales locales y registra conflictos. El secreto de servicio se configura exclusivamente en el alojamiento.

## Seguridad de alojamiento

Mantén esta aplicación bajo la política privada de Sites. La identidad real la establece ChatGPT; el nombre y PIN de la pantalla comercial no sustituyen autenticación. La ruta `/api/sync` requiere la clave de servicio configurada en `CRM_SYNC_KEY`, además del acceso de servicio de la publicación privada. No publiques registros de clientes como JSON ni incorpores credenciales al repositorio o a los archivos del navegador.
