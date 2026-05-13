// Charts System (Chart.js)
const ChartsSystem = {
    regionalChart: null,
    scatterChart: null,
    timelineChart: null,

    init() {
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = 'Inter, sans-serif';
        
        this.initRegionalChart();
        this.initScatterChart();
        this.initTimelineChart();
    },

    updateAll(year) {
        this.updateRegionalChart(year);
        this.updateScatterChart(year);
        
        const c1 = document.getElementById('timeline-country-1');
        const c2 = document.getElementById('timeline-country-2');
        if(c1 && c2) {
            this.updateTimelineChart(c1.value, c2.value);
        }
    },

    initRegionalChart() {
        const ctx = document.getElementById('regional-chart').getContext('2d');
        this.regionalChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Ortalama Skor: ${ctx.raw}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#e5e7eb', font: { weight: '600', size: 11 } }
                    },
                    y: { 
                        beginAtZero: true, 
                        max: 8,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af', font: { size: 10 } }
                    }
                }
            }
        });
    },

    updateRegionalChart(year) {
        // app.currentData simüle durumunu otomatik baz alan getRegions fonksiyonunu çağırır
        const regions = getRegions(year);
        
        // Premium çok renkli bar paleti
        const barColors = [
            'rgba(59, 130, 246, 0.85)',  // Mavi
            'rgba(16, 185, 129, 0.85)',  // Yeşi
            'rgba(245, 158, 11, 0.85)',  // Altın
            'rgba(239, 68, 68, 0.85)',   // Kırmızı
            'rgba(168, 85, 247, 0.85)',  // Mor
            'rgba(236, 72, 153, 0.85)',  // Pembe
            'rgba(6, 182, 212, 0.85)'    // Turkuaz
        ];
        
        this.regionalChart.data = {
            labels: regions.map(r => r.name),
            datasets: [{
                label: 'Ortalama Skor',
                data: regions.map(r => r.avgScore),
                backgroundColor: regions.map((_, i) => barColors[i % barColors.length]),
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                borderRadius: 6
            }]
        };
        this.regionalChart.update();
    },

    initScatterChart() {
        const ctx = document.getElementById('scatter-chart').getContext('2d');
        this.scatterChart = new Chart(ctx, {
            type: 'scatter',
            data: { datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            color: '#e5e7eb',
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                return `${ctx.raw.country}: GDP Payı ${ctx.raw.x} | Skor: ${ctx.raw.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Ekonomik Güç (GDP Model Payı)', color: '#9ca3af', font: { weight: 'bold' } },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        title: { display: true, text: 'Mutluluk Skoru', color: '#9ca3af', font: { weight: 'bold' } },
                        min: 2, max: 9,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });
    },

    updateScatterChart(year) {
        // Canlı simülasyon/aktif veriyi baz alarak çiz
        const data = (typeof app !== 'undefined' && app.currentData) ? app.currentData : getCountriesData(year);
        
        // Verileri bölgelerine göre ayrı veri setlerine böl, böylece renk kodlaması ve lejant otomatik oluşsun
        const regionsMap = {};
        const palette = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#8b5cf6', '#14b8a6'
        ];

        data.forEach(c => {
            const r = c.region || 'Diğer';
            if(!regionsMap[r]) regionsMap[r] = [];
            regionsMap[r].push({
                x: c.gdp,
                y: c.score,
                country: c.name
            });
        });

        const datasets = Object.keys(regionsMap).map((regionName, index) => ({
            label: regionName,
            data: regionsMap[regionName],
            backgroundColor: palette[index % palette.length],
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1
        }));

        this.scatterChart.data = { datasets };
        this.scatterChart.update();
    },

    initTimelineChart() {
        const ctx = document.getElementById('timeline-chart').getContext('2d');
        
        const c1 = document.getElementById('timeline-country-1');
        const c2 = document.getElementById('timeline-country-2');
        
        const currentCountries = getCountriesData();
        currentCountries.forEach(c => {
            c1.add(new Option(c.name, c.id));
            c2.add(new Option(c.name, c.id));
        });
        
        c1.value = "FIN";
        c2.value = "TUR";

        this.timelineChart = new Chart(ctx, {
            type: 'radar',
            data: { labels: ['GDP Payı', 'Sosyal Destek', 'Sağlık', 'Eğitim', 'Banka/Kredi', 'Çevre', 'Özgürlük', 'Cömertlik', 'Yolsuzluk'], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: %${(ctx.raw * 100).toFixed(0)} Kapasite`
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0, 
                        max: 1,
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                        pointLabels: {
                            color: '#e5e7eb',
                            font: { size: 11, weight: 'bold' }
                        }
                    }
                }
            }
        });

        const updateLine = () => this.updateTimelineChart(c1.value, c2.value);
        c1.addEventListener('change', updateLine);
        c2.addEventListener('change', updateLine);
        
        updateLine();
    },

    updateTimelineChart(id1, id2) {
        // Simülasyon durumunu anında yansıtmak için canlı veriyi al
        const currentCountries = (typeof app !== 'undefined' && app.currentData) ? app.currentData : getCountriesData();
        const c1Data = currentCountries.find(c => c.id === id1) || currentCountries[0];
        const c2Data = currentCountries.find(c => c.id === id2) || currentCountries[1];

        const normalize = (val, min, max) => Math.max(0, Math.min(1, (val - min) / (max - min)));

        const getRadarData = (c) => [
            normalize(c.gdp, 0, 2.3),
            normalize(c.social, 0, 1.6),
            normalize(c.health, 0, 1.1),
            normalize(c.education, 30, 130),
            normalize(c.banking, 0, 200),
            normalize(c.environment, 0, 100),
            normalize(c.freedom, 0, 0.8),
            normalize(c.generosity, 0, 0.6),
            normalize(c.corruption, 0, 0.6)
        ];

        this.timelineChart.data.datasets = [
            {
                label: c1Data.name,
                data: getRadarData(c1Data),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.25)',
                pointBackgroundColor: '#3b82f6',
                pointRadius: 4
            },
            {
                label: c2Data.name,
                data: getRadarData(c2Data),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                pointBackgroundColor: '#ef4444',
                pointRadius: 4
            }
        ];
        this.timelineChart.update();
    }
};
