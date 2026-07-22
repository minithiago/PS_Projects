# /sounds

Coloca aquí tus efectos de sonido. El sistema los cargará automáticamente
si existen; si un archivo falta, se genera un tono sintético temporal con
WebAudio como sustituto (para que todo funcione sin assets).

Archivos esperados (opcionales):

| Archivo      | Evento                                   |
|--------------|------------------------------------------|
| `hover.mp3`  | Al pasar por encima de una tarjeta/botón |
| `select.mp3` | Al cambiar de proyecto (← →)             |
| `back.mp3`   | Al cerrar un panel / volver              |
| `open.mp3`   | Al abrir un proyecto o pantalla completa |
| `boot.mp3`   | Durante la intro de arranque             |

Para sustituirlos basta con dejar un archivo con el mismo nombre.
Formatos soportados por decodeAudioData: `.mp3`, `.wav`, `.ogg`, `.m4a`.

> ⚠️ Usa únicamente sonidos con licencia libre o propios. No incluyas
> sonidos oficiales de consolas comerciales (copyright).
