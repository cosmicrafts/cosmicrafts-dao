# Yönetişim
![Governance](govbanner.webp)

## Giriş

Cosmicrafts DAO, topluluğu merkeze koyar ve paydaşlara projenin nasıl büyüyeceği konusunda gerçek bir söz hakkı verir. Kanıtlanmış teknoloji üzerine inşa edilen DAO, Cosmicrafts'in vizyonuna sadık kalmasını sağlamak için adillik, şeffaflık ve topluluk odaklı karar verme süreçlerini kullanır.

::: info Okuma Kılavuzu
Bu belge, Cosmicrafts DAO'nun yönetişim çerçevesini, karar alma süreçlerini, teklif sistemlerini ve topluluk katılımını açıklar. Ekonomik yönleri kapsayan [Tokenomiks](/tokenomics) belgesini tamamlar.

- **Ana Odak**: Yönetişim süreçleri, oylama ve topluluk karar alma
- **Tamamlayıcı Belge**: Token ekonomisi ve faydası için [Tokenomiks](/tokenomics)
- **Çapraz Referanslar**: İlgili tokenomiks bölümlerine bağlanan ipucu kutularına bakın
:::

## DAO Temel İlkeleri

| İlke | Açıklama |
|-----------|-------------|
| **Topluluk Egemenliği** | • Kolektif karar alma gücü<br>• Şeffaf yönetişim süreci<br>• Zincir üstü oylama ve otomatik yürütme<br>|
| **Sürdürülebilir Büyüme** | • Uzun vadeli değer yaratma<br>• Dengeli ekosistem gelişimi<br>• Topluluk odaklı hazine yönetimi<br>• Veri odaklı değerlendirme sistemi |
| **Açık Katılım** | • Kapsayıcı yönetişim yapısı<br>• Düşük giriş bariyerleri<br>• Topluluk odaklı genişleme<br>• Çoklu zincir erişilebilirliği |

## Oylama Gücü Dağılımı

<div class="tokenomics-diagram">
  <img src="src/assets/icons/votingpower.svg" alt="SPIRAL Token Dağılımı" />
</div>

<style>
.tokenomics-diagram {
  text-align: center;
  width: 100%;
  margin: 4rem auto;
}

.tokenomics-diagram img {
  width: 65%;
  max-width: 800px;
  height: auto;
  filter: none;
  box-shadow: none;
  background: transparent;
  margin: 0 auto;
  display: block;
}

@media (max-width: 768px) {
  .tokenomics-diagram img {
    width: 100%;
    max-width: 100%;
  }
}
</style>

::: info Dinamik Oylama Gücü
Oylama gücünün gerçek dağılımı, paydaşların şu konulardaki kararlarına göre dalgalanacaktır:
- Nöronlarda stake edilen token miktarı
- Seçilen çözünme gecikmesi süresi
- Biriken nöron yaşı
Bu faktörler, farklı paydaş gruplarının göreceli etkisini zaman içinde önemli ölçüde değiştirebilir.
:::

| Paydaş Grubu | Oylama Payı | Temel Tokenlar | Amaç |
|-------------------|--------------|-------------|----------|
| **SNS Katılımcıları** | %50 | 120M | - En büyük oylama bloğu<br>- Topluluk odaklı yönetişim<br>- Katılım yoluyla artan etki potansiyeli |
| **Geliştirici Ekibi** | %33.3 | 80M | - Stratejik karar alma<br>- 1 yıl hak ediş ile 8 yıl çözünme gecikmesi<br>- Etkinin kademeli azalması |
| **Genesis/Seed** | %16.7 | 40M | - Erken destekçi temsili<br>- Kademeli çözünme gecikmeleri (0-7 yıl)<br>- Dengeli başlangıç etkisi |

### Güç Çarpanları

