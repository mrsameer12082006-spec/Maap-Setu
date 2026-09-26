import os
import glob
import re
import csv
import xml.etree.ElementTree as ET

ns = {'ss': 'urn:schemas-microsoft-com:office:spreadsheet'}

input_dir = r"C:\Users\ayesh\OneDrive\Desktop\SIH2\lgd-validation\extracted files"
output_dir = r"C:\Users\ayesh\OneDrive\Desktop\SIH2\MaapSetu\data\lgd\2026-09-26"

files = glob.glob(os.path.join(input_dir, "*.xls"))

states_map = {} # code -> name
districts = []
subdistricts = []

for file in files:
    is_sub = "subdistrict" in os.path.basename(file).lower()
    
    try:
        tree = ET.parse(file)
    except Exception as e:
        print(f"Error parsing {file}: {e}")
        continue
        
    root = tree.getroot()
    
    for worksheet in root.findall('ss:Worksheet', ns):
        table = worksheet.find('ss:Table', ns)
        if table is None: continue
        
        rows = table.findall('ss:Row', ns)
        if not rows: continue
        
        # Extract state code and name from the title row (usually second row)
        state_code = None
        state_name = None
        if len(rows) > 1:
            title_cell = rows[1].find('ss:Cell', ns)
            if title_cell is not None:
                data = title_cell.find('ss:Data', ns)
                if data is not None and data.text:
                    # Regex: All Districts of Jammu And Kashmir(State Code:1) State
                    # Or: All Subdistricts of Jammu And Kashmir(State Code:1) State
                    m = re.search(r'of (.*?)\(State Code:(\d+)\)', data.text, re.IGNORECASE)
                    if m:
                        state_name = m.group(1).strip()
                        state_code = m.group(2).strip()
                        states_map[state_code] = state_name
                        
        for row in rows:
            cells = row.findall('ss:Cell', ns)
            if len(cells) < 2: continue
            
            data_vals = []
            for cell in cells:
                data = cell.find('ss:Data', ns)
                data_vals.append(data.text.strip() if data is not None and data.text else "")
                
            try:
                float(data_vals[0])
            except ValueError:
                continue
                
            if is_sub and len(data_vals) >= 6:
                # 0: SNo, 1: Dist Code, 2: Dist Name, 3: Sub Code, 4: Sub Version, 5: Sub Name
                d_code = data_vals[1]
                s_code = data_vals[3]
                s_name = data_vals[5]
                subdistricts.append({
                    'State Code': state_code,
                    'District Code': d_code,
                    'Sub-District Code': s_code,
                    'Sub-District Name (In English)': s_name
                })
            elif not is_sub and len(data_vals) >= 4:
                # 0: SNo, 1: Dist Code, 2: Dist Version, 3: Dist Name
                d_code = data_vals[1]
                d_name = data_vals[3]
                districts.append({
                    'State Code': state_code,
                    'District Code': d_code,
                    'District Name (In English)': d_name
                })

# Write states.csv
with open(os.path.join(output_dir, 'states.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['State Code', 'State Name (In English)'])
    writer.writeheader()
    for code in sorted(states_map.keys(), key=lambda x: int(x)):
        writer.writerow({'State Code': code, 'State Name (In English)': states_map[code]})

# Write districts.csv
with open(os.path.join(output_dir, 'districts.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['State Code', 'District Code', 'District Name (In English)'])
    writer.writeheader()
    for d in districts:
        writer.writerow(d)
        
# Write subdistricts.csv
with open(os.path.join(output_dir, 'subdistricts.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['State Code', 'District Code', 'Sub-District Code', 'Sub-District Name (In English)'])
    writer.writeheader()
    for s in subdistricts:
        writer.writerow(s)

print(f"Successfully normalized and exported:")
print(f"- {len(states_map)} States")
print(f"- {len(districts)} Districts")
print(f"- {len(subdistricts)} Subdistricts")
