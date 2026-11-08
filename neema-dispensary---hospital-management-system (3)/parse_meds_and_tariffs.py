import csv
import json

# Let's inspect tariffs_pricelist_aistudio_a5d7912b.csv
with open('public/assets/aistudio/tariffs_pricelist_aistudio_a5d7912b.csv', 'r') as f:
    tariffs = list(csv.reader(f))

print(f"Total tariffs rows: {len(tariffs)}")
