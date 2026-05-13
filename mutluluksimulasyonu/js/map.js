// Map System (D3.js & TopoJSON)
const MapSystem = {
    svg: null,
    g: null,
    projection: null,
    path: null,
    colorScale: null,
    tooltip: null,
    worldData: null,

    async init() {
        this.tooltip = d3.select("#map-tooltip");
        
        // Vektör SVG viewBox ve projeksiyon merkezinin sayfa yüklenme anındaki CSS hesaplamalarından etkilenmemesi için sabit iç çözünürlük
        const width = 960;
        const height = 600;

        this.svg = d3.select("#world-map")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        this.g = this.svg.append("g");

        // Pan & Zoom
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                this.g.attr("transform", event.transform);
            });
        this.svg.call(zoom);

        // Projection - Haritayı mükemmel ortala
        this.projection = d3.geoMercator()
            .scale(140)
            .translate([width / 2, height / 1.4]);

        this.path = d3.geoPath().projection(this.projection);

        // Color Scale (Red to Green)
        this.colorScale = d3.scaleLinear()
            .domain([3, 5.5, 8])
            .range(["var(--accent-red)", "var(--accent-yellow)", "var(--accent-green)"]);

        try {
            // Tarayıcı CORS/yerel kısıtlamalarını aşmak için inline paketlenmiş veri varsa onu kullan, yoksa dinamik fetch at
            if (typeof window.PRELOADED_WORLD_DATA !== 'undefined' && window.PRELOADED_WORLD_DATA) {
                this.worldData = window.PRELOADED_WORLD_DATA;
                this.drawMap(app.currentYear);
            } else {
                const response = await fetch('assets/world-110m.json');
                this.worldData = await response.json();
                this.drawMap(app.currentYear);
            }
        } catch (error) {
            console.error("Harita verisi yüklenemedi:", error);
            this.g.append("text")
                .attr("x", width/2)
                .attr("y", height/2)
                .attr("text-anchor", "middle")
                .attr("fill", "#e5e7eb")
                .text("Harita verisi yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya sunucu üzerinden açın.");
        }
    },

    getCountryObj(d, year) {
        if (!d || !d.properties || !d.properties.name) return null;
        const currentData = getCountriesData(year || app.currentYear);
        
        const nameMap = {};
        currentData.forEach(c => {
            if (c.name) nameMap[c.name.toLowerCase()] = c;
        });

        const overrides = {
            "united states of america": "united states",
            "tanzania": "tanzania",
            "dem. rep. congo": "congo (kinshasa)",
            "congo": "congo (brazzaville)",
            "dominican rep.": "dominican republic",
            "czechia": "czech republic",
            "eswatini": "swaziland",
            "palestine": "state of palestine",
            "bosnia and herz.": "bosnia and herzegovina",
            "central african rep.": "central african republic",
            "s. sudan": "south sudan",
            "russia": "russia",
            "south korea": "south korea",
            "north korea": "north korea",
            "laos": "laos",
            "syria": "syria",
            "iran": "iran",
            "moldova": "moldova",
            "vietnam": "vietnam",
            "taiwan": "taiwan province of china",
            "côte d'ivoire": "ivory coast"
        };

        let targetName = d.properties.name.toLowerCase();
        if (overrides[targetName]) targetName = overrides[targetName];

        if (nameMap[targetName]) return nameMap[targetName];

        // Kısmi eşleşme kontrolü
        for (let key in nameMap) {
            if (key.includes(targetName) || targetName.includes(key)) {
                return nameMap[key];
            }
        }
        return null;
    },

    drawMap(year) {
        if (!this.worldData) return;

        const countries = topojson.feature(this.worldData, this.worldData.objects.countries).features;

        // 1. Ülke çokgenlerini çiz
        const paths = this.g.selectAll(".country")
            .data(countries);

        paths.enter()
            .append("path")
            .attr("class", "country")
            .attr("d", this.path)
            .merge(paths)
            .style("transition", "fill 0.3s ease")
            .attr("fill", d => {
                const countryObj = this.getCountryObj(d, year);
                if (countryObj && countryObj.score) {
                    return this.colorScale(countryObj.score);
                }
                return "#1f2937"; // Veri yoksa zarif koyu gri arka plan
            })
            .attr("stroke", "rgba(255,255,255,0.1)")
            .attr("stroke-width", "0.5px")
            .on("mouseover", (event, d) => this.showTooltip(event, d))
            .on("mousemove", (event) => this.moveTooltip(event))
            .on("mouseout", () => this.hideTooltip());
            
        paths.exit().remove();

        // 2. Doğrudan Harita Üzerine (Ülkelerin İzdüşüm Merkezlerine) Canlı Skorları Yazdır
        const labels = this.g.selectAll(".country-label")
            .data(countries.filter(d => {
                const c = this.getCountryObj(d, year);
                return c && c.score;
            }));

        labels.enter()
            .append("text")
            .attr("class", "country-label")
            .merge(labels)
            .attr("transform", d => {
                const centroid = this.path.centroid(d);
                if (!centroid[0] || isNaN(centroid[0])) return "translate(-1000,-1000)";
                return `translate(${centroid[0]}, ${centroid[1]})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .attr("fill", "#ffffff")
            .style("font-size", d => {
                // Ülkenin haritadaki alan büyüklüğüne göre font boyutunu dinamik ayarla ki Avrupa/Karayip adalarında yazılar üst üste binmesin!
                const area = this.path.area(d);
                if (area > 2500) return "10px";
                if (area > 800) return "8.5px";
                if (area > 200) return "7px";
                return "0px"; // Küçük adalarda yazıyı gizle (sadece temiz kalsın, odakta belirtsin)
            })
            .style("font-family", "Inter, sans-serif")
            .style("font-weight", "700")
            .style("pointer-events", "none")
            .style("text-shadow", "0px 1px 2px rgba(0,0,0,0.9), 0px 0px 3px rgba(0,0,0,0.8)")
            .text(d => {
                const c = this.getCountryObj(d, year);
                return c ? c.score.toFixed(1) : "";
            });

        labels.exit().remove();

        // 3. Sağ Taraftaki "Canlı Bölge Oranları" Panelini Anlık Güncelle
        const regions = getRegions(year);
        const ratesListEl = document.getElementById('active-region-rates-list');
        if (ratesListEl) {
            ratesListEl.innerHTML = regions.map(r => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--accent-blue);">
                    <span style="font-weight: 500; font-size: 0.9rem; color: #e5e7eb;">${r.name}</span>
                    <strong style="color: var(--accent-gold); font-size: 1.05rem;">${r.avgScore}</strong>
                </div>
            `).join('');
        }
    },

    showTooltip(event, d) {
        const countryObj = this.getCountryObj(d, app.currentYear);
        
        if (countryObj) {
            // Harita Tooltipini Göster
            this.tooltip.html(`
                <div style="font-size: 1.1em; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin-bottom: 8px; color: #fff;">
                    ${countryObj.name}
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">Mutluluk Skoru:</span>
                    <strong style="color: var(--accent-gold); font-size: 1.1em;">${countryObj.score}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; font-size: 0.9em; margin-bottom: 2px;">
                    <span style="color: var(--text-muted);">Bölge:</span>
                    <span style="color: #e5e7eb;">${countryObj.region || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; font-size: 0.9em;">
                    <span style="color: var(--text-muted);">GDP Etkisi:</span>
                    <span style="color: #e5e7eb;">${countryObj.gdp !== undefined ? countryObj.gdp : '-'}</span>
                </div>
            `).classed("hidden", false);

            // Sağ paneldeki "Odak Ülke Bilgisi" kutusuna o ülkenin tam ayrıştırılmış saf faktörlerini ve "What Changed Happiness?" etki kümesini listele
            const selInfoEl = document.getElementById('map-selected-country-info');
            if (selInfoEl) {
                // Katkı etiketleri oluşturma (What Influenced Happiness?)
                let tags = [];
                if (countryObj.gdp > 1.2) tags.push('<span style="background:rgba(16,185,129,0.15); color:var(--accent-green); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Yüksek GDP</span>');
                else if (countryObj.gdp < 0.7) tags.push('<span style="background:rgba(239,68,68,0.15); color:var(--accent-red); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">- Düşük Ekonomi</span>');
                
                if (countryObj.social > 1.1) tags.push('<span style="background:rgba(16,185,129,0.15); color:var(--accent-green); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Sosyal Destek</span>');
                else if (countryObj.social < 0.8) tags.push('<span style="background:rgba(239,68,68,0.15); color:var(--accent-red); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">- Zayıf Sosyal Ağ</span>');

                if (countryObj.health > 0.75) tags.push('<span style="background:rgba(16,185,129,0.15); color:var(--accent-green); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Sağlıklı Yaşam</span>');
                else tags.push('<span style="background:rgba(239,68,68,0.15); color:var(--accent-red); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">- Sağlık Riski</span>');

                if (countryObj.freedom > 0.5) tags.push('<span style="background:rgba(59,130,246,0.15); color:var(--accent-blue); padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold;">+ Özgürlük</span>');

                selInfoEl.innerHTML = `
                    <div style="font-size: 1.1rem; font-weight: bold; color: #ffffff; margin-bottom: 4px;">${countryObj.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">${countryObj.region || '-'}</div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; margin-bottom: 10px;">
                        <span style="font-size:0.85rem;">Simüle Skor:</span> <strong style="color: var(--accent-gold); font-size: 1.2rem;">${countryObj.score.toFixed(2)}</strong>
                    </div>

                    <div style="margin-bottom: 10px;">
                        <div style="font-size:0.75rem; color:var(--accent-gold); text-transform:uppercase; margin-bottom:4px; font-weight:bold;">🔥 What Influenced Happiness?</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                            ${tags.join('')}
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                        <span>Ekonomik GDP Payı:</span> <span style="color: #9ca3af; font-family:monospace;">${countryObj.gdp}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                        <span>Sosyal Destek:</span> <span style="color: #9ca3af; font-family:monospace;">${countryObj.social}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                        <span>Sağlık Yaşam Bekl.:</span> <span style="color: #9ca3af; font-family:monospace;">${countryObj.health}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; font-size:0.85rem;">
                        <span>Özgürlük Katsayısı:</span> <span style="color: #9ca3af; font-family:monospace;">${countryObj.freedom}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size:0.85rem;">
                        <span>Yolsuzluk Algısı:</span> <span style="color: #9ca3af; font-family:monospace;">${countryObj.corruption}</span>
                    </div>
                `;
            }
        } else {
            const name = d && d.properties ? d.properties.name : 'Bilinmeyen Bölge';
            this.tooltip.html(`
                <strong style="color: #fff;">${name}</strong><br>
                <span style="color: var(--text-muted); font-size: 0.85em;">Bu yıla ait veri bulunamadı</span>
            `).classed("hidden", false);
        }
    },

    moveTooltip(event) {
        const containerRect = document.querySelector('.map-container').getBoundingClientRect();
        this.tooltip
            .style("left", (event.clientX - containerRect.left + 15) + "px")
            .style("top", (event.clientY - containerRect.top + 15) + "px");
    },

    hideTooltip() {
        this.tooltip.classed("hidden", true);
    }
};
