# Lahaina, Aug 8 2023: source-material log

Compiled 2026-11-03. The search was stopped early on the coordinator's instruction, so this log is incomplete.
Downloads are in `lahaina/assets/raw/docs/` (gitignored, local only). Copies of the small key files are kept in git under `lahaina/research/sources/` (NWS texts, GOES-18/CIRA loops, FSRI Phase 3). Large files (USCG interviews, FEMA B-roll, FSRI Phase 1–2 PDFs) are not in git — re-download from the URLs below. Status: research stopped by the owner (current Lahaina cut kept as is); the new footage-first approach applies from the next video. All times are HST (UTC-10).

## Network notes
- **Wikimedia (commons.wikimedia.org API and upload.wikimedia.org):** every request returned HTTP 429. Wikimedia is rate-limiting this session's shared egress IP. Commons pages were read through WebFetch, but **no Commons file could be downloaded**.
- **YouTube:** `yt-dlp` works for search and metadata (`--flat-playlist`). Opening a video page returns "Sign in to confirm you're not a bot" or 429. **Downloads from YouTube are effectively blocked.** I did not try cookies.
- **DVIDS:** a plain GET of a video page returned 200 with no challenge. The page links a public CloudFront `.mp4` (`d34w7g4gy10iej.cloudfront.net`). DVIDS search returns 202, which is a bot check, so I did not use it. Video IDs came from web search and from opening individual pages.
- **Blocked by the proxy (403):** mauicounty.gov, fema.gov and news.uscg.mil.
- **Reachable:** archive.org, figshare, noaa-goes18 on S3, satlib.cira.colostate.edu, mesonet.agron.iastate.edu and Flickr.

---

## (c) Downloaded AND viewed (frames extracted and checked)

