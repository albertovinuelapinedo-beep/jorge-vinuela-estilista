# Web de Jorge Viñuela Estilista

Web estática de una sola página para la peluquería unisex de Jorge Viñuela en San Vicente del Raspeig. Está preparada para alojarse en Vercel y puede subirse a GitHub sin instalar dependencias ni ejecutar compilaciones.

## Contenido

- `index.html`: página principal, descripción, servicios, contacto y datos estructurados para buscadores.
- `styles.css`: diseño adaptable a móvil, tableta y escritorio.
- `script.js`: menú móvil y año del copyright.
- `assets/salon-interior.webp`: fotografía real del interior del salón facilitada para este proyecto.
- `assets/logo.png`: logotipo adaptado a fondo claro.
- `assets/favicon.svg`: icono del sitio.
- `aviso-legal.html`: borrador informativo de aviso legal y privacidad.

## Cómo probarla en local

Abre `index.html` en un navegador. No necesita npm, claves de API ni variables de entorno.

## Cómo publicarla con GitHub y Vercel

1. En GitHub, crea un repositorio nuevo llamado `jorge-vinuela-estilista`.
2. Sube **todos los archivos y la carpeta `assets`** manteniendo la estructura. `index.html` tiene que quedar en la raíz del repositorio, no dentro de otra carpeta.
3. En Vercel, elige **Add New → Project**, importa ese repositorio y deja que detecte el sitio como estático. No hace falta configurar un framework, comando de compilación ni directorio de salida.
4. Pulsa **Deploy**. Las actualizaciones futuras de la rama principal se publicarán automáticamente cuando GitHub quede conectado a Vercel.

## Antes de anunciar la web

- Confirma que `644 37 27 56` también es el número correcto de WhatsApp del salón.
- Revisa los textos y servicios y confirma que todos se ofrecen actualmente.
- Comprueba el enlace a Google Maps tras publicar.
- Completa y valida los datos fiscales identificativos del titular en `aviso-legal.html` antes de considerar finalizado el aviso legal.
- No se ha publicado la dirección de Gmail que aparece en la cuenta de Google Ads. Si Jorge quiere mostrar un correo comercial, añádelo tras confirmarlo con él.
- El sitio no publica horario porque los directorios públicos consultados no coinciden entre sí. Es mejor confirmar el horario exacto con Jorge antes de mostrarlo.
- No se ha añadido analítica, publicidad, formulario, cookies publicitarias ni sistema de reservas.

## Datos incluidos

- Negocio: Jorge Viñuela Estilista
- Dirección: Calle Benlliure, 12, 03690 Sant Vicent del Raspeig, Alicante
- Teléfono: +34 644 37 27 56
- Contacto: WhatsApp y llamada

## Personalización rápida

- Para cambiar teléfono o enlaces de WhatsApp, busca `644372756` y `644 37 27 56` en `index.html`.
- Para cambiar la dirección, edita las referencias a `Calle Benlliure, 12` en `index.html` y `aviso-legal.html`.
- Para actualizar la fotografía principal, sustituye `assets/salon-interior.webp` por una foto autorizada del salón usando el mismo nombre.
