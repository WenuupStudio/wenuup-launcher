# Mods locales

Esta carpeta está **vacía a propósito** en el repositorio público.

## Por qué

Los `.jar` de los mods **no se publican** por dos motivos:

1. **Licencias**: cada mod pertenece a su autor y no todos permiten redistribuir su
   archivo fuera de un modpack oficial.
2. **Tamaño**: entre los dos packs suman unos **150 MB** de binarios que no aportan
   nada al código fuente.

El **instalador oficial** ya trae los mods dentro, así que los jugadores no necesitan
clonar el repositorio: descargan el `.exe`, y este copia los mods a la carpeta del
juego la primera vez.

## Qué hace el launcher si falta un `.jar`

El launcher detecta que el archivo no está y **lo salta**. El juego arranca igual,
solo sin ese mod. En el log verás un aviso como:

```
Omitiendo Xaero's Minimap: no incluido en el repositorio, requiere licencia propia.
El juego arranca sin el.
```

## Cómo reconstruir el build completo (dueño del servidor)

1. Consigue los `.jar` con los nombres exactos que aparecen en el
   [listado de mods](../../README.md#-listado-de-mods).
2. Cópialos en `assets/mods/optimizado/` o `assets/mods/hard/` según el pack.
3. Verifica que el SHA-1 coincida con `wenuup.config.json` (el launcher lo comprueba
   después de copiarlos).
4. Recompila con `npm run dist`.

No hay que cambiar nada más: `wenuup.config.json` ya declara cada mod con su
`local`, `size` y `sha1`.

## Créditos

Cada mod es propiedad de su autor. Minecraft es de Mojang Studios y Fabric de
FabricMC. Wenuup Studio no reclama ningún derecho sobre ellos.