| File (`assets/raw/docs/…`) | Source URL | What it shows / timecodes | Date & place confirmed by | Licence | Use for opening |
|---|---|---|---|---|---|
| `video/GOES18_truecolor_Maui_2023-08-08_0600-1920HST_10min_PD.mp4` (14 s, 84 frames, 1104×672). Raw frames are in `satellite/goes18_raw_frames/` | Built by me from NOAA GOES-18 ABI L2 CMIPF bands C01/C02/C03, `https://noaa-goes18.s3.amazonaws.com/ABI-L2-CMIPF/2023/220-221/` | Pseudo true colour over Maui, Lanai, Molokai and Kahoolawe, one frame every 10 min from 06:00 to 19:20 HST Aug 8, with an HST label burned in. 0–2 s: dawn, dark. Around 12:40 (≈6 s): clear day, strong trades. From 15:40 (≈9.5 s): a smoke plume grows west from West Maui. 18:40 (≈12.8 s): a broad brown plume over the channel toward Lanai and Molokai. | Scan start times in the file names (`_sYYYYJJJHHMM`). Day 220 = Aug 8 UTC. | **Public domain** (NOAA data). Credit "NOAA GOES-18". | "From space": the afternoon plume. Morning smoke is too small to see at 0.5–1 km resolution. |
| `video/CIRA_GOES18_FireTempGeoColor_Maui_2023-08-08_1331-1756HST_labels_…mp4` (+ `_nolabels`), 4.5 s, 1920×1080 | https://satlib.cira.colostate.edu/event/maui-wildfires/ (file `202308082331-202308090356_g18_conus_firetempgeocolor_maui-fires_labels.mp4`) | GeoColor + Fire Temperature over the Hawaiian chain. Frame stamp 23:41 UTC (13:41 HST): no hotspot. 02:01 UTC (16:01 HST): red hotspot on the west coast of West Maui (Lahaina). 03:56 UTC (17:56 HST): bright hotspot and a dark smoke plume streaming west over Lanai and Molokai. | Burned-in UTC stamps. CIRA caption: "Wildfires in Maui… prompting residents along the west coast to evacuate." The same file is on Commons as `File:Wildfires in Mauai, Hawaii Prompt Evacuations (CIRA 2023-08-09 - labels).webm`. | CIRA allows free use with the credit **"CSU/CIRA & NOAA"**. Commons tags it PD-USGov-NOAA. Keep the credit. | The **afternoon flare-up in real time**, 14:55 → town ablaze. Strongest single satellite asset. |
| `video/CIRA_GOES18_FireTemp_Maui_2023-08-08_1501HST-08-09_0631HST_overnight_labels_…mp4` (6.1 s) | same page (`202308090101-202308091631_g18_conus_firetemp_maui-fires-overnight_labels.mp4`) | Night fire-temperature view. 01:26 UTC (15:26 HST): West Maui glowing. 15:11 UTC Aug 9 (05:11 HST): hot line along the Lahaina coast through the night. | Burned-in stamps | Same as above (CSU/CIRA & NOAA) | The fire burning overnight |
| `video/USCG_StationMaui_crew_interview_Part1_…DVIDS940486_PD.mp4` (12:36, 1080p, with sound) | https://www.dvidshub.net/video/940486 (mp4: https://d34w7g4gy10iej.cloudfront.net/video/2410/DOD_110627768/DOD_110627768.mp4) | Five Station Maui crew members sit in front of lockers and talk about the night of Aug 8. A contact sheet every 40 s confirms it is a static interview throughout, with no B-roll. I did not make a transcript (stopped), so there are no quote timecodes yet. | DVIDS caption: interviews at Station Maui, Wailuku, **Feb 5, 2024**. "Boat crew members rescued over 40 people… Aug. 8, 2023." Video by PO2 Tyler Robertson. | **Public domain** (USCG) | First-person **sound** of the sea rescue: voice-over or soundbites. Not footage of Aug 8. |
| `video/FEMA_Broll_Lahaina_2023-08-12_DVIDS893660_PD.mp4` (12:49, with sound) | https://www.dvidshub.net/video/893660 (also on Commons as `File:B-Roll of Hawaii Wildfire.webm`) | **Aftermath, Aug 12.** Banyan and seawall (0:40), burned cars (4:00, 7:20), FEMA and officials walking Front Street (4:40), an MFD crew (6:00), FEMA interview (8:00–10:00), a burned boat on the harbor seawall (11:20). | DVIDS caption (it says "Wailuku" by mistake) | **Public domain** (FEMA, Dominick Del Vecchio) | Probably already in `public/vid`. Aftermath only. |
| `photos/2023-08-08_1920HST_Fire_above_Kihei_Kahunapule-Michael-Johnson_CC-BY-SA-2.0.jpg` (4032×3024) | https://www.flickr.com/photos/kahunapulej/53110609698/ (also Commons `File:August_8_Fire_above_Kihei.jpg`) | Large fire and smoke above rural Kihei at dusk | EXIF (iPhone): 2023-08-08 19:20:24 | **CC BY-SA 2.0**. Credit "Kahunapule Michael Johnson". | **Not Lahaina.** This is the Pulehu/Kihei fire on the same night. Use only as "other fires on Maui that night". |

## (b) Downloaded, not viewed as video (documents and text)

