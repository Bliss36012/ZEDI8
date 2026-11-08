import csv
import json
import re

# Let's read tariffs_pricelist_aistudio_a5d7912b.csv
tariffs_items = []
with open('public/assets/aistudio/tariffs_pricelist_aistudio_a5d7912b.csv', 'r', encoding='utf-8') as f:
    r = csv.reader(f)
    current_category = ''
    category_key = ''
    for row in r:
        if not any(row): continue
        sn, product_name, price, sitl_review, notes = (row + ['', '', '', '', ''])[:5]
        if 'B:LABORATORY' in product_name:
            current_category = 'B: LABORATORY INVESTIGATION'
            category_key = 'laboratory'
            continue
        elif 'C:CONSULTATION' in product_name:
            current_category = 'C: CONSULTATION'
            category_key = 'consultation'
            continue
        elif 'D: RADIOLOGICAL' in product_name or 'D:RADIOLOGICAL' in product_name:
            current_category = 'D: RADIOLOGICAL IMAGING'
            category_key = 'radiology'
            continue
        elif 'E:EYE' in product_name:
            current_category = 'E: EYE PROCEDURES'
            category_key = 'eye'
            continue
        elif 'F:PROCEDURE' in product_name:
            current_category = 'F: PROCEDURE'
            category_key = 'procedure'
            continue
        elif 'G:ADMISSION' in product_name:
            current_category = 'G: ADMISSION FEE'
            category_key = 'admission'
            continue
        if product_name and product_name != 'PRODUCT_NAME' and price:
            try:
                p_val = int(float(price))
            except:
                p_val = 0
            if p_val > 0:
                tariffs_items.append({
                    'sn': sn,
                    'name': product_name.strip(),
                    'category': current_category,
                    'categoryKey': category_key,
                    'price': p_val,
                    'sitlReview': sitl_review.strip(),
                    'notes': notes.strip()
                })

print(f"Loaded {len(tariffs_items)} items from tariffs_pricelist CSV.")