| Faktör | Maksimum Bonus | Ulaşma Süresi |
|--------|---------------|-----------------|
| **Çözünme Gecikmesi** | +%100 | 8 yıl |
| **Nöron Yaşı** | +%100 | 1 yıl |
| **Minimum Çözünme Gecikmesi** | N/A | 1 ay |
| **Birleşik Üst Sınır** | 3x temel güç | N/A |

## SNS Entegrasyonu

Cosmicrafts DAO, yönetişim altyapısı için Internet Computer'ın [Service Nervous System (SNS)](https://internetcomputer.org/docs/building-apps/governing-apps/overview) sisteminden yararlanır. Bu, merkezi olmayan karar alma için savaş testi yapılmış, güvenli bir çerçeve sağlar.

### Temel Özellikler

- **Nöron Tabanlı Oylama**: Yönetişime katılmak için SPIRAL tokenlarını stake ederek nöronlar oluşturun
- **Çözünme Gecikmesi Bonusları**: Daha uzun kilitleme süreleri oylama gücünü artırır
- **Yaş Bonusları**: Nöronlar zaman içinde daha fazla oylama gücü kazanır
- **Teklif Sistemi**: Tüm yönetişim eylemleri için standart SNS teklif çerçevesi

::: info SNS Yapılandırması
SNS kurulumumuzun minimum stake, oylama süreleri ve ödül oranları dahil olmak üzere detaylı teknik parametreleri için dokümantasyonumuzdaki SNS başlatma parametrelerine bakın.
:::

### Yönetişim Parametreleri

| Parametre | Değer | Amaç |
|-----------|--------|---------|
| **Ret Ücreti** | 1000 SPIRAL | Spam teklifleri önleme |
| **İlk Oylama Süresi** | 7 gün | Standart müzakere süresi |
| **Maksimum Süre Uzatma** | 1 gün | Geç katılıma izin verme |
| **Minimum Nöron Oluşturma Stake'i** | 1000 SPIRAL | Temel katılım eşiği |

## Nöron Stake Mekanikleri

### Temel Gereksinimler

| Parametre | Değer | Açıklama |
|-----------|--------|-------------|
| **Minimum Stake** | 1,000 SPIRAL | Nöron oluşturmak için gereken temel miktar |
| **Minimum Kilitleme Süresi** | 30 gün | İzin verilen en kısa çözünme gecikmesi |
| **Maksimum Kilitleme Süresi** | 8 yıl | Mümkün olan en uzun çözünme gecikmesi |
| **İşlem Ücreti** | 0.01 SPIRAL | Ağ işlem maliyeti |

### Olgunluk Programı

| Kilitleme Süresi | Bonus Çarpanı | Efektif Güç |
|-------------|------------------|-----------------|
| 30 gün | 1.0x | Temel Güç |
| 6 ay | 1.25x | +%25 |
| 1 yıl | 1.5x | +%50 |
| 2 yıl | 1.75x | +%75 |
| 4 yıl | 1.85x | +%85 |
| 8 yıl | 2.0x | +%100 |

## Karar Alma Çerçevesi

### Yönetişim Alanları

1. **Hazine Yönetimi**
   - Pazarlama Kampanyaları
   - Geliştirme Finansmanı
   - Stratejik Ortaklıklar

2. **Ekonomik Politikalar**
   - Tokenomiks Ayarlamaları
   - Stake Oranları
   - Ücret Yapıları

3. **Geliştirme Yol Haritası**
   - Özellik Önceliklendirme
   - Oyun Genişlemeleri
   - Teknik İyileştirmeler

### Teklif Sistemi

| Aşama | Süre | Gereksinimler |
|-------|----------|--------------|
| **Gönderim** | N/A | 1,000 SPIRAL stake |
| **İnceleme** | 24 saat | Topluluk geri bildirimi |
| **Oylama** | 7 gün | Aktif nöron gerekli |
| **Yürütme** | Değişken | Onaylanırsa otomatik |

::: info Topluluk Uygulaması
Hazine yönetimi, topluluk programları ve ekosistem büyüme girişimleri hakkında pratik detaylar için [Topluluk](/community) çerçevemize bakın.
:::

