import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

"""
3. Hafta: Profesyonel Veri Üretim ve Görselleştirme Modülü
Bu modül, akademik standartlarda normal dağılımlı veri seti üretir.
"""

# Estetik Ayarlar
sns.set_theme(style="whitegrid")
COLOR_PALETTE = ["#6C5B7B", "#C06C84"] # Modern, premium renk paleti

# Konfigürasyon
N_SAMPLES = 500
np.random.seed(101)

def veri_mimarisini_olustur():
    """500 satırlık, normal dağılımlı sentetik veri seti oluşturur."""
    ids = np.arange(1, N_SAMPLES + 1)

    # Değişken 1: Sınav Puanı (μ=72, σ=12)
    sinav_puani = np.clip(np.random.normal(72, 12, N_SAMPLES), 0, 100)

    # Değişken 2: Haftalık Çalışma Süresi (μ=20, σ=5)
    calisma_suresi = np.clip(np.random.normal(20, 5, N_SAMPLES), 0, 80)

    df = pd.DataFrame({
        'Öğrenci_ID': ids,
        'Sınav_Puanı': sinav_puani.round(1),
        'Haftalık_Çalışma_Saati': calisma_suresi.round(1)
    })

    df.to_csv('data.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] {N_SAMPLES} satirlik veri seti 'data.csv' olarak hazırlandı.")
    return df

def premium_gorsellestirme(df):
    """Verileri modern ve estetik grafiklerle raporlar."""
    fig, axes = plt.subplots(1, 2, figsize=(15, 7))
    fig.suptitle('3. Hafta: Akademik Performans Dagilim Analizi', fontsize=18, fontweight='bold', color='#355C7D')

    # Sol Grafik: Sınav Puanı
    sns.histplot(df['Sınav_Puanı'], kde=True, ax=axes[0], color=COLOR_PALETTE[0], bins=25, alpha=0.7)
    axes[0].set_title('Sinav Puani Dagilimi (Can Egrisi)', fontsize=14, pad=15)
    axes[0].set_xlabel('Puan (0-100)', fontsize=12)
    axes[0].set_ylabel('Ogrenci Sayisi', fontsize=12)

    # Sağ Grafik: Çalışma Süresi
    sns.histplot(df['Haftalık_Çalışma_Saati'], kde=True, ax=axes[1], color=COLOR_PALETTE[1], bins=25, alpha=0.7)
    axes[1].set_title('Haftalik Calisma Suresi Dagilimi', fontsize=14, pad=15)
    axes[1].set_xlabel('Toplam Saat', fontsize=12)
    axes[1].set_ylabel('Ogrenci Sayisi', fontsize=12)

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig('gorsellestirme.png', dpi=300) # Yüksek çözünürlük
    print("[OK] Premium gorsellestirme 'gorsellestirme.png' olarak kaydedildi.")

if __name__ == "__main__":
    print("\n" + "="*50)
    print("     PROFESYONEL VERI URETIM SISTEMI CALISIYOR")
    print("="*50 + "\n")
    
    dataset = veri_mimarisini_olustur()
    premium_gorsellestirme(dataset)
    
    print("\n" + "="*50)
    print("         TUM SURECLER TAMAMLANDI (v1.2)")
    print("="*50 + "\n")
