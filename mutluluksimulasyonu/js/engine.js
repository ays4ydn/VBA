// Global Index Engine & Simulation Models (Saf Veri İçin Uyarlandı)
const SimulationEngine = {
    // 9 Ana Faktör İçin Varsayılan Ağırlıklar
    weights: {
        gdp: 0.15,
        social: 0.15,
        health: 0.15,
        education: 0.15,
        banking: 0.10,
        environment: 0.10,
        freedom: 0.10,
        generosity: 0.05,
        corruption: 0.05
    },

    updateWeights(newWeights) {
        let total = Object.values(newWeights).reduce((a, b) => a + b, 0);
        if(total === 0) total = 1;

        this.weights = {
            gdp: newWeights.gdp / total,
            social: newWeights.social / total,
            health: newWeights.health / total,
            education: newWeights.education / total,
            banking: newWeights.banking / total,
            environment: newWeights.environment / total,
            freedom: newWeights.freedom / total,
            generosity: newWeights.generosity / total,
            corruption: newWeights.corruption / total
        };
    },

    // Saf verileri normalize ederek 0-10 arası simülasyon skoru üretir
    calculateScore(countryData) {
        // Normalizasyon Sınırları (Decomposed / Explained Shares)
        const minMax = {
            gdp: { min: 0.0, max: 2.3 },        // Explained by: GDP
            social: { min: 0.0, max: 1.6 },     // Explained by: Social
            health: { min: 0.0, max: 1.1 },     // Explained by: Health
            freedom: { min: 0.0, max: 0.8 },    // Explained by: Freedom
            generosity: { min: 0.0, max: 0.6 }, // Explained by: Generosity
            corruption: { min: 0.0, max: 0.6 }, // Explained by: Corruption (Contribution share)
            education: { min: 30, max: 130 },   // School enrollment % (WB)
            environment: { min: 0, max: 100 },  // Forest area % (WB)
            banking: { min: 0, max: 200 }       // Domestic credit to private sector % GDP (WB)
        };

        const normalize = (val, bounds) => Math.max(0, Math.min(1, (val - bounds.min) / (bounds.max - bounds.min)));

        const normGdp = normalize(countryData.gdp, minMax.gdp);
        const normSocial = normalize(countryData.social, minMax.social);
        const normHealth = normalize(countryData.health, minMax.health);
        const normFreedom = normalize(countryData.freedom, minMax.freedom);
        const normGen = normalize(countryData.generosity, minMax.generosity);
        const normCorrupt = normalize(countryData.corruption, minMax.corruption); // Direct contribution share
        
        const normEdu = normalize(countryData.education, minMax.education);
        const normEnv = normalize(countryData.environment, minMax.environment);
        const normBank = normalize(countryData.banking, minMax.banking);

        const score = (
            (this.weights.gdp * normGdp) +
            (this.weights.social * normSocial) +
            (this.weights.health * normHealth) +
            (this.weights.education * normEdu) +
            (this.weights.banking * normBank) +
            (this.weights.environment * normEnv) +
            (this.weights.freedom * normFreedom) +
            (this.weights.generosity * normGen) +
            (this.weights.corruption * normCorrupt)
        ) * 10;

        return parseFloat(score.toFixed(3));
    },

    recalculateGlobal(countries) {
        return countries.map(c => {
            return {
                ...c,
                score: this.calculateScore(c)
            };
        }).sort((a, b) => b.score - a.score);
    },

    runScenario(countries, type) {
        let modified = JSON.parse(JSON.stringify(countries)); 
        
        switch(type) {
            case 'crisis':
                // Ekonomik kriz: GDP payı 0.2, Sosyal pay 0.1 düşer
                modified.forEach(c => {
                    c.gdp = Math.max(0, c.gdp - 0.2);
                    c.social = Math.max(0, c.social - 0.1);
                });
                break;
            case 'health':
                // Sağlık atılımı: Payı 0.6'nın altında olanlar 0.15 artar
                modified.forEach(c => {
                    if(c.health < 0.6) c.health = Math.min(1.1, c.health + 0.15);
                });
                break;
            case 'freedom':
                // Özgürlük reformu: Özgürlük payı 0.1 artar
                modified.forEach(c => {
                    c.freedom = Math.min(0.8, c.freedom + 0.1);
                });
                break;
        }

        return this.recalculateGlobal(modified);
    }
};
