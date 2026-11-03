# Tarjetas digitales AIC

Tarjetas publicadas con GitHub Pages en `https://equipo-aic.github.io/tarjetas-digitales/`.

## Qué hay

| Archivo | Uso |
|---|---|
| `Nombre-Apellido.html` + `.vcf` | Tarjeta de cada persona. Es la página que abre el QR. **No mover ni renombrar**: los QR impresos apuntan aquí. |
| `app/<persona>/` | App instalable de cada persona (*Mostrar mi QR*, *Mostrar mis datos*, *Compartir mi tarjeta*). Su `index.html` indica qué tarjeta abre y el enlace exacto de su QR. |
| `app/app.js`, `app/app.css`, `app/img/`, `app/vendor/` | Código e imágenes comunes de la app. |
| `sw.js` | Permite abrir la app sin internet. Solo lo usan quienes instalan la app. |

La app no duplica datos: nombre, cargo y foto se leen de la tarjeta de cada persona. Si se actualiza la tarjeta, la app se actualiza sola.

## Enlace de instalación de cada persona

- Javier Lagos: https://equipo-aic.github.io/tarjetas-digitales/app/javier-lagos/
- Jose Luis Parra: https://equipo-aic.github.io/tarjetas-digitales/app/jose-luis-parra/
- Carolina Fuenzalida: https://equipo-aic.github.io/tarjetas-digitales/app/carolina-fuenzalida/
- Addirianni Urdaneta: https://equipo-aic.github.io/tarjetas-digitales/app/addirianni-urdaneta/
- Martina Silva: https://equipo-aic.github.io/tarjetas-digitales/app/martina-silva/
- Madina Ortiz: https://equipo-aic.github.io/tarjetas-digitales/app/madina-ortiz/

## Agregar a una persona

1. Subir su tarjeta (`Nombre-Apellido.html` y `.vcf`) a la raíz, como hasta ahora.
2. Copiar la carpeta `app/javier-lagos/` con el nombre nuevo (ej. `app/maria-perez/`) y cambiar:
   - en `index.html`: el `<title>`, `maria-perez` (dos veces), `tarjeta` y `qr`;
   - en `manifest.webmanifest`: `id` (`/tarjetas-digitales/app/maria-perez/`) y `name`.
3. Esperar unos 10 minutos después de subir y enviarle su enlace: `https://equipo-aic.github.io/tarjetas-digitales/app/maria-perez/`.

## Actualizaciones

Los teléfonos toman cualquier cambio (tarjeta o app) la próxima vez que abren la app con internet. Sin internet muestran la última versión guardada.
