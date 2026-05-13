// Main Application Logic
const app = {
    currentYear: 2024,
    currentData: null,
    colorBlindMode: false,

    async init() {
        this.currentData = getCountriesData(this.currentYear);
        
        // Init Systems
        await MapSystem.init();
        ChartsSystem.init();
        
        this.bindEvents();
        this.updateAllViews();
        
        console.log("Happiness Engine v2.0 Initialized");
    },

    bindEvents() {
        // Smooth Navigation to Sections
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                
                const sectionId = target.dataset.tab;
                const sectionEl = document.getElementById(sectionId);
                if(sectionEl) {
                    sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Year Slider
        const yearSlider = document.getElementById('year-slider');
        const yearDisplay = document.getElementById('current-year-display');
        
        // Setup slider steps based on available years
        const steps = appData.years;
        yearSlider.min = 0;
        yearSlider.max = steps.length - 1;
        yearSlider.step = 1;
        yearSlider.value = steps.length - 1;

        yearSlider.addEventListener('input', (e) => {
            this.currentYear = steps[e.target.value];
            yearDisplay.textContent = this.currentYear;
            document.querySelector('.year-badge').textContent = this.currentYear;
            
            this.currentData = getCountriesData(this.currentYear);
            this.updateAllViews();
        });

        // Color Blind Toggle
        document.getElementById('color-blind-toggle').addEventListener('click', () => {
            this.colorBlindMode = !this.colorBlindMode;
            document.body.classList.toggle('color-blind-mode', this.colorBlindMode);
            
            MapSystem.colorScale.range(this.colorBlindMode ? 
                ["var(--accent-red)", "var(--accent-yellow)", "var(--accent-green)"] :
                ["#ef4444", "#f59e0b", "#10b981"]
            );
            MapSystem.drawMap(this.currentYear);
        });

        // Simulation Sliders
        document.querySelectorAll('.weight-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const label = e.target.previousElementSibling;
                if(label && label.querySelector('.val')) {
                    label.querySelector('.val').textContent = e.target.value + '%';
                }
            });
        });

        document.getElementById('btn-recalculate-global').addEventListener('click', () => {
            this.recalculateGlobalFromUI();
        });

        // Predict Custom Country
        document.getElementById('btn-predict').addEventListener('click', () => {
            this.predictCustomCountry();
        });
    },

    updateAllViews() {
        this.updateDashboard();
        MapSystem.drawMap(this.currentYear);
        ChartsSystem.updateAll(this.currentYear);
    },

    updateDashboard() {
        if(!this.currentData || this.currentData.length === 0) return;

        // KPI
        const topCountry = this.currentData[0];
        document.getElementById('kpi-global-score').textContent = 
            (this.currentData.reduce((acc, c) => acc + c.score, 0) / this.currentData.length).toFixed(2);
        
        document.getElementById('kpi-top-country').textContent = topCountry.name;

        const regions = getRegions(this.currentYear);
        if(regions && regions.length > 0) {
            document.getElementById('kpi-top-region').textContent = regions[0].name;
            const regionTrend = document.getElementById('kpi-top-region').nextElementSibling;
            if(regionTrend) regionTrend.textContent = `Ortalama: ${regions[0].avgScore}`;
        }

        // Table
        const tbody = document.querySelector('#ranking-table tbody');
        tbody.innerHTML = '';
        
        this.currentData.slice(0, 10).forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.title = "Tıklayarak katkı analizini sağ panelde incele";
            tr.innerHTML = `
                <td>#${index + 1}</td>
                <td>
                    <img src="https://flagcdn.com/24x18/${c.flag.replace('.svg','')}.png" class="flag" alt="flag" onerror="this.style.display='none'"> 
                    ${c.name}
                </td>
                <td><strong>${c.score.toFixed(2)}</strong></td>
                <td><span class="trend ${c.score > 6 ? 'positive' : ''}">~</span></td>
            `;
            tr.onclick = () => {
                // Tıklanan ülkeyi Odak Ülke Bilgisi paneline yükle
                const selInfoEl = document.getElementById('map-selected-country-info');
                if (selInfoEl) {
                    let tags = [];
                    if (c.gdp > 1.2) tags.push('<span style="background:rgba(16,185,129,0.15); color:var(--accent-green); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Yüksek GDP</span>');
                    else if (c.gdp < 0.7) tags.push('<span style="background:rgba(239,68,68,0.15); color:var(--accent-red); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">- Düşük Ekonomi</span>');
                    
                    if (c.social > 1.1) tags.push('<span style="background:rgba(16,185,129,0.15); color:var(--accent-green); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Sosyal Destek</span>');
                    else if (c.social < 0.8) tags.push('<span style="background:rgba(239,68,68,0.15); color:var(--accent-red); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">- Zayıf Sosyal Ağ</span>');

                    if (c.health > 0.75) tags.push('<span style="background:rgba(16,185,129,0.15); color:var(--accent-green); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Sağlıklı Yaşam</span>');
                    else tags.push('<span style="background:rgba(239,68,68,0.15); color:var(--accent-red); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">- Sağlık Riski</span>');

                    if (c.freedom > 0.5) tags.push('<span style="background:rgba(59,130,246,0.15); color:var(--accent-blue); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Özgürlük</span>');

                    selInfoEl.innerHTML = `
                        <div style="font-size: 1.1rem; font-weight: bold; color: #ffffff; margin-bottom: 4px;">${c.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">${c.region || '-'}</div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; margin-bottom: 10px;">
                            <span style="font-size:0.85rem;">Simüle Skor:</span> <strong style="color: var(--accent-gold); font-size: 1.2rem;">${c.score.toFixed(2)}</strong>
                        </div>

                        <div style="margin-bottom: 10px;">
                            <div style="font-size:0.75rem; color:var(--accent-gold); text-transform:uppercase; margin-bottom:4px; font-weight:bold;">🔥 What Influenced Happiness?</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                ${tags.join('')}
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                            <span>Ekonomik GDP Payı:</span> <span style="color: #9ca3af; font-family:monospace;">${c.gdp}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                            <span>Sosyal Destek:</span> <span style="color: #9ca3af; font-family:monospace;">${c.social}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                            <span>Sağlık Yaşam Bekl.:</span> <span style="color: #9ca3af; font-family:monospace;">${c.health}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                            <span>Özgürlük Katsayısı:</span> <span style="color: #9ca3af; font-family:monospace;">${c.freedom}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size:0.85rem;">
                            <span>Yolsuzluk Algısı:</span> <span style="color: #9ca3af; font-family:monospace;">${c.corruption}</span>
                        </div>
                    `;
                    // Otomatik olarak harita / panel bölümüne kaydır
                    const mapSec = document.getElementById('map-view');
                    if(mapSec) mapSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
            tbody.appendChild(tr);
        });
    },

    recalculateGlobalFromUI() {
        const weights = {
            gdp: parseInt(document.querySelector('[data-factor="gdp"]').value),
            social: parseInt(document.querySelector('[data-factor="social"]').value),
            health: parseInt(document.querySelector('[data-factor="health"]').value),
            education: parseInt(document.querySelector('[data-factor="education"]').value),
            banking: parseInt(document.querySelector('[data-factor="banking"]').value),
            environment: parseInt(document.querySelector('[data-factor="environment"]').value),
            freedom: parseInt(document.querySelector('[data-factor="freedom"]').value),
            generosity: parseInt(document.querySelector('[data-factor="generosity"]').value),
            corruption: parseInt(document.querySelector('[data-factor="corruption"]').value)
        };

        SimulationEngine.updateWeights(weights);
        
        // UI formül gösterimini güncelle
        document.getElementById('w-gdp').textContent = SimulationEngine.weights.gdp.toFixed(2);
        document.getElementById('w-social').textContent = SimulationEngine.weights.social.toFixed(2);
        document.getElementById('w-health').textContent = SimulationEngine.weights.health.toFixed(2);
        document.getElementById('w-edu').textContent = SimulationEngine.weights.education.toFixed(2);
        document.getElementById('w-bank').textContent = SimulationEngine.weights.banking.toFixed(2);
        document.getElementById('w-env').textContent = SimulationEngine.weights.environment.toFixed(2);
        document.getElementById('w-free').textContent = SimulationEngine.weights.freedom.toFixed(2);
        document.getElementById('w-gen').textContent = SimulationEngine.weights.generosity.toFixed(2);
        document.getElementById('w-corr').textContent = SimulationEngine.weights.corruption.toFixed(2);

        this.currentData = SimulationEngine.recalculateGlobal(this.currentData);
        
        this.updateAllViews();
        
        // Scroll smoothly to dashboard view to showcase the real-time simulation updates
        const topView = document.getElementById('dashboard');
        if(topView) topView.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        alert("Global sıralama yeni model ağırlıklarına göre yeniden hesaplandı!");
    },

    predictCustomCountry() {
        const customData = {
            gdp: parseFloat(document.getElementById('custom-gdp').value),
            social: parseFloat(document.getElementById('custom-social').value),
            health: parseFloat(document.getElementById('custom-health').value),
            education: parseFloat(document.getElementById('custom-edu').value),
            environment: parseFloat(document.getElementById('custom-env').value),
            banking: parseFloat(document.getElementById('custom-bank').value),
            freedom: parseFloat(document.getElementById('custom-free').value),
            generosity: parseFloat(document.getElementById('custom-gen').value),
            corruption: parseFloat(document.getElementById('custom-corr').value)
        };

        const score = SimulationEngine.calculateScore(customData);
        
        // Rank bulma
        let rank = 1;
        for(let c of this.currentData) {
            if(score > c.score) break;
            rank++;
        }

        const resBox = document.getElementById('prediction-result');
        resBox.classList.remove('hidden');
        resBox.querySelector('.big-score').textContent = score.toFixed(2);
        document.getElementById('pred-rank').textContent = `Dünyada ${rank}.`;
    },

    runScenario(type) {
        const originalData = getCountriesData(this.currentYear);
        const newData = SimulationEngine.runScenario(originalData, type);
        
        this.currentData = newData;
        this.updateAllViews();
        
        // Senaryo sonuç tablosunu doldur
        const tbody = document.querySelector('#scenario-result-table tbody');
        if(tbody) tbody.innerHTML = '';
        
        // Sadece ilk 5 değişimi göster
        for(let i=0; i<5; i++) {
            const oldObj = originalData.find(c => c.id === newData[i].id);
            const oldScore = oldObj ? oldObj.score : 0;
            const diff = newData[i].score - oldScore;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${newData[i].name}</td>
                <td>${oldScore.toFixed(2)}</td>
                <td><strong>${newData[i].score.toFixed(2)}</strong></td>
                <td class="${diff >= 0 ? 'trend positive' : 'trend negative'}">${diff > 0 ? '+' : ''}${diff.toFixed(2)}</td>
            `;
            if(tbody) tbody.appendChild(tr);
        }
        
        alert(`Senaryo başarıyla uygulandı! Dashboard, Harita ve Grafikler güncellendi.`);
    },

    resetData() {
        this.currentData = getCountriesData(this.currentYear);
        
        const resTbody = document.querySelector('#scenario-result-table tbody');
        if(resTbody) resTbody.innerHTML = `<tr><td colspan="4" class="text-center">Sıfırlandı.</td></tr>`;
        
        this.updateAllViews();
    },

    exportDataCSV() {
        if (!this.currentData || this.currentData.length === 0) return;
        
        const headers = ["ID", "Ulke", "Bolge", "Simule_Edilmis_Skor", "GDP_Payi", "Sosyal_Destek_Payi", "Saglik_Payi", "Egitim_Okullasma", "Cevre_Orman", "Banka_Kredi", "Ozgurluk_Payi", "Comertlik_Payi", "Yolsuzluk_Payi"];
        const csvRows = [headers.join(",")];
        
        this.currentData.forEach(c => {
            const row = [
                c.id,
                `"${c.name}"`,
                `"${c.region}"`,
                c.score.toFixed(3),
                c.gdp,
                c.social,
                c.health,
                c.education,
                c.environment,
                c.banking,
                c.freedom,
                c.generosity,
                c.corruption
            ];
            csvRows.push(row.join(","));
        });
        
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `mutluluk_simulasyon_verisi_${this.currentYear}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
