document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const cvFileInput = document.getElementById('cvFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const uploadForm = document.getElementById('uploadForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultPanel = document.getElementById('resultPanel');
    const emptyState = document.getElementById('emptyState');
    const resultsContent = document.getElementById('resultsContent');
    
    // File upload handling
    dropZone.addEventListener('click', () => cvFileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary', 'bg-slate-800/50');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary', 'bg-slate-800/50');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary', 'bg-slate-800/50');
        if (e.dataTransfer.files.length) {
            cvFileInput.files = e.dataTransfer.files;
            updateFileName();
        }
    });

    cvFileInput.addEventListener('change', updateFileName);

    function updateFileName() {
        if (cvFileInput.files.length > 0) {
            fileNameDisplay.textContent = cvFileInput.files[0].name;
            fileNameDisplay.classList.remove('hidden');
        }
    }

    // Chart Instance
    let chartInstance = null;

    // Form Submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = cvFileInput.files[0];
        const jobDesc = document.getElementById('jobDescription').value;

        if (!file || !jobDesc) {
            alert("Lütfen hem CV dosyasını yükleyin hem de iş ilanını doldurun.");
            return;
        }

        // Show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.classList.add('opacity-50', 'pointer-events-none');
        loadingOverlay.classList.remove('hidden');
        
        // Reset results panel
        resultPanel.classList.add('opacity-50', 'pointer-events-none');
        emptyState.classList.remove('hidden');
        resultsContent.classList.add('hidden');

        try {
            const formData = new FormData();
            formData.append('cv', file);
            formData.append('jobDescription', jobDesc);

            const response = await fetch('/api/analyze-cv', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Sunucu hatası oluştu.");
            }

            const data = await response.json();
            displayResults(data);

        } catch (error) {
            alert("Bir hata oluştu: " + error.message);
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('opacity-50', 'pointer-events-none');
            loadingOverlay.classList.add('hidden');
        }
    });

    function displayResults(data) {
        // Populate DOM elements
        document.getElementById('candidateName').textContent = data.candidate_name;
        document.getElementById('candidateContact').textContent = `Email & Tel: ${data.contact}`;
        
        const scoreElement = document.getElementById('matchScore');
        scoreElement.textContent = data.score + "%";
        
        // Adjust color based on score
        if (data.score >= 80) scoreElement.className = "text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500";
        else if (data.score >= 50) scoreElement.className = "text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500";
        else scoreElement.className = "text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500";
        
        document.getElementById('skillsCount').textContent = data.skills_count + " Adet";
        document.getElementById('expYears').textContent = data.experience;
        document.getElementById('aiSummary').textContent = data.ai_summary;

        // Show panel
        emptyState.classList.add('hidden');
        resultsContent.classList.remove('hidden');
        resultPanel.classList.remove('opacity-50', 'pointer-events-none');

        // Draw Chart
        const ctx = document.getElementById('skillsChart').getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Sektör Uyumu', 'İletişim & Sosyallik', 'Liderlik', 'Takım Çalışması', 'Problem Çözme'],
                datasets: [{
                    label: 'Karakter ve Beceri Profili',
                    data: data.chartData,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    pointBackgroundColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Outfit', size: 12 } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});
