# Future Self: Evrilen Benlik Simülasyonu

## 1. Temel Konsept
Kullanıcı, kararlarına ve eylemlerine göre sürekli evrilen bir "Gelecek Benliği" ile etkileşime girer. Bu benlik, kullanıcıyı onaylayan bir asistan değil; onu ölçen, yargılayan ve simüle edilmiş sonuçları yüzüne vuran bir aynadır.

## 2. Karakter ve Avatar Sistemi
- Kullanıcı kendi fotoğrafını veya hedeflediği bir karakterin/kişinin fotoğrafını yükleyebilir.
- Karakter, 7/24 kullanıcının yanında olan, ekranın köşesinde aniden belirebilen (pop-up) ve durup dururken hesap sorabilen proaktif bir yapıdadır.

## 3. Dinamik State (Durum) Motoru
Karakterin davranışını belirleyen JSON profili:
```json
{
  "state": {
    "disiplin": 50,
    "stres": 30,
    "hedef_yakınlığı": 45,
    "karakter_tipi": "acımasız_mentor"
  }
}
```
- **Disiplinli davranışlar:** Karakterin daha net ve güçlü konuşmasını sağlar.
- **Tembellik/Kaçınma:** Karakterin isyan etmesine, hakaret etmesine veya hayal kırıklığıyla konuşmasına neden olur.

## 4. Geliştirme Haritası (Kullanıcı Tarafından Belirlenen)
- **1. Gün:** Basit chat ekranı ve UI.
- **2. Gün:** Sabit "Gelecek Sen" promptunun entegrasyonu.
- **3. Gün:** State sisteminin ve karar loglarının eklenmesi.
- **1. Hafta:** Evrim mekanizmasının (İyi/Kötü/Ortalama gelecek) tam aktivasyonu.
