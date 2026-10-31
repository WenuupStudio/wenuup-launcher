<div align="center">

# Wenuup Studio Launcher

**Launcher oficial de Wenuup Studio Live** para Minecraft Java Edition · Fabric 1.21.1

**Código abierto. Sin telemetría. Sin scripts ocultos. Puedes leer cada línea.**

[![Código abierto](https://img.shields.io/badge/c%C3%B3digo-abierto-blue)](LICENSE)
[![Licencia](https://img.shields.io/badge/licencia-MIT-green)](LICENSE)
[![Versión](https://img.shields.io/badge/versi%C3%B3n-1.3.1-orange)](package.json)

### ⬇️ Descargar

| | |
|---|---|
| **📋 Página de la versión** (con notas) | [github.com/WenuupStudio/wenuup-launcher/releases/tag/1.3.1](https://github.com/WenuupStudio/wenuup-launcher/releases/tag/1.3.1) |
| **💾 Descarga directa** (`Wenuup Studio Launcher Setup 1.3.1.exe`) | [⬇️ click aquí](https://github.com/WenuupStudio/wenuup-launcher/releases/download/1.3.1/Wenuup%20Studio%20Launcher%20Setup%201.3.1.exe) |
| **🟢 Versión portable** (`Wenuup-Studio-Launcher.exe`) | [⬇️ click aquí](https://github.com/WenuupStudio/wenuup-launcher/releases/download/1.3.1/Wenuup-Studio-Launcher.exe) |
| **🔄 Siempre la última** | [releases/latest](https://github.com/WenuupStudio/wenuup-launcher/releases/latest) |

**224,8 MB** · Windows 10/11 · sin instalar Java · **los mods ya vienen incluidos**

<details>
<summary><b>🔐 Verifica que el archivo no fue modificado (SHA-256)</b></summary>

| Archivo | SHA-256 |
|---|---|
| `Wenuup Studio Launcher Setup 1.3.1.exe` | `5f57fcef6feec8a16fd1c0b19a37cd479cfd7d3536652a540935e2ba0ab894a8` |
| `Wenuup-Studio-Launcher.exe` | `ca125d92f9fc7bf6d0697ab4a87da2b588f6f3da78171dadb6cdc4c671c7028c` |

En PowerShell:

```powershell
Get-FileHash ".\Wenuup Studio Launcher Setup 1.3.1.exe" -Algorithm SHA256
```

El resultado debe ser **idéntico**. Si no lo es, no lo instales y avísanos.
</details>

> **⚠️ La primera vez descarga ~1 GB** (Java 21 + librerías y assets de Minecraft + Fabric). Es normal.
>
> **🛡️ Si Windows te muestra "Windows protegió tu PC":** es porque el launcher todavía
> no está firmado digitalmente. No es un virus → *Más información* → *Ejecutar de todas formas*.
> Solo se pide una vez. [Te lo explicamos aquí](#por-qué-windows-avisa).

</div>

---

## ¿Esto es un virus?

**No.** Y como no puedes creer a un desconocido, aquí está la prueba:

| Cómo lo compruebas | Qué encontrarás |
|---|---|
| Abre `main.js` | Son unas 450 líneas. Puedes leerlas todas |
| Mira a qué dominios se conecta | Solo los de la lista de abajo |
| Busca código que robe datos | No existe. Nada de keylogs ni lectura de contraseñas |
| Compílalo tú mismo | `npm install && npm run dist` sale un `.exe` equivalente |

> El aviso de Windows aparece en **todos** los `.exe` sin certificado de firma.
> Le pasa igual a cualquier servidor de Minecraft que distribuya su launcher.
> No significa nada por sí solo.

---

## A qué se conecta este launcher

Estos son **todos** los servidores a los que el launcher envía algo:

| Dominio | Para qué |
|---|---|
| `api.adoptium.net` | Descargar **Java 21** (Eclipse Adoptium, gratuito) |
| `maven.fabricmc.net` / `meta.fabricmc.net` | Descargar e instalar **Fabric** |
| `piston-data.mojang.com`, `libraries.minecraft.net`, `resources.download.minecraft.net` | Descargar **Minecraft 1.21.1** (versión, librerías y assets) |
| `api.mcsrvstat.us` | Contar jugadores conectados para el botón "en línea" (servidor: `mc.wenuupstudio.cl:25662`) |
| `login.microsoftonline.com` / `xboxlive.com` | Solo si entras con cuenta **Premium** |

**Eso es todo.** No hay analítica, ni trackers, ni envío de datos. Tampoco se conecta a
Modrinth ni CurseForge: **los mods vienen dentro del instalador**.

El launcher **no lee ni envía** nada de tu equipo: ni contraseñas, ni cookies del
navegador, ni tokens de otros juegos, ni archivos personales. Tu cuenta de
Microsoft se autentica **directo contra Microsoft**: nunca pasa por un servidor nuestro.

---

## Qué hace

- **Un solo instalador** — no necesitas Node, ni Java, ni nada
- **Java 21 automático** — si no lo tienes, lo descarga solo
- **Fabric 1.21.1** con el loader actualizado
- **Pack Optimizado** de 50 mods de rendimiento y calidad
- **Pack Hard** de 83 mods con animaciones y utilidades
- **Login Microsoft** (Premium) o **Sin cuenta** (offline)
- **Selector de RAM** 4 / 8 / 12 / 16 GB
- **Estado del servidor** en vivo (jugadores conectados)
- **Se minimiza solo** al jugar y no muestra consola
- **Móvil / Bedrock** sigue entrando por Geyser, sin usar el launcher

---

## Compilarlo tú mismo

Requisitos: **Node.js 20 o superior**.

```bash
git clone https://github.com/WenuupStudio/wenuup-launcher.git
cd wenuup-launcher
npm install
npm run dist
```

Salida en `dist/`:

- `Wenuup Studio Launcher Setup 1.3.1.exe` — instalador
- `Wenuup-Studio-Launcher.exe` — portable

> **📦 Nota sobre los mods:** el repositorio **no incluye los `.jar`** (licencias y tamaño).
> Si compilas desde cero, el `.exe` saldrá **sin mods**. Para el build completo, copia tus
> `.jar` en `assets/mods/optimizado/` y `assets/mods/hard/` con los nombres del
> [listado de mods](#-listado-de-mods) y vuelve a compilar. El instalador oficial ya los trae.

### Configuración

Todo vive en **`wenuup.config.json`**:

```jsonc
{
  "brand": "Wenuup Studio",
  "server": {
    "name": "EVERLAND - Supervivencia Custom",
    "host": "mc.wenuupstudio.cl",
    "port": 25662
  },
  "defaultMemory": "4",
  "packs": [
    { "id": "optimizado", "label": "Optimizado" },
    { "id": "hard",      "label": "Hard" }
  ],
  "links": { "creador": {} }
}
```

Cada mod se declara con su ruta `local`, tamaño y **SHA-1**, así que el launcher
verifica que el archivo copiado sea exactamente el esperado.

---

## Estructura

```
wenuup-launcher/
├── main.js                  Toda la lógica (Java, Fabric, mods, login, launch)
├── preload.js               Puente IPC con contextIsolation
├── wenuup.config.json       Servidor, packs, mods, RAM, enlaces
├── renderer/
│   └── index.html           Interfaz (HTML + CSS + JS, sin frameworks)
├── assets/
│   └── mods/                Mods locales → ver su README
└── package.json
```

---

## 📦 Listado de mods

Los `.jar` no se publican en el repositorio. Esta es la lista exacta que incluye el
instalador; los nombres de archivo coinciden con `wenuup.config.json`.

<details>
<summary><b>Pack Optimizado — 50 mods (~40.9 MB)</b></summary>

| # | Mod | Archivo |
|---:|---|---|
| 1 | Animatica | `animatica-0.6.1+1.21.jar` |
| 2 | Api | `fabric-api-0.116.12+1.21.1.jar` |
| 3 | Better Grassify | `BetterGrassify-1.8.6+fabric.1.21.1.jar` |
| 4 | Bettermounthud | `bettermounthud-1.2.4.jar` |
| 5 | Capes | `capes-1.5.4+1.21-fabric.jar` |
| 6 | Citresewn | `citresewn-1.2.2+1.21.jar` |
| 7 | Cloth Config | `cloth-config-15.0.140-fabric.jar` |
| 8 | Continuity | `continuity-3.0.0+1.21.jar` |
| 9 | Crash Assistant | `CrashAssistant-fabric-1.20.2-1.21.4-1.11.9.jar` |
| 10 | Cwb | `cwb-fabric-3.0.0+mc1.21.jar` |
| 11 | Debugify | `Debugify-1.21.1+1.0.jar` |
| 12 | Dynamic Fps Minecraft | `dynamic-fps-3.11.4+minecraft-1.21.0-fabric.jar` |
| 13 | E4mc | `e4mc-fabric-6.1.1.jar` |
| 14 | Enhancedblockentities | `enhancedblockentities-0.10.2+1.21.jar` |
| 15 | Entity Model Features | `entity_model_features-3.2.4-1.21-fabric.jar` |
| 16 | Entity Texture Features | `entity_texture_features_1.21-fabric-7.1.jar` |
| 17 | Entityculling | `entityculling-fabric-1.10.2-mc1.21.1.jar` |
| 18 | Fabricskyboxes | `fabricskyboxes-0.7.4+mc1.21.jar` |
| 19 | Fabrishot | `fabrishot-1.14.1.jar` |
| 20 | Fastquit | `fastquit-3.0.0+1.20.6.jar` |
| 21 | Ferritecore | `ferritecore-7.0.3-fabric.jar` |
| 22 | Fsb Interop | `fsb-interop-1.4.0+mc1.21-build.54.jar` |
| 23 | Immediately Fast | `ImmediatelyFast-Fabric-1.6.10+1.21.1.jar` |
| 24 | Iris | `iris-fabric-1.8.8+mc1.21.1.jar` |
| 25 | Lambdynamiclights | `lambdynamiclights-4.8.8+1.21.1.jar` |
| 26 | Language Kotlin | `fabric-language-kotlin-1.13.12+kotlin.2.4.0.jar` |
| 27 | Language Reload | `language-reload-1.7.6+1.21.1.jar` |
| 28 | Lithium | `lithium-fabric-0.15.3+mc1.21.1.jar` |
| 29 | Main Menu Credits | `main-menu-credits-1.2.0.jar` |
| 30 | Malilib | `malilib-fabric-1.21-0.21.10.jar` |
| 31 | Midnightlib | `midnightlib-fabric-1.10.0+1.21.1.jar` |
| 32 | Mixintrace | `mixintrace-1.1.1+1.17.jar` |
| 33 | Modelfix | `modelfix-1.21-1.6-fabric.jar` |
| 34 | Modernfix | `modernfix-fabric-5.25.1+mc1.21.1.jar` |
| 35 | Modmenu | `modmenu-11.0.4.jar` |
| 36 | Morechathistory | `morechathistory-1.3.1.jar` |
| 37 | Moreculling | `moreculling-fabric-1.21.1-1.0.7.jar` |
| 38 | No Chat Reports | `NoChatReports-FABRIC-1.21.1-v2.9.1.jar` |
| 39 | Optigui | `optigui-2.3.0-beta.9+1.21.jar` |
| 40 | Paginatedadvancements | `paginatedadvancements-2.5.1.jar` |
| 41 | Placeholder Api | `placeholder-api-2.4.2+1.21.jar` |
| 42 | Polytone | `polytone-fabric-1.21-3.7.1.jar` |
| 43 | Reeses Sodium Options | `reeses-sodium-options-fabric-1.8.3+mc1.21.4.jar` |
| 44 | Rrls | `rrls-5.0.10+mc1.21.1-fabric.jar` |
| 45 | Sodium | `sodium-fabric-0.6.13+mc1.21.1.jar` |
| 46 | Sodium Extra | `sodium-extra-fabric-0.6.0+mc1.21.1.jar` |
| 47 | Voicechat | `voicechat-fabric-1.21.1-2.6.22.jar` |
| 48 | Yet Another Config Lib | `yet_another_config_lib_v3-3.8.2+1.21.1-fabric.jar` |
| 49 | Yosbr | `yosbr-0.1.2.jar` |
| 50 | Zoomify | `zoomify-2.15.2+1.21.1.jar` |

</details>

<details>
<summary><b>Pack Hard — 83 mods (~110.5 MB)</b></summary>

| # | Mod | Archivo |
|---:|---|---|
| 1 | Advancementinfo | `advancementinfo-1.20.4-fabric0.91.2-1.4.jar` |
| 2 | Animatica | `animatica-0.6.1+1.21.jar` |
| 3 | Api | `fabric-api-0.116.13+1.21.1.jar` |
| 4 | Appleskin | `appleskin-fabric-mc1.21-3.0.6.jar` |
| 5 | Architectury | `architectury-13.0.8-fabric.jar` |
| 6 | Badoptimizations | `BadOptimizations-2.4.1-1.21.1.jar` |
| 7 | Badpackets | `badpackets-fabric-0.8.2.jar` |
| 8 | Betterstats | `betterstats-3.13.9+fabric-1.21.jar` |
| 9 | C2me | `c2me-fabric-mc1.21.1-0.4.0-alpha.0.19.jar` |
| 10 | Capes | `capes-1.5.4+1.21-fabric.jar` |
| 11 | Carpet | `fabric-carpet-1.21.1-1.4.147+v240813.jar` |
| 12 | Chat Heads | `chat_heads-0.15.2-fabric-1.21.jar` |
| 13 | Cleanf3 | `CleanF3-0.4.10.jar` |
| 14 | Cloth Config | `cloth-config-15.0.140-fabric.jar` |
| 15 | Continuity | `continuity-3.0.0+1.21.jar` |
| 16 | Customskinloader Universal | `CustomSkinLoader_Universal-15.0.1.jar` |
| 17 | Customwindowtitle | `CustomWindowTitle-1.21.4+v1.4.1.jar` |
| 18 | Cwb | `cwb-fabric-3.0.0+mc1.21.jar` |
| 19 | Durabilityviewer | `durabilityviewer-1.21-1.11.0.jar` |
| 20 | Dynamiccrosshair | `dynamiccrosshair-9.11+1.21.1-fabric.jar` |
| 21 | E4mc | `e4mc-fabric-6.2.0.jar` |
| 22 | Enhancedblockentities | `enhancedblockentities-0.10.2+1.21.jar` |
| 23 | Entity Model Features | `entity_model_features-3.2.4-1.21-fabric.jar` |
| 24 | Entity Texture Features 1.21 | `entity_texture_features_1.21-fabric-7.1.jar` |
| 25 | Entityculling | `entityculling-fabric-1.10.5-mc1.21.1.jar` |
| 26 | Euphoriapatcher | `EuphoriaPatcher-1.9.3-r5.8.1-fabric.jar` |
| 27 | Exordium | `exordium-fabric-1.4.2-mc1.21.jar` |
| 28 | Fabric | `Resourcify (1.21.1-fabric)-1.8.3.jar` |
| 29 | Fastquit | `fastquit-3.0.0+1.20.6.jar` |
| 30 | Ferritecore | `ferritecore-7.0.3-fabric.jar` |
| 31 | Forcecloseloadingscreen | `forcecloseloadingscreen-2.2.3.jar` |
| 32 | Forgeconfigapiport | `ForgeConfigAPIPort-v21.1.6-1.21.1-Fabric.jar` |
| 33 | Gugle Carpet Addition | `gugle-carpet-addition-v2.12.5+build.91.jar` |
| 34 | Immediatelyfast | `ImmediatelyFast-Fabric-1.6.11+1.21.1.jar` |
| 35 | Inventoryprofilesnext | `InventoryProfilesNext-fabric-1.21.1-2.2.6.jar` |
| 36 | Iris | `iris-fabric-1.8.14-beta.1+mc1.21.1.jar` |
| 37 | Itemscroller | `itemscroller-fabric-1.21-0.24.60.jar` |
| 38 | Ixeris | `Ixeris-4.5.1+1.21.1-fabric.jar` |
| 39 | Language Kotlin | `fabric-language-kotlin-1.13.12+kotlin.2.4.0.jar` |
| 40 | Libipn | `libIPN-fabric-1.21.1-6.6.3.jar` |
| 41 | Lithium | `lithium-fabric-0.15.4+mc1.21.1.jar` |
| 42 | Main Menu Credits | `main-menu-credits-1.2.0.jar` |
| 43 | Malilib | `malilib-fabric-1.21-0.21.10.jar` |
| 44 | Mcwifipnp | `mcwifipnp-1.7.1-1.21-fabric.jar` |
| 45 | Midnightlib | `midnightlib-fabric-1.9.3+1.21.1.jar` |
| 46 | Minihud | `minihud-fabric-1.21-0.32.60.jar` |
| 47 | Mixintrace | `mixintrace-1.1.1+1.17.jar` |
| 48 | Modernfix | `modernfix-fabric-5.25.1+mc1.21.1.jar` |
| 49 | Modernui | `ModernUI-Fabric-1.21.1-3.13.0.1-universal.jar` |
| 50 | Modmenu | `modmenu-11.0.4.jar` |
| 51 | Morechathistory | `morechathistory-1.3.1.jar` |
| 52 | Moreculling | `moreculling-fabric-1.21.1-1.0.8.jar` |
| 53 | Notenoughanimations | `notenoughanimations-fabric-1.12.4-mc1.21.1.jar` |
| 54 | Obsidianui | `ObsidianUI-fabric-0.2.9+mc1.21.1.jar` |
| 55 | Optiboxes | `optiboxes-1.4+mc1.21.1-9eba186.jar` |
| 56 | Polytone | `polytone-fabric-1.21-3.8.6.jar` |
| 57 | Reeses Sodium Options | `reeses-sodium-options-fabric-2.2.2+mc1.21.1.jar` |
| 58 | Roughlyenoughitems | `RoughlyEnoughItems-16.0.799-fabric.jar` |
| 59 | Rrls | `rrls-5.0.11+mc1.21.1-fabric.jar` |
| 60 | Ryoamiclights | `RyoamicLights-fabric-0.2.11+mc1.21.1.jar` |
| 61 | Satin | `satin-2.0.0.jar` |
| 62 | Screenshot Viewer | `screenshot_viewer-1.3.3-fabric-mc1.21.jar` |
| 63 | Searchables | `Searchables-fabric-1.21.1-1.0.2.jar` |
| 64 | Serverpingerfixer | `serverpingerfixer-1.0.5.jar` |
| 65 | Shulkerboxtooltip | `shulkerboxtooltip-fabric-5.1.9+1.21.1.jar` |
| 66 | Sodium | `sodium-fabric-0.8.12+mc1.21.1.jar` |
| 67 | Sodium Extra | `sodium-extra-fabric-0.9.1+mc1.21.1.jar` |
| 68 | Stendhal | `stendhal-1.4.1-1.21.jar` |
| 69 | Syncmatica | `syncmatica-fabric-1.21-0.3.14-sakura.5.jar` |
| 70 | Tcdcommons | `tcdcommons-3.12.7+fabric-1.21.jar` |
| 71 | Tradeuses | `tradeuses-1.2.5-1.21-FABRIC.jar` |
| 72 | Tweakermore | `tweakermore-v3.31.0-mc1.21.1.jar` |
| 73 | Tweakeroo | `tweakeroo-fabric-1.21-0.21.61.jar` |
| 74 | Viafabric Main | `ViaFabric-0.4.15+84-main.jar` |
| 75 | Worldedit Mod | `worldedit-mod-7.3.8.jar` |
| 76 | Worldplaytime | `worldplaytime-1.2.2-1.21-FABRIC.jar` |
| 77 | Wthit | `wthit-1.21.1-fabric-12.10.2.jar` |
| 78 | Xaerominimap | `xaerominimap-fabric-1.21.1-26.1.0.jar` |
| 79 | Xaeroplus | `XaeroPlus-2.33.3+fabric-1.21.1-WM1.41.2-MM26.1.0.jar` |
| 80 | Xaeroworldmap | `xaeroworldmap-fabric-1.21.1-1.41.2.jar` |
| 81 | Xplus Autofish | `xplus-autofish-1.3.4-fabric-mc1.21.1.jar` |
| 82 | Yet Another Config Lib V3 | `yet_another_config_lib_v3-3.8.2+1.21.1-fabric.jar` |
| 83 | Zoomify | `zoomify-2.15.2+1.21.1.jar` |

</details>

> Cada mod pertenece a su autor. Consulta su licencia en Modrinth o CurseForge antes
> de redistribuirlo por tu cuenta.

---

## Por qué Windows avisa

Windows SmartScreen marca los ejecutables que **no están firmados** con un
certificado de pago. Firmarlo cuesta entre **USD 115 y USD 300 al año**, y hay que
renovarlo cada año.

Wenuup Studio Live es un servidor de comunidad, sin ingresos, y esa plata sale de nuestro
propio tiempo. Mientras tanto, el launcher **te avisa de esto dentro de la propia
aplicación** la primera vez que la abres, para que nadie se asuste ni lo borre.

**Para pasar el aviso:** `Más información` → `Ejecutar de todas formas`.
Solo se pide una vez.

---

## Licencia

MIT — ver [LICENSE](LICENSE).

El código es libre de usar y modificar. El nombre y la marca **Wenuup Studio Live**
pertenecen a sus titulares.

---

## Autor

**WenuupStudio** — <https://github.com/WenuupStudio>

Cliente de escritorio hecho con Electron. El juego y los mods son de sus
respectivos dueños: Minecraft es de Mojang Studios, Fabric de FabricMC, y cada
mod de su autor.
