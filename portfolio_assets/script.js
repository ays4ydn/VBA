document.addEventListener("DOMContentLoaded", () => {
    
    // 0. SAHNE YÖNETİMİ (STAGE MECHANICS)
    let currentStage = 1;
    let stars = [];
    let stardust = []; // For Stage 2 cursor magic

    function initStars() {
        stars = [];
        for(let i=0; i<300; i++) {
            stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2,
                speed: Math.random() * 0.8 + 0.2
            });
        }
    }

    function transitionToStage2() {
        if (currentStage === 2) return;
        currentStage = 2;
        
        // Stage 2'ye geçince alevlerin her şeyin (butonların ve kalenin) üstünde uçuşması için Canvas Z-index artırılır!
        document.getElementById('particle-canvas').style.zIndex = '2000';
        
        // Hide Stage 1 container and cats natively
        const glass = document.querySelector('.glass-container');
        if (glass) {
            glass.style.transition = 'opacity 1s ease';
            glass.style.opacity = '0';
            glass.style.pointerEvents = 'none';
        }
        
        // Orijinal Cat gizleme
        const fElton = document.getElementById('sir-elton');
        const fMad = document.getElementById('madonna');
        if (fElton) fElton.style.display = 'none';
        if (fMad) fMad.style.display = 'none';
        
        // Setup Misfit Stars over Hogwarts
        initStars();
        
        // Stardust Cleanup
        stardust = [];
        
        // Show Stage 2 container
        const stage2 = document.getElementById('stage2-container');
        if (stage2) {
            stage2.style.display = 'flex';
            setTimeout(() => {
                stage2.classList.add('active');
            }, 100);
        }

        // 1. Ejderha animasyonunun süzülüp yerleşme anı (4 sn)
        setTimeout(() => {
            isBreathingFire = true;
        }, 4000);

        // Alevlerin merkeze düşmeye başladığı an (4.5 sn). Buton maskesi genişlemeye başlar!
        setTimeout(() => {
            const btn = document.getElementById('explore-btn');
            if (btn) btn.classList.add('show');
        }, 4500);

        // 2. Alevlerin toplanıp patlama anı bitişi (7.5 sn)
        setTimeout(() => {
            isBreathingFire = false;
        }, 7500);
    }

    // Bind transition to button
    const mainBtn = document.getElementById('main-transition-btn');
    if (mainBtn) {
        mainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            transitionToStage2();
        });
    }

    // 1. Ejderha animasyonunun süzülüp yerleşme anı (4 sn)
    // --- MAIN RENDER LOOP GLOBS ---
    let isHarryRiding = false;
    const harrySprite = new Image();
    harrySprite.src = './portfolio_assets/harry_transparent.png';
    
    window.mountBroom = function() {
        if (isHarryRiding) return;
        isHarryRiding = true;
        
        const toy = document.getElementById('harry-potter-toy');
        const bubble = document.getElementById('harry-bubble');
        
        if (bubble) {
            bubble.innerText = "ACCIO SÜPÜRGE! 🧹💨";
            bubble.classList.add('active');
        }
        
        // 1. Süpürgeyi Çağır (Visual "calling" moment)
        setTimeout(() => {
            if (toy) {
                toy.classList.add('flying');
                // Yukarı fırla (Zoom off-screen)
                toy.style.transition = 'transform 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.8s';
                toy.style.transform = 'translate(-50%, -800px) rotate(-15deg) scale(0.5)';
                toy.style.opacity = '0';
            }
            if (bubble) bubble.style.opacity = '0';
        }, 1200);
        
        // Siyah ekran olmaması için Stage 2'de KAL! (Don't redirect or hide background)
    };

    // 1. ADD CAT ELEMENTS (Sir Elton and Madonna)
    const elton = document.createElement('div');
    elton.id = 'sir-elton';
    elton.classList.add('pet-cat', 'sir-elton');
    document.body.appendChild(elton);

    const madonna = document.createElement('div');
    madonna.id = 'madonna';
    madonna.classList.add('pet-cat', 'madonna');
    document.body.appendChild(madonna);

    // 2. CANVAS & LIVING PLANETS
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let width, height;
    let planets = [];
    let mouseTrail = [];

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        planets = [];
        const planetCount = Math.floor((width * height) / 25000);
        for(let i=0; i < planetCount; i++) {
            planets.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 15 + 25, // Sizes 25 to 40
                color: getPlanetColor(),
                state: 'normal', // normal, curious, surprised
                timer: 0
            });
        }
    }

    function getPlanetColor() {
        const colors = ['#66FCF1', '#A64AFF', '#FF4AF1', '#FFC864', '#4A90E2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let globalSurprise = false;
    
    // Frustration Tracker for User Empathy
    let struggleFrames = 0;
    let buttonsFrozen = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 3. MORE AGGRESSIVE EVASIVE BUTTONS LOGIC
    const buttons = document.querySelectorAll('.primary-btn, .sec-btn');
    buttons.forEach(btn => {
        btn.tx = 0; btn.ty = 0; btn.vx = 0; btn.vy = 0;
    });

    function animateEvasiveButtons() {
        buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = centerX - mouseX;
            const dy = centerY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 320 && !buttonsFrozen) {
                const angle = Math.atan2(dy, dx);
                // Artık çooooooooooook daha güçlü ve uzağa itilecekler
                const force = Math.pow((320 - dist) / 320, 1.2); 
                btn.vx += Math.cos(angle) * force * 250;
                btn.vy += Math.sin(angle) * force * 250;
                
                // Kedi çevikliğini vermek için biraz da yanlara doğru "kaçış" manevrası ekliyoruz
                const chaosAngle = angle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
                btn.vx += Math.cos(chaosAngle) * force * 120;
                btn.vy += Math.sin(chaosAngle) * force * 120;
                
                globalSurprise = true; // Planets react to the buttons scuttering!
                struggleFrames++; // User is struggling!
            }
            
            // Merkeze geri çekme (Spring) kuvveti neredeyse 0 yapıldı, böylece yavaş gidince merkez çekemeyecek!
            btn.vx -= btn.tx * 0.002;
            btn.vy -= btn.ty * 0.002;
            btn.vx *= 0.95; // Daha ince sürtünme = daha uzağa kayış
            btn.vy *= 0.95;
            btn.tx += btn.vx;
            btn.ty += btn.vy;
            btn.style.transform = `translate(${btn.tx}px, ${btn.ty}px)`;
            btn.style.transition = 'none';
        });
        
        // Handle Frustration Help System
        if (struggleFrames > 0 && !globalSurprise) {
            struggleFrames -= 0.5; // Cool down
        }
        
        if (struggleFrames > 5 && !buttonsFrozen) { // Anında müdahale için sadece 5 frame hata payı!
            struggleFrames = 0; // Sınırsız sıklık
            buttonsFrozen = true; 
            
            // Yürüyerek gelmesini beklemeyin, kediyi anında farenin yanına IŞINLIYORUZ!
            let helperCat = Math.random() > 0.5 ? fSirElton : fMadonna;
            helperCat.x = mouseX - 80; 
            helperCat.y = mouseY - 100;
            
            helperCat.isHelping = true; 
            helperCat.bubble.style.opacity = '1';
            
            // Butonları çok daha kısa süre (1.6s) dondurup art arda daha sık çıkmasını sağla
            setTimeout(() => {
                buttonsFrozen = false;
                if (helperCat) {
                    helperCat.bubble.style.opacity = '0';
                    helperCat.isHelping = false; 
                }
            }, 1600);
        }
    }

    function animatePlanetsAndMars() {
        ctx.clearRect(0, 0, width, height);

        if (currentStage === 1) {
            // Planet physics and rendering (Boids / Emotional System)
            for(let i=0; i<planets.length; i++) {
                let p = planets[i];
                
                // Randomly get curious or react
                p.timer--;
                if (p.timer <= 0) {
                    p.timer = Math.random() * 200 + 100;
                    p.state = Math.random() > 0.6 ? 'curious' : 'normal';
                }
                if (globalSurprise) {
                    p.state = 'surprised';
                    p.timer = 60; // 1 second of surprise
                }

                // Curiosity push (steering toward mouse to "look" over the user's shoulder)
                if (p.state === 'curious') {
                    const dx = mouseX - p.x;
                    const dy = mouseY - p.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 150) {
                        p.vx += (dx / dist) * 0.06;
                        p.vy += (dy / dist) * 0.06;
                    }
                }

                p.vx *= 0.98; // Friction in space
                p.vy *= 0.98;
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if(p.x < p.radius) { p.x = p.radius; p.vx *= -1; }
                if(p.x > width - p.radius) { p.x = width - p.radius; p.vx *= -1; }
                if(p.y < p.radius) { p.y = p.radius; p.vy *= -1; }
                if(p.y > height - p.radius) { p.y = height - p.radius; p.vy *= -1; }

                // Collision with other planets (pushing each other out of the way to see)
                for(let j=i+1; j<planets.length; j++) {
                    let p2 = planets[j];
                    let dx = p2.x - p.x;
                    let dy = p2.y - p.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let minDist = p.radius + p2.radius + 5; // 5px padding
                    
                    if (dist < minDist && dist > 0) {
                        let angle = Math.atan2(dy, dx);
                        let overlap = minDist - dist;
                        let force = overlap * 0.05;
                        p.vx -= Math.cos(angle) * force;
                        p.vy -= Math.sin(angle) * force;
                        p2.vx += Math.cos(angle) * force;
                        p2.vy += Math.sin(angle) * force;
                    }
                }

                // Draw Planet Base
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.closePath();

                // Draw Faces looking exactly at Mars (Cursor)
                const angleToMouse = Math.atan2(mouseY - p.y, mouseX - p.x);
                const eyeOffset = p.radius * 0.4;
                
                // White sclera
                ctx.beginPath();
                ctx.arc(p.x - eyeOffset, p.y - eyeOffset/3, p.radius*0.3, 0, Math.PI*2);
                ctx.arc(p.x + eyeOffset, p.y - eyeOffset/3, p.radius*0.3, 0, Math.PI*2);
                ctx.fillStyle = 'white';
                ctx.fill();

                // Black Pupils pointing strictly at the angle
                const pupilOffX = Math.cos(angleToMouse) * (p.radius*0.15);
                const pupilOffY = Math.sin(angleToMouse) * (p.radius*0.15);
                ctx.beginPath();
                ctx.arc(p.x - eyeOffset + pupilOffX, p.y - eyeOffset/3 + pupilOffY, p.radius*0.12, 0, Math.PI*2);
                ctx.arc(p.x + eyeOffset + pupilOffX, p.y - eyeOffset/3 + pupilOffY, p.radius*0.12, 0, Math.PI*2);
                ctx.fillStyle = '#0a0a0a';
                ctx.fill();

                // Dynamic Mouth Expressions
                ctx.beginPath();
                if (p.state === 'surprised') {
                    ctx.arc(p.x, p.y + p.radius*0.3, p.radius*0.15, 0, Math.PI*2);
                    ctx.fillStyle = '#ff7a7a'; // Inner mouth color
                    ctx.fill();
                } else if (p.state === 'curious') {
                    ctx.arc(p.x, p.y + p.radius*0.4, p.radius*0.1, 0, Math.PI); // Half circle smile
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                } else {
                    ctx.moveTo(p.x - p.radius*0.15, p.y + p.radius*0.4);
                    ctx.lineTo(p.x + p.radius*0.15, p.y + p.radius*0.4); // straight face
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        } else {
            // ===================================
            // STAGE 2: HOGWARTS SİHİRLİ TOZ VE SÜPÜRGE
            // ===================================
            
            // Draw faint magical fog/glow over the school
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for(let i=0; i<stars.length; i++) {
                let s = stars[i];
                s.x -= s.speed;
                if (s.x < 0) s.x = width;
                ctx.globalAlpha = Math.abs(Math.sin((Date.now() * 0.001) + i)) * 0.5;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            if (mouseX !== 0) {
                for(let i=0; i<3; i++) {
                    stardust.push({
                        x: mouseX + (Math.random() - 0.5) * 15,
                        y: mouseY + (Math.random() - 0.5) * 15,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2 - 1, 
                        age: 0,
                        size: Math.random() * 4 + 1.5,
                        color: Math.random() > 0.5 ? '#00ffcc' : '#7a00ff'
                    });
                }
            }

            ctx.globalCompositeOperation = 'lighter'; 
            
            for(let i=0; i<stardust.length; i++) {
                let p = stardust[i];
                p.x += p.vx;
                p.y += p.vy;
                p.age++;
                p.size *= 0.94; 
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
            stardust = stardust.filter(p => p.age < 35);

            // Ejderha Çizim Formülleri Tamamen Silindi


            // Uçan Süpürge İmleci (Broom) En üstte çizilsin
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffcc';
            
            if (isHarryRiding) {
                ctx.font = '60px Arial';
                ctx.fillText('🧹', mouseX + 15, mouseY + 20);
                ctx.shadowBlur = 0;
                // Harry'i süpürgenin hemen üstüne (ofsetli) oturt
                ctx.drawImage(harrySprite, mouseX - 35, mouseY - 65, 65, 65);
            } else {
                ctx.font = '40px Arial';
                ctx.fillText('🧹', mouseX, mouseY);
                ctx.shadowBlur = 0;
            }
        }

        globalSurprise = false;

        if (currentStage === 1) {
            // ===================================
            // STAGE 1: MARS CURSOR TAIL & DRAW
            // ===================================
            if (mouseX !== 0) {
                mouseTrail.push({ x: mouseX, y: mouseY, age: 0 });
            }
            
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            if (mouseTrail.length > 1) {
                ctx.beginPath();
                for (let i = 0; i < mouseTrail.length; i++) {
                    if (i === 0) ctx.moveTo(mouseTrail[i].x, mouseTrail[i].y);
                    else ctx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
                }
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(255, 60, 0, 1)';
                ctx.strokeStyle = 'rgba(255, 60, 0, 0.5)';
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            for (let i = 0; i < mouseTrail.length; i++) mouseTrail[i].age++;
            mouseTrail = mouseTrail.filter(p => p.age < 15);

            // Draw Mars itself directly on the cursor
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 18, 0, Math.PI*2);
            let marsGradient = ctx.createRadialGradient(mouseX-5, mouseY-5, 3, mouseX, mouseY, 18);
            marsGradient.addColorStop(0, '#ff9a76'); 
            marsGradient.addColorStop(1, '#a62d00'); 
            ctx.fillStyle = marsGradient;
            ctx.fill();
            
            // Mars Craters
            ctx.beginPath();
            ctx.arc(mouseX - 6, mouseY + 4, 4, 0, Math.PI*2);
            ctx.arc(mouseX + 7, mouseY - 5, 3, 0, Math.PI*2);
            ctx.arc(mouseX + 3, mouseY + 9, 5, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(100, 20, 0, 0.5)'; // Darker rust
            ctx.fill();
            
        } else {
            // ===================================
            // STAGE 2: COSMIC STARDUST CURSOR
            // ===================================
            if (mouseX !== 0) {
                for(let i=0; i<3; i++) {
                    stardust.push({
                        x: mouseX + (Math.random() - 0.5) * 15,
                        y: mouseY + (Math.random() - 0.5) * 15,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2 - 1, // Süzülerek yukarı çıkar
                        age: 0,
                        size: Math.random() * 4 + 1.5,
                        color: Math.random() > 0.5 ? '#00ffcc' : '#7a00ff'
                    });
                }
            }

            // Efsanevi parlama efekti
            ctx.globalCompositeOperation = 'lighter'; 
            
            for(let i=0; i<stardust.length; i++) {
                let p = stardust[i];
                p.x += p.vx;
                p.y += p.vy;
                p.age++;
                p.size *= 0.94; // Küçülerek kaybolur
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
            stardust = stardust.filter(p => p.age < 35);

            // Merkezdeki saf enerji çekirdeği (Ana imleç)
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 6, 0, Math.PI*2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffcc';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // 4. SIR ELTON & MADONNA (STAMINA PHYSICS ENGINE)
    class StaminaCat {
        constructor(domElement, speed, maxStamina, drainRate, recoverRate, name) {
            this.element = domElement;
            this.name = name;
            
            this.bubble = document.createElement('div');
            this.bubble.classList.add('speech-bubble');
            this.bubble.innerText = 'Yardım lazım mı? 😹 (Hadi Tıkla!)';
            
            // Sahne Geçişi (Stage 2 Portal) Tetikleyicisi
            this.bubble.style.pointerEvents = 'auto';
            this.bubble.style.cursor = 'pointer';
            this.bubble.addEventListener('click', (e) => {
                e.stopPropagation();
                transitionToStage2();
            });
            
            this.element.appendChild(this.bubble);
            
            // Start off-screen
            this.x = window.innerWidth + 200 + Math.random()*200;
            this.y = window.innerHeight / 2 + (Math.random()*100 - 50);
            this.vx = 0;
            this.vy = 0;
            
            // Stamina profile configuration
            this.baseSpeed = speed;
            this.stamina = maxStamina;
            this.maxStamina = maxStamina;
            this.drainRate = drainRate; // How fast they get tired
            this.recoverRate = recoverRate; // How fast they rest up
            this.isResting = false;
            this.isHelping = false; // To freeze them entirely when rendering bubble
            
            this.scaleBase = 1.0; 
        }

        update() {
            if (mouseX === 0) return;
            
            let flipX = this.vx > 0 ? -1 : 1; 

            if (this.isHelping) {
                // Zınk diye dursun, fizik iptal. Beyaz bir aydınlanma verilsin.
                this.vx = 0; 
                this.vy = 0;
                this.element.style.transform = `translate(${this.x}px, ${this.y}px) scaleX(${flipX * this.scaleBase}) scaleY(${this.scaleBase})`;
                this.element.style.filter = `drop-shadow(0 0 50px rgba(255,255,255,0.9)) saturate(1.5)`;
                return; // Cancel all other movements
            }

            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            let isRunning = false;

            if (this.isResting) {
                // Recover breath
                this.stamina += this.recoverRate;
                if (this.stamina >= this.maxStamina) {
                    this.isResting = false; // Fully recovered! Back to the hunt
                    this.stamina = this.maxStamina;
                }
            } else {
                // Chase Mars
                if (dist > 60) {
                    isRunning = true;
                    this.vx += (dx / dist) * this.baseSpeed;
                    this.vy += (dy / dist) * this.baseSpeed;
                    this.stamina -= this.drainRate; // Get tired doing this
                    
                    if(this.stamina <= 0) {
                        this.stamina = 0;
                        this.isResting = true; // Dropping to catch breath!
                    }
                }
            }

            // High friction for sharp, heavy acceleration stops
            this.vx *= 0.88; 
            this.vy *= 0.88;
            this.x += this.vx;
            this.y += this.vy;

            // DOM Visuals (Breathing, Exhaustion, Galloping)
            flipX = this.vx > 0 ? -1 : 1; 
            
            if (this.isResting) {
                 // Heavy panting animation (stretching vertically very quickly)
                 let breath = Math.sin(Date.now() / 150) * 0.15;
                 this.element.style.transform = `translate(${this.x}px, ${this.y}px) scaleX(${flipX * this.scaleBase}) scaleY(${this.scaleBase - breath})`;
                 // Become exhausted/grayed out
                 this.element.style.filter = `drop-shadow(0 10px 10px rgba(0,0,0,0.5)) saturate(0.5) brightness(0.8)`;
            } else {
                 if (isRunning) {
                     // Running fast causes vertical bobbing based on speed
                     let speedFactor = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
                     let bounce = Math.abs(Math.sin(Date.now() / 50)) * 6 * speedFactor;
                     let tilt = this.vx * 1.5;
                     this.element.style.transform = `translate(${this.x}px, ${this.y - bounce}px) scaleX(${flipX * this.scaleBase}) scaleY(${this.scaleBase}) rotate(${tilt}deg)`;
                     this.element.style.filter = `drop-shadow(0 25px 35px rgba(0,0,0,0.9)) saturate(1.2)`;
                 } else {
                     // Just idling near the target
                     this.element.style.transform = `translate(${this.x}px, ${this.y}px) scaleX(${flipX * this.scaleBase}) scaleY(${this.scaleBase})`;
                     this.element.style.filter = `drop-shadow(0 15px 20px rgba(0,0,0,0.7))`;
                 }
            }
        }
    }

    // Sir Elton runs slower, tires out extremely fast (lazy fat orange cat), recovers slow.
    const fSirElton = new StaminaCat(document.getElementById('sir-elton'), 1.8, 100, 1.5, 0.3, 'sir-elton');
    
    // Madonna runs faster, tires slowly (energetic gray cat), recovers fast.
    const fMadonna = new StaminaCat(document.getElementById('madonna'), 2.6, 100, 0.4, 0.8, 'madonna');

    // --- MAIN RENDER LOOP ---
    
    // Global variables for Harry Toy logic
    let harryX = 50; // percentage
    let harryDirection = 1;
    let harryWait = 0;
    
    // Global variables for Fire Engine
    let isBreathingFire = false;
    let dragonFireParticles = [];

    function render() {
        requestAnimationFrame(render);
        
        if (currentStage === 1) {
            animateEvasiveButtons();
            fMadonna.update();
            fSirElton.update();
        } else {
            // Stage 2: Harry Potter Rigid Body Logic
            const harryToy = document.getElementById('harry-potter-toy');
            const harryBubble = document.getElementById('harry-bubble');
            
            if (harryToy && harryBubble) {
                const rect = harryToy.getBoundingClientRect();
                const hX = rect.left + rect.width / 2;
                const hY = rect.top + rect.height / 2;
                
                const dist = Math.sqrt((mouseX - hX)**2 + (mouseY - hY)**2);
                
                // --- Stardust Effect ---
                if (currentStage === 2 && mouseX !== 0) {
                    if (Math.random() > 0.7) {
                        stardust.push({
                            x: mouseX, y: mouseY,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2,
                            life: 1.0,
                            size: Math.random() * 4 + 2
                        });
                    }
                }

                if (dist < 250 && mouseX !== 0) {
                    // Meraklı Bakış (Idle near mouse / broom summoning)
                    harryBubble.classList.add('active');
                    harryToy.style.transform = mouseX < hX ? 'translateX(-50%) scaleX(-1)' : 'translateX(-50%) scaleX(1)';
                    harryWait = 30; // Etkileşim biterse bir an dursun
                    harryToy.classList.remove('walking');
                    harryToy.classList.add('sitting');
                } else {
                    harryBubble.classList.remove('active');
                    
                    // Dynamic Animation Character Pacing (Akıcı Volta)
                    harryWait--;
                    if (harryWait <= 0) {
                        harryToy.classList.add('walking');
                        harryToy.classList.remove('sitting');
                        
                        let speed = 0.4 + Math.sin(Date.now() / 1000) * 0.1; // Değişken hız
                        harryX += speed * harryDirection; 
                        
                        // Ekran sınırları ve rastgele pause (Bekleme) mantığı
                        if (harryX > 82) { harryDirection = -1; harryWait = 40 + Math.random() * 60; }
                        if (harryX < 18) { harryDirection = 1; harryWait = 40 + Math.random() * 60; }
                        
                        // Rastgele Zıplama (Random Jump)
                        if (Math.random() > 0.992 && !harryToy.classList.contains('jumping')) {
                            harryToy.classList.add('jumping');
                            setTimeout(() => harryToy.classList.remove('jumping'), 600);
                        }

                        harryToy.style.left = `${harryX}%`;
                        harryToy.style.transform = harryDirection === 1 ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(-1)';
                    } else {
                        // "Düşünüyor" veya "Bakınıyor" gibi dursun
                        harryToy.classList.remove('walking');
                        harryToy.classList.add('sitting');
                    }
                }
            }
        }
        
        animatePlanetsAndMars();
    }

    window.addEventListener("resize", initCanvas);
    initCanvas();
    render();
});
