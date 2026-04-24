# Astrale — App Mobile di Oroscopo, Tarocchi e Spiritualità                                         
                                                                                                    
  ## Concept                                                                                          
                                                                                                      
  App mobile (iOS + Android) che offre ogni giorno oroscopo personalizzato, lettura dei tarocchi      
  e contenuti di spiritualità leggera. L'esperienza è costruita attorno a meccaniche di scoperta    
  (gira la ruota, pesca la carta, gratta per rivelare) che creano abitudine quotidiana e retention.   
   
  Target primario: donne 18-50.                                                                       
  Lingue: italiano al lancio. Inglese e spagnolo in fase 2.                                         
  Distribuzione: App Store (iOS) + Play Store (Android).                                              
                                                                                                      
  ## Tech Stack
                                                                                                      
  - **Framework**: React Native (Expo)                                                              
  - **Linguaggio**: TypeScript
  - **Navigazione**: Expo Router
  - **Stato**: Zustand
  - **Animazioni**: React Native Reanimated + Gesture Handler
  - **Storage locale**: MMKV                                                                          
  - **Push Notifications**: Expo Notifications
  - **Ads**: Google AdMob (react-native-google-mobile-ads)                                            
  - **Backend**: Supabase (auth, database, edge functions)                                          
  - **Contenuti oroscopo**: generati in batch con AI (Claude API), salvati in DB                      
  - **Analytics**: PostHog (free tier)
  - **In-App Purchases**: RevenueCat                                                                  
  - **i18n**: react-i18next + expo-localization                                                     
  - **Build & Deploy**: EAS Build + EAS Submit                                                        
                                                                                                      
  ## Internazionalizzazione
                                                                                                      
  Predisposta dal giorno zero. Nessuna stringa hardcoded nei componenti.                              
   
  locales/                                                                                            
  ├── it.json    ← lancio                                                                           
  ├── en.json    ← fase 2
  └── es.json    ← fase 2
                                                                                                      
  Tutti i contenuti generati con AI (oroscopi, interpretazioni tarocchi) vengono prodotti
  per lingua e salvati separatamente nel DB.                                                          
  La lingua dell'app segue la lingua del dispositivo, con override manuale nelle impostazioni.      
                                                                                                      
  ## Design                                                                                         
                                                                                                      
  - **Stile**: mistico ma moderno. Palette scura (deep purple #1a1028, nero #0d0d0d) con accenti      
    oro (#d4af37) e bianco perlato.
  - **Font**: serif elegante per i titoli (Playfair Display), sans-serif per il body (Inter).         
  - **Illustrazioni**: carte dei tarocchi con stile flat/minimal, non realistico.                   
    Consistenza visiva tra tutte le carte.                                                            
  - **Animazioni**: fluide e "magiche" — la carta si gira con un flip 3D, la ruota gira con
    inerzia realistica, il gratta e vinci rivela con effetto scratch.                                 
    Le animazioni sono il prodotto, non decorazione.                                                  
  - **Atmosfera**: ogni schermata deve dare la sensazione di aprire qualcosa di personale
    e misterioso — non un'app generica.                                                               
                                                                                                    
  ## Funzionalità — MVP (v1.0)                                                                        
   
  ### 1. Onboarding                                                                                   
  - Selezione segno zodiacale (con data di nascita)                                                 
  - Selezione ascendente (opzionale)
  - Selezione interessi: amore, lavoro, salute, fortuna
  - Permesso notifiche push                                                                           
  - Nessuna registrazione obbligatoria (solo device ID). Account opzionale per sync.
                                                                                                      
  ### 2. Home — Il tuo giorno                                                                       
  - Oroscopo giornaliero per il tuo segno
  - Sezione "Generale": sempre visibile gratuitamente                                                 
  - Sezioni "Amore", "Lavoro", "Fortuna": sbloccabili singolarmente con rewarded video ad
  - Indicatori visivi (stelle 1-5 per amore, lavoro, fortuna): sbloccabili con rewarded video ad      
  - Numero fortunato del giorno                                                                       
  - Colore del giorno                                                                                 
  - Affinità del giorno (segno più compatibile oggi): solo premium                                    
                                                                                                      
  ### 3. Tarocchi — Pesca la carta
  - L'utente vede un mazzo di carte a faccia in giù, disposte a ventaglio                             
  - Tap su una carta → animazione flip 3D → si rivela la carta                                      
  - Sotto la carta: interpretazione personalizzata (basata sul segno + area di interesse)             
  - Modalità:
    - **Carta del giorno**: 1 carta gratuita, una volta al giorno                                     
    - **Lettura a 3 carte** (passato/presente/futuro): rewarded ad oppure premium                     
    - **Lettura dell'amore**: rewarded ad oppure premium
                                                                                                      
  ### 4. La Ruota della Fortuna                                                                       
  - Ruota con spicchi colorati: affermazioni positive, consigli, piccole sfide quotidiane,
    numeri fortunati                                                                                  
  - Spin con gesture (swipe) → animazione con inerzia → rallenta e si ferma                         
  - 1 spin gratuito al giorno, spin extra con rewarded ad oppure premium                              
   
  ### 5. Gratta e Scopri                                                                              
  - Card con superficie "grattabile" (scratch effect con touch gesture)                             
  - Sotto: una frase del giorno, un consiglio, una mini-previsione                                    
  - Meccanica: 3 card coperte, ne scegli 1, la gratti
  - 1 gratis al giorno, extra con rewarded ad oppure premium                                          
                                                                                                      
  ### 6. Profilo e Streak
  - Il tuo segno e ascendente                                                                         
  - Streak: giorni consecutivi di apertura app                                                      
  - Badge collezionabili (7 giorni, 30 giorni, 100 giorni,
    "hai pescato tutti gli arcani maggiori")                                                          
  - Storico: oroscopi e carte degli ultimi 7 giorni (free) o 30 giorni (premium)
                                                                                                      
  ### 7. Notifiche Push                                                                             
  - Mattina (default 8:00): "Il tuo oroscopo di oggi è pronto"                                        
  - Sera (opzionale): "Hai pescato la tua carta oggi?"                                              
  - Streak a rischio: "Non perdere la tua serie di X giorni!"                                         
  - Orario personalizzabile
                                                                                                      
  ## Monetizzazione                                                                                 

  ### Free
  | Feature | Limite |
  |---------|--------|                                                                                
  | Oroscopo giornaliero — Generale | Sempre disponibile |
  | Oroscopo giornaliero — Amore, Lavoro, Fortuna | Rewarded ad per ciascuno |                        
  | Oroscopo giornaliero — Indicatori stelle | Rewarded ad |                                          
  | Oroscopo settimanale / mensile | No |                                                             
  | Tarocchi — carta del giorno | 1 al giorno |                                                       
  | Tarocchi — lettura 3 carte | Rewarded ad |                                                        
  | Tarocchi — lettura amore | Rewarded ad |                                                        
  | Ruota della fortuna | 1 spin/giorno, extra con rewarded ad |                                      
  | Gratta e scopri | 1/giorno, extra con rewarded ad |                                               
  | Affinità di coppia dettagliata | No |
  | Storico letture | 7 giorni |                                                                      
  | Temi visivi carte | Default |                                                                   
  | Ads | Banner + interstitial |                                                                     
                                                                                                      
  ### Premium "Astrale Plus" — €2.99/mese o €19.99/anno
  | Feature | Accesso |                                                                               
  |---------|---------|                                                                               
  | Oroscopo giornaliero completo | Tutte le sezioni + indicatori |
  | Oroscopo settimanale e mensile | Sì |                                                             
  | Tarocchi | Tutte le letture, illimitate |                                                         
  | Ruota della fortuna | Spin illimitati |
  | Gratta e scopri | Illimitati |                                                                    
  | Affinità di coppia dettagliata | Sì |                                                           
  | Storico letture | 30 giorni |                                                                     
  | Temi visivi carte | Esclusivi |                                                                   
  | Ads | Zero |
                                                                                                      
  ### Strategia ads                                                                                 
  - **Banner**: in fondo alla home (non invasivo)
  - **Interstitial**: dopo la seconda interazione giornaliera (non alla prima apertura)               
  - **Rewarded video**: per sbloccare sezioni oroscopo, letture extra, spin extra                     
    (l'utente sceglie di guardare l'ad → percezione positiva)                                         
                                                                                                      
  ## Contenuti                                                                                        
                                                                                                    
  ### Oroscopo                                                                                        
  - Generati settimanalmente in batch via AI (Claude API)
  - 12 segni × 7 giorni × 4 sezioni (generale, amore, lavoro, fortuna) = 336 testi/settimana          
  - Ogni sezione: ~50-80 parole                                                                       
  - Tono: positivo ma non banale, specifico, mai catastrofico                                         
  - Indicatori (stelle 1-5) generati insieme al testo                                                 
                                                                                                      
  ### Tarocchi                                                                                        
  - 22 Arcani Maggiori (MVP), 78 carte totali (v2)                                                  
  - Ogni carta ha: nome, illustrazione, significato dritto, significato rovesciato                    
  - Interpretazioni contestuali generate con AI in base a segno + area di interesse
  - Illustrazioni: commissionate o generate con AI image + curate (consistenza visiva critica)        
                                                                                                    
  ### Ruota e Gratta                                                                                  
  - Pool di ~200-300 affermazioni/consigli/sfide                                                    
  - Rotazione mensile (aggiungi 20-30 nuovi, ritira i meno engaging)                                  
  - Contenuto sempreverde, non richiede aggiornamenti urgenti                                         
                                                                                                      
  ## Metriche chiave                                                                                  
  - DAU / MAU (target: DAU/MAU ratio > 30%)                                                         
  - Retention D1, D7, D30                                                                             
  - Streak medio                                                                                      
  - Revenue per DAU (ARPDAU)                                                                          
  - Conversion rate free → premium                                                                    
  - Rewarded ad completion rate                                                                       
   
  ## Fasi di sviluppo                                                                                 
                                                                                                    
  ### Fase 1 — Fondamenta (settimane 1-2)
  - Setup progetto Expo + navigazione + i18n
  - Onboarding flow                                                                                   
  - Design system (colori, tipografia, componenti base)
  - Struttura dati e backend Supabase                                                                 
  - File di traduzione italiano                                                                       
   
  ### Fase 2 — Core Features (settimane 3-5)                                                          
  - Home con oroscopo giornaliero (free + rewarded ad gate)                                         
  - Tarocchi (pesca la carta con animazione flip)                                                     
  - Ruota della fortuna con gesture e animazione                                                      
  - Gratta e scopri                                                                                   
                                                                                                      
  ### Fase 3 — Engagement (settimane 5-6)                                                           
  - Push notifications
  - Sistema streak e badge                                                                            
  - Storico letture
                                                                                                      
  ### Fase 4 — Monetizzazione (settimane 6-7)                                                         
  - Integrazione AdMob (banner, interstitial, rewarded)
  - RevenueCat per Premium (in-app purchase)                                                          
  - A/B test posizionamento ads                                                                       
   
  ### Fase 5 — Polish e lancio (settimane 7-8)                                                        
  - Testing su dispositivi reali                                                                    
  - Performance optimization                                                                          
  - Asset per gli store (screenshot, descrizione, ASO)
  - Pubblicazione su App Store e Play Store                                                           
                                                                                                    
  ### Fase 6 — Espansione lingue (post-lancio)                                                        
  - Traduzione file i18n in inglese e spagnolo
  - Generazione contenuti oroscopo/tarocchi in 3 lingue                                               
  - ASO localizzato per store internazionali   