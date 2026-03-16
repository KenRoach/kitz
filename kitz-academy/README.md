# KitZ Academy

Conocimiento abierto de inteligencia artificial para Latinoamerica.

## Que es KitZ Academy?

KitZ Academy es la plataforma educativa del ecosistema [KitZ](https://github.com/KenRoach/kitz). Ofrece cursos libres, quizzes interactivos y documentacion abierta para desarrolladores latinoamericanos.

- 7 cursos completos (basico a avanzado)
- Quizzes interactivos y retos de codigo
- Documentacion de KitZ (OS) — gateway, agentes, tools
- 100% gratis, en espanol, open-source

## Cursos disponibles

| Curso | Nivel | Lecciones | Duracion |
|-------|-------|-----------|----------|
| Introduccion a KitZ OS | Basico | 6 | 1h 30m |
| Tu Primer Tool con Python | Basico | 8 | 2h 45m |
| API REST y el Gateway | Intermedio | 10 | 3h 20m |
| Datos con SQLite e IA | Intermedio | 10 | 3h 40m |
| Frontend con React y TypeScript | Intermedio | 12 | 4h 30m |
| Integracion con Claude API | Avanzado | 10 | 4h 15m |
| Contribuir a Open Source | Avanzado | 8 | 2h 30m |

## Ejecutar localmente

Sirve los archivos con cualquier servidor HTTP:

```bash
cd kitz-academy
python -m http.server 8000
```

Abre `http://localhost:8000` en tu navegador.

## Estructura

```
kitz-academy/
  index.html   # Pagina principal (SPA)
  curso.html   # Visor de cursos con contenido de lecciones
  README.md    # Este archivo
```

## Tecnologia

- HTML/CSS/JS puro — sin frameworks, sin build step
- Diseno dark theme responsive
- Quizzes y retos interactivos con JavaScript vanilla

## Contribuir

1. Fork el repo
2. Crea tu branch: `git checkout -b feat/mi-mejora`
3. Haz commit: `git commit -m "feat: descripcion"`
4. Push: `git push origin feat/mi-mejora`
5. Abre un Pull Request

## Licencia

Open source. Parte del ecosistema [KitZ](https://github.com/KenRoach/kitz).
