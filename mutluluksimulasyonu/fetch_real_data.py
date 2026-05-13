import kagglehub
import pandas as pd
import requests
import json
import os

def fetch_wb(indicator, name):
    print(f"Dünya Bankası API'den {name} verisi çekiliyor...")
    url = f'http://api.worldbank.org/v2/country/all/indicator/{indicator}?format=json&per_page=10000&date=2015:2024'
    resp = requests.get(url).json()
    data = []
    if len(resp) > 1:
        for item in resp[1]:
            if item['value'] is not None:
                data.append({'Country': item['country']['value'], name: item['value'], 'Year': int(item['date'])})
    return pd.DataFrame(data)

def fetch_and_generate_data():
    print("Saf ve gerçek veri setleri indiriliyor (WHR 2018-2024 & World Bank)...")
    
    # Download datasets via kagglehub
    path_main = kagglehub.dataset_download('mathurinache/world-happiness-report')
    path_2024 = kagglehub.dataset_download('ajaypalsinghlo/world-happiness-report-2024')

    # Prepare World Bank Data
    df_edu_wb = fetch_wb('SE.PRM.ENRR', 'Education')
    df_env_wb = fetch_wb('AG.LND.FRST.ZS', 'Environment')
    df_bank_wb = fetch_wb('FB.AST.PRVT.GD.ZS', 'Banking')

    country_map = {
        "Egypt, Arab Rep.": "Egypt", "Russian Federation": "Russia",
        "Congo, Dem. Rep.": "Congo (Kinshasa)", "Congo, Rep.": "Congo (Brazzaville)",
        "Iran, Islamic Rep.": "Iran", "Korea, Rep.": "South Korea",
        "Venezuela, RB": "Venezuela", "Yemen, Rep.": "Yemen",
        "Turkiye": "Turkey", "Slovak Republic": "Slovakia",
        "Kyrgyz Republic": "Kyrgyzstan", "Lao PDR": "Laos",
        "Syrian Arab Republic": "Syria", "Gambia, The": "Gambia",
        "Bahamas, The": "Bahamas", "Czechia": "Czech Republic"
    }

    for df in [df_edu_wb, df_env_wb, df_bank_wb]:
        if not df.empty:
            df['Country'] = df['Country'].replace(country_map)

    # Cache regional mapping from 2020 dataset
    df_2020_raw = pd.read_csv(os.path.join(path_main, '2020.csv'))
    region_map = dict(zip(df_2020_raw['Country name'], df_2020_raw['Regional indicator']))
    region_map["Czech Republic"] = "Central and Eastern Europe"
    region_map["Turkey"] = "Middle East and North Africa"

    years_config = {
        2018: {'file': os.path.join(path_main, '2018.csv'), 'c': 'Country or region', 's': 'Score', 'g': 'GDP per capita', 'soc': 'Social support', 'h': 'Healthy life expectancy', 'f': 'Freedom to make life choices', 'gen': 'Generosity', 'cor': 'Perceptions of corruption'},
        2020: {'file': os.path.join(path_main, '2020.csv'), 'c': 'Country name', 's': 'Ladder score', 'g': 'Explained by: Log GDP per capita', 'soc': 'Explained by: Social support', 'h': 'Explained by: Healthy life expectancy', 'f': 'Explained by: Freedom to make life choices', 'gen': 'Explained by: Generosity', 'cor': 'Explained by: Perceptions of corruption'},
        2022: {'file': os.path.join(path_main, '2022.csv'), 'c': 'Country', 's': 'Happiness score', 'g': 'Explained by: GDP per capita', 'soc': 'Explained by: Social support', 'h': 'Explained by: Healthy life expectancy', 'f': 'Explained by: Freedom to make life choices', 'gen': 'Explained by: Generosity', 'cor': 'Explained by: Perceptions of corruption'},
        2024: {'file': os.path.join(path_2024, 'WHR2024.csv'), 'c': 'Country name', 's': 'Ladder score', 'g': 'Explained by: Log GDP per capita', 'soc': 'Explained by: Social support', 'h': 'Explained by: Healthy life expectancy', 'f': 'Explained by: Freedom to make life choices', 'gen': 'Explained by: Generosity', 'cor': 'Explained by: Perceptions of corruption'}
    }

    historical_data = {}

    for year, cfg in years_config.items():
        print(f"{year} verileri işleniyor...")
        df = pd.read_csv(cfg['file'])
        
        # Rename common columns
        df = df.rename(columns={
            cfg['c']: 'Country', cfg['s']: 'Score', cfg['g']: 'gdp',
            cfg['soc']: 'social', cfg['h']: 'health', cfg['f']: 'freedom',
            cfg['gen']: 'generosity', cfg['cor']: 'corruption'
        })
        
        df['Country'] = df['Country'].replace({"Turkiye": "Turkey", "Czechia": "Czech Republic"})
        
        # Merge WB data specifically for this year (fallback to closest previous year if missing)
        def merge_wb_year(df_main, df_wb, col_name, target_year):
            if df_wb.empty:
                df_main[col_name] = 50.0
                return df_main
            
            # Filter WB data up to target year, take the latest available per country
            df_filtered = df_wb[df_wb['Year'] <= target_year].sort_values('Year').drop_duplicates('Country', keep='last')
            df_filtered = df_filtered[['Country', col_name]]
            
            merged = pd.merge(df_main, df_filtered, on='Country', how='left')
            merged[col_name] = merged[col_name].fillna(merged[col_name].mean()).fillna(50.0)
            return merged

        df = merge_wb_year(df, df_edu_wb, 'Education', year)
        df = merge_wb_year(df, df_env_wb, 'Environment', year)
        df = merge_wb_year(df, df_bank_wb, 'Banking', year)

        year_list = []
        for _, row in df.iterrows():
            c_name = str(row['Country'])
            # Ensure safe float conversions
            def safe_flt(val):
                try:
                    return round(float(val), 3) if pd.notnull(val) else 0.0
                except:
                    return 0.0

            score = safe_flt(row['Score'])
            gdp = safe_flt(row['gdp'])
            soc = safe_flt(row['social'])
            hlth = safe_flt(row['health'])
            free = safe_flt(row['freedom'])
            gen = safe_flt(row['generosity'])
            cor = safe_flt(row['corruption'])
            
            edu = round(safe_flt(row['Education']), 1)
            env = round(safe_flt(row['Environment']), 1)
            bank = round(safe_flt(row['Banking']), 1)

            reg = region_map.get(c_name, "Global")
            iso2 = c_name[:2].lower()

            year_list.append({
                "id": c_name[:3].upper(), "name": c_name, "region": reg,
                "score": score, "baseScore": score,
                "gdp": gdp, "social": soc, "health": hlth,
                "freedom": free, "generosity": gen, "corruption": cor,
                "education": edu, "environment": env, "banking": bank,
                "flag": f"{iso2}.svg"
            })
            
        # Sort by score descending
        year_list.sort(key=lambda x: x['score'], reverse=True)
        historical_data[year] = year_list

    # Generate JS file
    js_content = f"""// SAF ÇOKLU YIL VERİ SETİ (WHR 2018-2024 Decomposed Shares + World Bank API)
const appData = {{
    years: [2018, 2020, 2022, 2024],
    currentYear: 2024,
    historicalData: {json.dumps(historical_data, indent=4)}
}};

function getCountriesData(year) {{
    const targetYear = year || appData.currentYear;
    return JSON.parse(JSON.stringify(appData.historicalData[targetYear] || appData.historicalData[2024]));
}}

function getRegions(year) {{
    const data = getCountriesData(year);
    const regions = {{}};
    data.forEach(c => {{
        let r = c.region || "Global";
        if(!regions[r]) regions[r] = {{ count: 0, scoreSum: 0 }};
        regions[r].count++;
        regions[r].scoreSum += c.score;
    }});
    
    return Object.keys(regions).map(r => ({{
        name: r,
        avgScore: parseFloat((regions[r].scoreSum / regions[r].count).toFixed(2))
    }})).sort((a,b) => b.avgScore - a.avgScore);
}}
"""
    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("data.js başarıyla çoklu yıl (2018-2024) verileriyle güncellendi!")

if __name__ == "__main__":
    fetch_and_generate_data()