| File | Source | Content | Licence | Notes |
|---|---|---|---|---|
| `video/USCG_StationMaui_crew_interview_Part2_…940487`, `Part3_…940488`, `Part5_…940489` (12:01 / 11:22 / 3:16) | dvidshub.net/video/940487, 940488, 940489 | Continuation of the same Feb 5, 2024 crew interview. A Part 3 contact sheet showed the same talking-head set-up. Part 4 was not found. | PD (USCG) | Need a transcript to find the rescue soundbites. |
| `nws/nws_RFWHFO_…txt`, `nws_NPWHFO_…`, `nws_AFDHFO_…`, `nws_FWFHFO_…` | IEM AFOS archive, e.g. https://mesonet.agron.iastate.edu/cgi-bin/afos/retrieve.py?pil=RFWHFO&sdate=2023-08-05T00:00Z&edate=2023-08-09T12:00Z&limit=100&fmt=text | Full NWS Honolulu texts. **Fire Weather Watch** Aug 6 3:33/4:01 AM. **Red Flag Warning** first issued **Aug 7 3:15 AM** ("East winds 30 to 45 mph with gusts over 65 mph expected"), reissued 3:55 PM Aug 7, 3:17 AM Aug 8, and 3:39 PM Aug 8 (extended to 6 PM Wed, "Any fires that develop will likely spread rapidly"). **High Wind Warning** 3:18 AM Aug 8: "Damaging winds may blow down trees and power lines". Area forecast discussions mention Hurricane Dora. | **Public domain** (NWS) | Exact on-screen quotes for "what people knew". |
| `fsri/FSRI_Lahaina_Phase1_…pdf`, `Phase2_…pdf`, `Phase3_…pdf` | https://ulri.figshare.com/articles/report/Lahaina_Fire_Comprehensive_Timeline_Report/28062371 , …/26858962 , …/28074944 | AG/FSRI reports. Phase 1 timeline: AM fire 06:34/06:35, E3 reports "500 by 500 brush fire" 06:42, PM fire from 14:55. It includes stills from civilian videos (Front St, Shaw St, Lahainaluna Rd; Figs 4.3.1.11–4.3.1.29). | Figshare lists **CC BY-SA 4.0**. Embedded third-party images are **not** clearly covered (see the licence problems below). | Use for facts and FSRI's own maps and progression graphics. |

## (a) Links found, not downloaded

### Aug 8 itself: ground video (all copyrighted unless noted)

