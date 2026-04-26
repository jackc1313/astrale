# Astrale — Fase 3 Design Spec (Engagement)

## Overview

Fase 3 implementa le feature di engagement: sistema streak con badge, notifiche push locali, storico letture con calendario, e rewrite completo del profilo.

---

## 1. Sistema Streak

### Logica

- Apertura app → confronta `lastOpenDate` (MMKV) con oggi
- Se ieri → `currentStreak++`
- Se oggi → noop
- Se piu' vecchio → `currentStreak = 1`
- Aggiorna `longestStreak` se superato
- Controlla e assegna badge automaticamente

### Implementazione

- Hook `useStreak` eseguito nel root layout (`app/_layout.tsx`) a ogni apertura app
- Legge/scrive `UserStreak` in MMKV tramite `storageService`

---

## 2. Badge

4 badge collezionabili, salvati in `UserStreak.badges`:

| Badge | ID | Condizione |
|-------|-----|-----------|
| 7 giorni | `7_days` | `currentStreak >= 7` |
| 30 giorni | `30_days` | `currentStreak >= 30` |
| 100 giorni | `100_days` | `currentStreak >= 100` |
| Tutti gli arcani | `all_arcana` | `collectedCards.length === 22` |

### UI

- Griglia orizzontale scrollabile nel profilo
- Badge ottenuti: icona + nome in oro
- Badge non ottenuti: icona in grigio + barra progresso (es. "12/22 carte")

---

## 3. Notifiche Push (locali)

Tutte locali con Expo Notifications, nessun server push.

| Notifica | Default | Personalizzabile |
|----------|---------|-----------------|
| Mattina — oroscopo pronto | 08:00, attiva | Si, orario |
| Sera — "Hai pescato la carta?" | Off | Si, on/off + orario |
| Streak a rischio | 21:00, auto | No |

### Implementazione

- `src/services/notifications.ts` — wrapper per Expo Notifications
  - `scheduleNotification(type, hour, minute)` — schedule repeating daily
  - `cancelNotification(type)` — cancella per tipo
  - `rescheduleAll(settings)` — rischedula tutte in base alle impostazioni

- Hook `useNotifications` — gestisce stato impostazioni e scheduling
  - Legge/scrive `NotificationSettings` in MMKV
  - Al cambio impostazioni → cancella e rischedula

- Scheduling: `Notifications.scheduleNotificationAsync` con trigger `{ hour, minute, repeats: true }`
- Contenuto notifiche: stringhe i18n
- Notifica streak a rischio: schedulata solo se `currentStreak > 0` e utente non ha aperto oggi dopo le 18:00

### NotificationSettings type

```typescript
type NotificationSettings = {
  morningEnabled: boolean;
  morningHour: number;        // default 8
  morningMinute: number;      // default 0
  eveningEnabled: boolean;
  eveningHour: number;        // default 20
  eveningMinute: number;      // default 0
};
```

Salvato in MMKV con chiave dedicata.

---

## 4. Storico Letture (Calendario)

### Data model

```typescript
type ReadingEntry = {
  type: "horoscope" | "tarot" | "wheel" | "scratch";
  summary: string;        // breve preview del contenuto
  timestamp: string;      // ISO string
};

type ReadingHistoryDay = {
  date: string;           // "2026-04-26"
  entries: ReadingEntry[];
};
```

Salvato in MMKV come array di `ReadingHistoryDay`. Chiave: `reading.history`.

### Limiti

