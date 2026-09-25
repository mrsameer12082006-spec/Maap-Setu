import urllib.request
import ssl

urls = [
    ("Andhra Pradesh", "https://pramaan.ap.gov.in/"),
    ("Maharashtra", "https://www.vaidhmapan.maharashtra.gov.in/"),
    ("Uttar Pradesh", "https://legalmetrology-up.gov.in/metrology/index.php"),
    ("Madhya Pradesh", "https://cwnm.nic.in/index.html"),
    ("Odisha", "https://dlm.pdsodisha.gov.in/"),
    ("Rajasthan", "https://legalmetrology.rajasthan.gov.in/"),
    ("Chandigarh", "https://etula.chdfood.gov.in/"),
    ("Punjab", "https://www.emapan.punjab.gov.in/HomePages/login.aspx"),
    ("Karnataka", "https://emapan.karnataka.gov.in/"),
    ("Tamil Nadu", "https://labour.tn.gov.in/"),
    ("Uttarakhand", "https://fcs.uk.gov.in/pages/display/73-legal-metrology-(wm)"),
    ("Jharkhand", "https://elegalmetrology.jharkhand.gov.in/japnet/ConsumersAppliedReport.aspx"),
    ("Puducherry", "https://eodb.py.gov.in/Welcome/GoToPublishContent/27?deptname=Legal%20Metrology"),
    ("Chhattisgarh", "https://legalmetrology.cg.nic.in/"),
    ("Haryana", "https://lm.haryanafood.gov.in/"),
    ("Kerala", "https://lmd.kerala.gov.in/en/"),
    ("Bihar", "https://maaptaul.bih.nic.in/lmd/"),
    ("Gujarat", "https://lmdca.gujarat.gov.in/")
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

results = []
for name, url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4, context=ctx) as resp:
            code = resp.getcode()
            print(f"[OK] {name}: {code}")
            results.append((name, url, True))
    except Exception as e:
        print(f"[FAIL] {name}: Failed ({e})")
        results.append((name, url, False))

print("\n--- WORKING STATES ONLY ---")
working = [item for item in results if item[2]]
for w in working:
    print(f"('{w[0]}', '{w[1]}')")
