# Zamanın Efendisi - Oyun Tasarım Belgesi (GDD)

## 1. Oyun Özeti
- **Tür:** 2.5D Puzzle-Platformer / Hafif Aksiyon
- **Tema:** Zaman Manipülasyonu, Stratejik İlerleme, Gizem
- **Hedef Kitle:** Portal, Braid, Katana Zero ve Celeste seven, bulmaca çözmeyi ve platform yeteneklerini test etmeyi seven oyuncular.
- **Kısa Açıklama:** Zamanın Efendisi, oyuncunun zamanı ileri ve geri sararak çevresel bulmacaları çözdüğü, ölümcül tuzaklardan kaçındığı ve düşmanları stratejik olarak alt ettiği, zamanın bir fizik kuralı değil, bir araç olduğu bir oyundur.

## 2. Temel Oynanış Mekanikleri

### 2.1. Standart Hareketler
- Sağa ve sola akıcı hareket.
- Zıplama, Çift Zıplama ve Havada Süzülme (Zaman yavaşlatması ile).
- Çevresel etkileşim (Kutu itme, şalter çekme, obje fırlatma).

### 2.2. Zaman Manipülasyonu (Ana Mekanikler)
- **Zamanı Geri Sarma (Rewind - Sol Tetik / Q Tuşu):** 
  - Oyuncunun ve çevredeki mekanizmaların son 5-10 saniyelik hareketini geriye alır.
  - *Kullanım:** Ölümcül bir düşüşten yaşam noktasına dönmek, yanlış planlanmış bir zıplamayı düzeltmek veya düşen bir asansörü tekrar yukarı çekmek.
- **Zamanı İleri Sarma (Fast Forward - Sağ Tetik / E Tuşu):**
  - Çevrenin (oyuncunun değil) zaman akışını hızlandırır.
  - *Kullanım:** Çok yavaş hareket eden bir platformu beklememek, belirli aralıklarla açılıp kapanan dikenli tuzakların döngüsünü pas geçmek, tohum halindeki bir bitkiyi devasa bir ağaca dönüştürüp köprü yapmak.
- **Zaman Çatlağı (Bölgesel Durdurma - Boşluk / Space):**
  - Belirli bir alanın (bir kürenin) içindeki zamanı dondurur. Bu sayede düşen bir kayayı havada dondurup üzerine basarak zıplayabilirsiniz.

### 2.3. Zaman Enerjisi ve Kısıtlamalar
- Zaman manipülasyonu sınırsız değildir; ekranın köşesinde bulunan **Akaşik Saat (Zaman Enerjisi Barı)** ile kısıtlıdır.
- Enerji, seviye içindeki "Zaman Parçaları (Kristalleri)" toplanarak veya güvenli bir noktada sabit durarak yavaşça dolar.
- Oyuncuyu spam yapmaktan (sürekli geri sarmaktan) alıkoyar ve düşündürür.

## 3. Bulmaca ve Çevre Tasarımı (Zamana Etkileşimli Nesneler)

- **Zaman Köprüleri:** Geçmişte sağlam olup şu an yıkık olan köprüler (Bölgesel geri sarma ile tamir edilir).
- **Yaşlanan/Gençleşen Düşmanlar:** Zamandan etkilenen bazı varlıklar ileri sarıldığında yaşlanıp zayıflar; geri sarıldığında ise savunmasız bir forma dönüşür.
- **Paradoks Kapıları:** Kapıyı açan buton odanın diğer ucundadır. Oyuncu butona bakar, zamanı durdurur veya butonun geçmişteki basılı haline döner. Mekanikler esnektir.

## 4. Seviye (Level) İlerlemesi

- **Bölüm 1: Uyanış Harabeleri (Öğretici):** Sadece 'Geri Sarma'nın öğretilmesi. Oyuncu sık sık uçuruma düşürülecek şekilde tasarlanır ki geri sarmayı bir refleks haline getirsin.
- **Bölüm 2: Sonsuz Dişliler (Saat Kulesi):** 'İleri Sarma'nın oyuna dahil olması. Dev çarklar, sarkaçlar ve ezici makinelerle ritim/zamanlama bulmacaları.
- **Bölüm 3: Unutulmuş Orman:** Biyolojik zamanlama. Tohumları büyütme, çürüyen bitkileri geri canlandırma.
- **Bölüm 4: Kırık Gerçeklik (Ayna Şehir):** Karmaşık kombinasyonlar. Zaman manipülasyonundan etkilenmeyen düşmanların ve objelerin ortaya çıkışı. İleri ve geri sarmanın aynı komboda kullanılması.

## 5. Düşmanlar ve Boss Savaşları

- **Zaman Bekçileri (Standart Düşman):** Zaman kurallarına tabidirler. Mermi attıklarında mermiyi geri sararak onları kendi mermileriyle vurabilirsiniz.
- **Aykırı Avcılar (Elit Düşman):** Zaman manipülasyonundan *etkilenmezler*. Siz zamanı dondursanız bile aktif kalırlar. Onları alt etmek için üzerlerine tavanı çökertmek gibi çevresel zaman hileleri uygulamalısınız.
- **Boss - Zaman Yiyen:** Geniş bir arenada, savaşı manipüle eden bir boss. Örnek: Boss ölümcül bir lazer saldırısı yapar, kaçmak imkansızdır; hayatta kalmanın tek yolu, boss saldırıyı yapmadan hemen önce zamanı geçmişe sarmak ve siperlerin arkasına saklanmaktır.

## 6. Görsel ve İşitsel Estetik (Art & Audio Direction)

- **Renk Paleti ve Görsel Efektler:**
  - **Normal Akış:** Estetik, doygun ve atmosferik renkler (Neon-Noir veya mistik fantastik).
  - **Geri Sarma (Rewind):** Ekranın VHS kaset gibi cızırtılanması (Glitch effect), renklerin mavi/mor tonlara dönmesi ve objelerin arkasında geçmiş pozisyonlarını gösteren "hayalet" (ghosting) izler bırakması.
  - **İleri Sarma (Fast Forward):** Ekran kenarlarında hız çizgileri (speedlines), turuncu/sarı sıcak tonlar ve yüksek hareket bulanıklığı (motion blur).
- **Müzik:** 
  - Müzik dinamiktir. Zamanı geri sardığınızda bölüm müziği anında tersine (reverse) çalar, ileri sardığınızda tempo ve ritim artar (pitch shift).

## 7. Hikaye ve Çoklu Sonlar (Kozmik Etki)

- **Ekstra Derinlik:** Oyuncunun zaman kristallerini kullanımı ve düşmanlara yaklaşımı dünyanın kaderini belirler.
  - *İyi Son (Uyum):* Zaman gücü sadece gerektiğinde ve doğayı bozmadan kullanıldıysa evren onarılır.
  - *Kötü Son (Zaman Kayması):* Oyuncu zamanı aşırı sömürür ve her hatasında geri sararsa, bir "Zaman Paradoksu" yaratır ve oyunun en başına -sonsuz bir döngüye- hapsolur.