- Free: ultimi 7 giorni
- Premium: ultimi 30 giorni
- Al salvataggio: trim automatico a 30 giorni (il piu' vecchio viene rimosso)

### UI — Calendario

- Griglia 7 colonne (Lun-Dom) x 5-6 righe
- Header: frecce navigazione mese + nome mese/anno
- Giorni con letture: dot dorato sotto il numero
- Giorno selezionato: sfondo gold muted
- Tap su giorno → mostra lista letture sotto il calendario
- Giorni futuri e oltre il limite (7/30) in grigio non tappabili

### Salvataggio ReadingHistory

Le feature esistenti devono salvare le letture:
- `useHoroscope` → salva quando l'oroscopo generale viene letto
- `useTarot` → salva quando una carta viene pescata
- `useWheel` → salva quando la ruota si ferma
- `useScratch` → salva quando il gratta viene rivelato

Hook `useReadingHistory`:
- `addEntry(type, summary)` — aggiunge entry per oggi
- `getEntriesForDate(date)` — ritorna entries per un giorno
- `getDaysWithEntries(month, year)` — ritorna set di date con entries (per i dot)

---

## 5. Profilo — Rewrite

Schermata full-screen (push da avatar nella Home). Layout dall'alto verso il basso:

1. **Back button** + titolo "Profilo"
2. **Header segno**: icona grande + nome segno + ascendente (se impostato)
3. **Streak counter**: numero grande con icona fiamma, "X giorni consecutivi", longest streak sotto
4. **Badge grid**: griglia orizzontale scrollabile
5. **Calendario storico**: componente calendario con dettaglio giorno
6. **Impostazioni notifiche**: toggle mattina/sera + time picker
7. **Banner premium**: "Passa ad Astrale Plus" (se free)

---

## File nuovi

```
src/features/profile/
├── components/
│   ├── StreakCounter.tsx          # Numero streak + fiamma + longest
│   ├── BadgeGrid.tsx             # Griglia badge con progresso
│   ├── ReadingCalendar.tsx       # Calendario mensile con dot
│   ├── ReadingDayDetail.tsx      # Lista letture per giorno selezionato
│   ├── NotificationSettings.tsx  # Toggle + time picker notifiche
│   └── index.ts
├── hooks/
│   ├── useStreak.ts              # Logica streak, eseguito al root
│   ├── useNotifications.ts       # Gestione scheduling notifiche
│   ├── useReadingHistory.ts      # CRUD storico letture
│   └── index.ts
└── types.ts                      # ReadingEntry, ReadingHistoryDay, NotificationSettings, BadgeInfo

src/services/notifications.ts     # Expo Notifications wrapper (schedule, cancel, reschedule)
```

## File modificati

- `app/_layout.tsx` — aggiungere `useStreak()` al root
- `app/profile.tsx` — rewrite completo
- `src/services/storage.ts` — aggiungere KEYS e helpers per ReadingHistory e NotificationSettings
- `src/services/index.ts` — aggiungere export notifications
- `src/features/horoscope/hooks/useHoroscope.ts` — aggiungere salvataggio ReadingHistory
- `src/features/tarot/hooks/useTarot.ts` — aggiungere salvataggio ReadingHistory
- `src/features/discover/hooks/useWheel.ts` — aggiungere salvataggio ReadingHistory
- `src/features/discover/hooks/useScratch.ts` — aggiungere salvataggio ReadingHistory
- `src/i18n/locales/it.json` — aggiungere chiavi per profilo, streak, badge, notifiche, calendario

---

## Aggiornamenti i18n

Nuove chiavi:

```
profile.streak          — "{{count}} giorni consecutivi"
profile.longestStreak   — "Record: {{count}} giorni"
profile.badges          — "Badge"
profile.history         — "Storico letture"
profile.notifications   — "Notifiche"
profile.morning         — "Oroscopo del mattino"
profile.evening         — "Carta della sera"
profile.streakAlert     — "Avviso streak"
profile.premium         — "Passa ad Astrale Plus"

badges.7_days           — "7 Giorni"
badges.30_days          — "30 Giorni"
badges.100_days         — "100 Giorni"
badges.all_arcana       — "Tutti gli Arcani"
badges.progress         — "{{current}}/{{total}}"

notifications.morning   — "Il tuo oroscopo di oggi e' pronto"
notifications.evening   — "Hai pescato la tua carta oggi?"
notifications.streak    — "Non perdere la tua serie di {{count}} giorni!"

history.horoscope       — "Oroscopo"
history.tarot           — "Tarocchi"
history.wheel           — "Ruota"
history.scratch         — "Gratta"
history.noEntries       — "Nessuna lettura per questo giorno"
history.limitFree       — "Storico limitato a 7 giorni"
```
