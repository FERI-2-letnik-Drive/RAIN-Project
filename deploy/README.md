# Zagon celotnega sistema (en ukaz)

Ta mapa vzpostavi **celoten zaledni ekosistem projekta Pametni paketnik** z
eno samo skripto, na poljubnem računalniku z nameščenim Dockerjem – brez
kloniranja izvorne kode posameznih repozitorijev. Slike se potegnejo z
Docker Huba, kamor jih objavijo GitHub Actions workflowi posameznih projektov.

## Sestavni deli

| Storitev | Vir slike | Vrata |
|---|---|---|
| MongoDB | `mongo:7` | 27017 |
| ORV face API | `${DOCKERHUB_USERNAME}/orv-api` (repo ORV-Project) | 3002 |
| RAIN backend | `${DOCKERHUB_USERNAME}/smartmailbox-backend` (repo RAIN-Project) | 3001 |
| RAIN frontend | `${DOCKERHUB_USERNAME}/smartmailbox-frontend` (repo RAIN-Project) | 3000 |

## Zagon

```bash
cp .env.example .env                  # vpiši DOCKERHUB_USERNAME
cp backend.env.example backend.env    # vpiši SESSION_SECRET
./start.sh
```

Po zagonu: portal na `http://localhost:3000`, backend na `:3001`, ORV na `:3002`.
Ustavitev: `docker compose -f docker-compose.prod.yml down`.

> Opomba: razvojni `SmartMailBox/docker-compose.yml` gradi slike lokalno (za
> razvoj). Ta `deploy/` različica uporablja objavljene slike in je namenjena
> prenosljivi (production) postavitvi.

## Zakaj mobilna aplikacija (PJ) ni v Dockerju

Projekt sestavljajo zaledne storitve (ORV, RAIN backend, MongoDB) in spletni
portal (RAIN frontend) – vse to je kontejnerizirano in zajeto v tem compose.
Mobilna aplikacija (repo **PJ-project**, Android / Kotlin + Jetpack Compose) je
**odjemalec**, ki se izvaja na napravi uporabnika in se prek interneta povezuje
na zgornje storitve. Mobilne (Android) aplikacije se ne pakirajo v Docker
zabojnike – distribuirajo se kot APK/AAB in se namestijo na napravo. Zato je
za PJ ustrezen ekvivalent kontejnerizacije **CI, ki zgradi in testira APK**
(`.github/workflows/android-ci.yml`), namestitev pa je opisana v
`PJ-project/DEPLOY.md`.
