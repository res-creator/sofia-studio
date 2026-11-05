# Data used for the Harvey maps

- `nhc_daily_rain_tx_la.csv` — Texas and Louisiana rows of the NHC Tropical Cyclone Report rainfall supplement
  (`assets/raw/docs/NHC_harvey_rain_supplement.xlsx`, NOAA, public domain). Daily columns are as reported by each
  source (CoCoRaHS 7 a.m.–7 a.m.; HCFCD gauges midnight–midnight); `total_in` is the workbook's own Totals column
  (for PSH rows it is the storm total for the stated `period_note`). Longitudes given without a minus sign in the
  workbook were negated.
