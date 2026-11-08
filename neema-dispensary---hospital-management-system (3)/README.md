# Neema Dispensary - Hospital Management & EMR System
**Nyamongo, Tarime District, Mara Region, Tanzania**  
*Mawasiliano ya Mmiliki: 0763503097*

Mfumo kamili wa kisasa wa usimamizi wa hospitali (Electronic Medical Records - EMR & Hospital Administration) uliotengenezwa mahsusi kwa ajili ya **Neema Dispensary**.

---

## 🌟 Sifa Kuu za Mfumo (Key Features)

1. **Idara Zote za Hospitali (Departmental Hubs):**
   - **OPD / IPD:** Mapokezi ya wagonjwa, foleni za matibabu, kadi za kliniki na wodi.
   - **Pharmacy & Mapokezi:** Utoaji wa dawa 1,177+, kukata stoo papo hapo (Stock Deduction), na ada ya mapokezi (TZS 5,000/=).
   - **Maabara (Laboratory):** Vipimo, sampuli na uthibitishaji wa majibu kabla daktari hajaidhinisha dawa.
   - **Labour Ward:** Wodi ya wazazi na uzazi salama.
   - **USS (Ultrasound):** Vipimo vya ultrasound na ripoti za picha za sonografia.
   - **RCH Clinic:** Kliniki ya mama na mtoto, chanjo na ukuaji wa mtoto.
2. **Kudumu kwa Data (Permanent Data Persistence):**
   - Taarifa zote za wagonjwa, rekodi za dawa, na malipo huhifadhiwa kwenye kumbukumbu ya kifaa (`localStorage`).
   - Hata umeme ukikatika Tarime au ukurasa ukifungwa/kurefresh, hakuna data itakayopotea.
3. **Malipo & Risiti za PDF (Billing & Receipts):**
   - Malipo ya Taslimu (Cash), M-Pesa (0763503097), Tigo Pesa, Airtel Money, Halopesa, na Benki (CRDB/NMB).
   - Uwezo wa kupokea malipo ya nusu (Half Due / Partial) na taarifa za moja kwa moja kwa WhatsApp.
   - Uchapishaji wa risiti rasmi za PDF (PDF Print & Download).
4. **Programu ya Kompyuta & Simu (PWA - Standalone App):**
   - Inaweza kuwekwa kama Desktop Icon (Windows/Mac) au Phone Icon (Android/iPhone).
   - Inafanya kazi hata bila mtandao wa internet (Offline Caching).

---

## 🚀 Jinsi ya Kuweka Mfumo Huu Kwenye GitHub & Kuuhost Bure (Hosting on GitHub)

Mfumo huu umewekewa tayari faili ya **GitHub Actions (`.github/workflows/deploy.yml`)** inayowezesha kuuhost bure mtandaoni kupitia **GitHub Pages**.

### Hatua ya 1: Fungua Akaunti au Ingia Kwenye GitHub
1. Nenda kwenye [github.com](https://github.com/) na uingie kwenye akaunti yako (au sajili akaunti mpya kama huna).
2. Bonyeza kitufe cha kijani cha **"New"** (au alama ya `+` juu kulia kisha **"New repository"**).
3. Andika jina la repository (mfano: `neema-dispensary-emr`).
4. Chagua **Public**.
5. Usiweke tiki kwenye "Add a README file" (kwa sababu tayari unayo).
6. Bonyeza **"Create repository"**.

---

### Hatua ya 2: Panda Mfumo Kwenye GitHub (Pushing Code)
Kwenye kompyuta yako (kwenye folder la mradi huu), fungua Terminal / Command Prompt kisha piga amri hizi kwa mpangilio:

```bash
# 1. Anzisha git kama bado
git init

# 2. Weka faili zote tayari
git add .

# 3. Fanya commit ya kwanza
git commit -m "Initial commit - Neema Dispensary Hospital EMR System"

# 4. Weka branch kuwa main
git branch -M main

# 5. Unganisha na repository yako ya GitHub (badilisha USERNAME na jina lako la GitHub)
git remote add origin https://github.com/USERNAME/neema-dispensary-emr.git

# 6. Pandisha kodi kwenye GitHub
git push -u origin main
```

*(Kama unatumia GitHub Desktop au kupakua ZIP kutoka AI Studio, unaweza pia ku-extract ZIP na ku-drag folder lote kwenye GitHub Desktop au GitHub web).*

---

### Hatua ya 3: Washa Hosting ya Bure ya GitHub Pages
Baada ya kodi kupanda GitHub:
1. Nenda kwenye repository yako kwenye GitHub: `https://github.com/USERNAME/neema-dispensary-emr`
2. Bonyeza tab ya **Settings** (juu ya repository).
3. Kwenye menu ya kushoto, bonyeza **Pages** (chini ya sehemu ya *Code and automation*).
4. Chini ya **Build and deployment** -> **Source**:
   - Badilisha kutoka "Deploy from a branch" na uchague **"GitHub Actions"**.
5. Ni hayo tu! GitHub itaanza ku-build mfumo kiotomatiki kupitia faili letu la `.github/workflows/deploy.yml`.
6. Ndani ya dakika 1 hadi 2, utapewa link ya moja kwa moja ya tovuti yako bure, mfano:
   ```text
   https://USERNAME.github.io/neema-dispensary-emr/
   ```

---

## ⚡ Njia Mbadala: Hosting ya 1-Click kwenye Vercel au Netlify (Bure)

Ikiwa unataka link ya haraka zaidi yenye Custom Domain bure:
1. **Kwenye Vercel:**
   - Nenda [vercel.com](https://vercel.com/) -> Ingia kwa akaunti ya GitHub.
   - Bonyeza **"Add New Project"** -> Chagua `neema-dispensary-emr`.
   - Bonyeza **"Deploy"** — mfumo utakuwa hewani ndani ya sekunde 30!
2. **Kwenye Netlify:**
   - Nenda [netlify.com](https://netlify.com/) -> Ingia kwa GitHub -> **"Import from Git"** -> Chagua repo kisha **"Deploy"**.

---

## 💻 Kazi ya Ndani (Local Development)

Ili kuendesha mfumo huu kwenye kompyuta yako kwa ajili ya majaribio:

```bash
# Sakinisha package zote
npm install

# Anzisha development server
npm run dev

# Kutengeneza build ya production
npm run build
```

---

## 📞 Mawasiliano & Msaada
- **Hospitali:** Neema Dispensary
- **Mahali:** Nyamongo, Tarime, Mara, Tanzania
- **Simu ya Mmiliki:** 0763503097