| Item | URL | Content / date | Licence | Note |
|---|---|---|---|---|
| MPD body-camera compilation (about 16 min, released Oct 30, 2023) | Copies: https://www.youtube.com/watch?v=llnpz6bJjSo (LiveNOW from FOX, 5:40), https://www.youtube.com/watch?v=lDPuy7Yi2rk (Island News, 4:34). Coverage: https://mauinow.com/2023/10/30/maui-police-release-body-worn-camera-footage-from-aug-8-wildfires/ | Aug 8, 15:00–18:45. Door-to-door evacuations, forcing gates (Kanakea Loop 16:43), a garden hose on a shed, and 15 people evacuated from the Coffee Bean on Front St near Foodland (18:42). | County public record. **Copyright status of county works is unclear** (not US-federal PD). News copies are copyrighted. | Best "inside the fire" material. Ask MPD/County for the original file and permission. The AG database (≈850 GB, bodycam/911/EOC) is at https://ag.hawaii.gov/maui-wildfire-investigation-resources-page/ |
| 911 audio (about 2 h, 15:30–17:30 Aug 8, released Oct 2023 to AP) | https://www.youtube.com/watch?v=oI9WEeMKfx0 (HNN), https://www.youtube.com/watch?v=WECuX4cqD3s (Star-Advertiser) | Callers trapped in traffic and at locked gates. Dispatchers: "Leave if you have to leave." | County record. News packages are copyrighted. | Get the raw files from the County or the AG database. |
| Jonathan Herzog, "Maui Lahaina Wild Fire Escape" (41 min) | https://www.youtube.com/watch?v=E-KYfmH6_kw | Window washer on Front St during the evacuation and roadblock, Aug 8 afternoon | © uploader | Licence from the author |
| Adam Borowiec, "Front Street Lahaina August 8" | https://www.youtube.com/watch?v=486A4mCkmUk | Eyewitness, Front St | © | Licence |
| Sean Pasin, "Lahaina Front Street August 8, 2023 Fires" (28 s) | https://www.youtube.com/watch?v=iw8DIoVUZGg | Eyewitness | © | Licence |
| Natalie, "Lahaina Maui fire started. August 8, 2023, 3:54 pm" (21 s) | https://www.youtube.com/watch?v=_Gw1_KBInXU | Claims to show 15:54 | © | Verify, then licence |
| "Lahaina Roadblock 3: Police cut off Front st." | https://www.youtube.com/watch?v=lcLh7bZ5NIM | Roadblock during the evacuation | © | Contested-roadblocks story |
| Island News, "Video shot by Lahaina residents appears to show roadblocks" | https://www.youtube.com/watch?v=Qg2sfqTiGnc | Compilation of resident video | © KITV | |
| Morning ignition and power-line videos (Shane Treu's 911 call 06:37; Star-Advertiser package) | https://www.youtube.com/watch?v=p2cU1x2jKLM | Downed lines and the morning fire on Lahainaluna Rd | © | Morning-fire scene |
| Harbor smoke and boats (9NEWS, KPRC) | https://www.youtube.com/watch?v=LP9wR8vqFys , https://www.youtube.com/watch?v=MQFx4DsLpYo | Smoke at Lahaina Harbor, Aug 8 | © | |
| People in the ocean / seawall | https://www.youtube.com/watch?v=xwTlxFIRMcI (NY Post), https://www.youtube.com/watch?v=TH4psF-wnoo (Independent), https://www.youtube.com/watch?v=vQPKq7CtKY0 (HNN) | Aug 8 evening, people sheltering in the water | © | |
| AP, "Coast Guard rescues people escaping wildfire in ocean off Maui" | found by yt-dlp search (AP channel, 2023-08-12, 71 s) | | © AP | |
| Maui Now, "Lahaina Wildfire Aftermath – Aug. 8, 2023" (14 min) | https://www.youtube.com/watch?v=D9jR0e4uk-k | Title says Aug 8. Check whether it is that night or the next day. | © Maui Now | |
| archive.org mirror, "Video footage of beginning of Maui Lahaina firestorm…" | https://archive.org/details/youtube-nJsWkayQx48 | Re-upload by a third party | © original author | Source unknown |
| Pre-fire Front St dashcam, Aug 4–6, 2023 | https://www.youtube.com/watch?v=uEcJook9_c4 | "Before" | © | |
| **Pre-fire Lahaina (2017), CC BY 3.0** | https://commons.wikimedia.org/wiki/File:Lahaina_,Hawaii.webm (from YouTube QD3c3yKf9P4, Le Monde en Vidéo) | Town tour, 6:08 | **CC BY 3.0** | Free "before" footage. Download failed because Wikimedia returned 429. |

### Federal / official
| Item | URL | Content | Licence |
|---|---|---|---|
| USCG press briefing, Capt. Aja Kirksey, Aug 11, 2023 | https://www.dvidshub.net/video/893573 | Briefing on the Aug 8–9 rescues | PD. mp4 exists on CloudFront; not downloaded. |
| HIANG C-17 airlifts HFD to Maui, Aug 10 | https://www.dvidshub.net/video/893485 | First-days response | PD |
| Hawaii National Guard CERF-P search, Lahaina, Aug 10 (3 clips) | https://www.dvidshub.net/video/893509 , 893510 , 893511 , 893750 | Search and recovery in the burn zone | PD |
| USCG UAS drone of Lahaina Harbor, Sep 5, 2023 | https://www.dvidshub.net/video/897260 | Aerial view of the burned harbor | PD |
| JTF-50 arrival Aug 14; relief Aug 14; HING Aug 15 | dvidshub.net/video/893827 , 893828 , 894060 | Later response | PD |
| USCG photos on Commons | `Coast Guard Station Maui - 7964748.jpg` (Aug 9, PO3 David Graham), `2023 Maui fires - Lahaina damage via Coast Guard.jpg` (harbor damage, dated Aug 8, no EXIF), `Coast Guard - 7970837.jpg` (Adm. Day with the Station Maui crew, Aug 10), `Coast Guard - 7965023.jpg` (Cutter Juniper loads boats, Aug 10) | | PD. Not downloaded (429). |
| Civil Air Patrol aerials | Commons `Maui-fire-1.jpg` (2560×1706), `Us-civil-patrol countyofmaui lahainaoverview.jpg`, `Os-lahaina-town-fire.jpg` (900 block of Front St, burned cars) | Aerials from the morning of Aug 9. Commons gives Aug 8 for one; CAP says the flights left at 09:30 and 12:54 on **Aug 9**. | Commons claims PD-USGov. **Doubtful** (see below). |
| Commons night photo, `Lahaina fire - 8 august.jpg` (4898×3265) | https://commons.wikimedia.org/wiki/File:Lahaina_fire_-_8_august.jpg | Lahaina burning on the night of Aug 8, seen from Wailea across the bay | **CC BY-SA 4.0**, Wtp22 | Good event still. Download failed (429). |
| CIMSS GOES-18 loops (5-min Fire RGB/SWIR, 3.9 µm peak 133 °C and 1885 MW at 16:46 HST) | https://cimss.ssec.wisc.edu/satellite-blog/archives/53841 | Science loops | University of Wisconsin. Terms not confirmed, so not downloaded. |
| Commons category Lahaina (111 files, mostly aftermath from Aug 10–21) | https://commons.wikimedia.org/wiki/Category:2023_Hawaii_wildfires_in_Lahaina | | PD/CC; list read via WebFetch |
| MPD final After-Action Report (Aug 2025) | https://www.mauipolice.com/_files/ugd/fefc36_d7b72f6a0ca9458d93391093da02fe1e.pdf | Text | County document |
| Hawaii DOT traffic cameras | not searched (search stopped) | | |

---

## Licence and usage problems
1. **FSRI reports are CC BY-SA 4.0, and ShareAlike applies.** Any adapted FSRI graphic in the film carries the SA obligation. The reports also embed **civilian video stills** and **Pacific Disaster Center** images ("Commercial use is permitted only with explicit approval of PDC"). These are not covered by the CC licence. Do not lift them from the PDF.
2. **Civil Air Patrol photos:** Commons labels them PD-USGov. CAP is a volunteer auxiliary, and its photos are not automatically federal works. `Os-lahaina-town-fire.jpg` was sourced from a Maui News slideshow. Treat both as **unverified PD**.
3. **County material** (MPD body cameras, 911 audio, County press conferences) is a public record, but **not public domain**. It needs permission or a fair-use decision.
4. **CIRA loops:** free to use, but the credit "CSU/CIRA & NOAA" must be shown.
5. **The Kihei photo is a different fire.** Do not caption it as Lahaina.
6. **FEMA B-roll on DVIDS and Commons says "Wailuku".** The footage is Lahaina on Aug 12. It is aftermath, not the event.
7. **USCG crew interviews were filmed in Feb 2024.** Label them as later interviews, not as footage from the night.

## Factual notes against `research/facts.md`
- **Red Flag Warning:** the original NWS texts confirm the P2 table. The first RFW was issued **Aug 7, 3:15 AM HST**, with gusts "over 65 mph expected". A Fire Weather Watch preceded it on Aug 6, 3:33 AM. Wikipedia's "5:00 a.m. Aug 7" is wrong.
- Two more NWS products to add: the **3:39 PM Aug 8** reissue (extended to 6 PM Wednesday, "Any fires that develop will likely spread rapidly") and the High Wind Warning at **3:18 AM Aug 8**.
- **GOES-18 timing:** the Lahaina hotspot is first clearly visible by 16:01 HST, and its peak intensity was at 16:46 HST (CIMSS). That fits the flare-up at 14:55 and the fire reaching town by about 16:24.
- I did not review the current cut of the video, so I cannot list errors in it.
