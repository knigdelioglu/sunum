# Sunum — Scope

Bu dosya projenin ürün kapsamını, mimari sınırlarını ve ilk sürüm kabul kriterlerini tanımlar.

## 1. Ürün tanımı

Sunum, değişken içerikleri tek bir web tabanlı sunum motoru üzerinden yayınlayan bir sistemdir.

Temel model:

```text
Sunum içeriği (JSON)
        ↓
Sunum şeması + doğrulama
        ↓
Sabit renderer / tasarım sistemi
        ↓
Web sunumu
```

Her yeni sunum için yeni bir uygulama veya yeni bir tasarım sistemi oluşturulmaz.

## 2. Birincil kullanım senaryosu

Kullanıcı bir kaynağı ve sunum amacını yapay zekâya verir. Yapay zekâ:

- anlatım akışını kurar,
- slaytları planlar,
- uygun slayt tiplerini seçer,
- sunum verisini üretir.

Uygulama ise:

- sunum verisini doğrular,
- slaytları tutarlı biçimde render eder,
- taşma ve okunabilirlik sorunlarını kontrol eder,
- sunum navigasyonunu ve reveal davranışını yönetir.

## 3. V1 kapsamı

### 3.1 Sunum kütüphanesi

- Birden fazla sunum aynı repoda tutulabilir.
- Her sunum benzersiz bir `id` ile açılabilir.
- `/p/:id` biçiminde doğrudan bağlantı desteklenir.
- Ana sayfa mevcut sunumları listeleyebilir.
- Aktif sunum kavramı desteklenebilir; kök URL doğrudan aktif sunuma yönlenebilir.

### 3.2 Veri tabanlı içerik

Her sunum, mümkün olduğunca koddan bağımsız veri olarak tanımlanır.

Canonical konum:

```text
presentations/<presentation-id>/deck.json
```

Canonical veri sözleşmesi:

```text
schema/deck.schema.json
```

Sunum verisi en az şu üst seviye alanları içermelidir:

```json
{
  "schemaVersion": 1,
  "id": "example",
  "title": "Örnek Sunum",
  "slides": []
}
```

`deck.id` klasör adıyla aynı olmalıdır. Slayt id'leri aynı deck içinde benzersiz olmalıdır. Schema doğrulamasına ek olarak bu kurallar `scripts/validate-decks.mjs` ile kontrol edilir.

İleride opsiyonel olarak:

- açıklama,
- kategori,
- etiketler,
- kapak görseli,
- tema,
- kaynaklar,
- oluşturulma/güncellenme tarihi

eklenebilir.

### 3.3 Standart slayt tipleri

V1 için hedeflenen temel tipler:

- `title`
- `section`
- `text`
- `bullet`
- `question`
- `question_answer`
- `quote`
- `definitions`
- `comparison`
- `table`
- `timeline`
- `image_text`
- `two_column`
- `process`
- `summary`

Her tip kendi veri sözleşmesine sahip olmalıdır.

### 3.4 Reveal sistemi

Slayt içeriği gerektiğinde aşamalı gösterilebilir.

Reveal davranışı:

- deklaratif olmalı,
- slayt bileşenine özel keyfi JavaScript gerektirmemeli,
- klavye ve tıklama ile ilerleyebilmeli,
- geri gidildiğinde önceki reveal durumunu doğru geri yükleyebilmelidir.

Desteklenmesi gereken örnekler:

- soru → cevap,
- soru → ipucu → cevap → kanıt,
- kavramlar → anlamları,
- tablo satırlarının aşamalı açılması,
- maddelerin sırayla görünmesi.

### 3.5 Sunum modu

Sunum modu:

- 16:9 sahne üretmeli,
- tam ekran çalışabilmeli,
- tarayıcı içeriğine göre responsive ölçeklenmeli,
- gereksiz navigasyon ve editör arayüzlerini gizlemeli,
- klavye kontrolü sağlamalıdır.

Minimum kontroller:

- ileri,
- geri,
- tam ekran,
- slayt numarası,
- sunumdan çıkış.

### 3.6 Presenter modu

V1 sonu veya V1.1 için:

- mevcut slayt,
- sonraki slayt önizlemesi,
- öğretmen/sunucu notları,
- slayt numarası

gösterilebilir.

Presenter modu öğrenci/projeksiyon görünümünden ayrılmalıdır.

### 3.7 Tasarım sistemi

Renderer aşağıdakileri merkezi olarak yönetmelidir:

- tipografi,
- font ölçeği,
- boşluk sistemi,
- renk tokenları,
- kart/panel biçimleri,
- tablo biçimleri,
- başlık hiyerarşisi,
- responsive davranış.

Sunum JSON'u varsayılan olarak piksel koordinatı, keyfi CSS veya font boyutu belirtmemelidir.

### 3.8 İçerik güvenlik sınırları

JSON içeriği doğrudan keyfi HTML/JavaScript çalıştırmamalıdır.

Markdown veya zengin metin desteği eklenirse sanitize edilmelidir.

## 4. AI üretim sözleşmesi

Yapay zekâdan beklenen:

- sunumun hedef kitlesine göre akış oluşturmak,
- her slayta tek bir temel ileti yüklemek,
- uygun standart slayt tipini seçmek,
- gerekli reveal sırasını belirtmek,
- metni sunum için kısa ve okunabilir tutmak,
- kaynak gerektiren içeriklerde kaynak bilgisini korumak,
- geçerli şemaya uyan JSON üretmek.

Hazır üretim talimatı `prompts/CREATE_PRESENTATION.md` dosyasındadır. Repo üzerinde çalışan kodlama ajanları ayrıca `AGENTS.md` kurallarına uymalıdır.

Yapay zekâdan varsayılan olarak beklenmeyen:

- serbest CSS yazmak,
- slayt öğelerini koordinatlarla yerleştirmek,
- her sunuma yeni React bileşeni yazmak,
- tasarım sistemini sunum bazında değiştirmek.

## 5. Yeni / custom slayt politikası

V1 schema'sında `custom` tipi **yoktur**. İçerik üreten bir AI mevcut schema dışında yeni bir `type` uydurmamalıdır.

Mevcut tiplerle ifade edilemeyen gerçek bir ihtiyaç ortaya çıkarsa:

1. Önce mevcut standart tiplerle doğru biçimde çözülüp çözülemediği değerlendirilir.
2. İhtiyaç tekrar kullanılabilir ise yeni standart slayt tipi tasarlanabilir.
3. Yeni tip eklemek yalnız deck değişikliği değildir; ürün sözleşmesi değişikliğidir.
4. Schema, referans deck, validator, renderer ve ilgili testler birlikte güncellenmelidir.
5. Tek bir sunumu geçerli kılmak için schema gevşetilmemelidir.

## 6. Taşma ve kalite kontrolleri

Sunum motoru mümkün olduğunca aşağıdaki problemleri otomatik yakalamalıdır:

- başlık taşması,
- içerik taşması,
- okunamayacak kadar küçük font,
- aşırı madde sayısı,
- aşırı uzun paragraf,
- tablo hücresinde aşırı içerik,
- kırık görsel,
- desteklenmeyen slayt tipi,
- eksik zorunlu alan,
- geçersiz reveal hedefi.

Tercih edilen davranış sessizce küçültmek yerine geliştirme/build aşamasında açık uyarı veya hata üretmektir.

## 7. Görsel QA

Geliştirme sırasında sunumların gerçek renderer ile kontrol edilebilmesi hedeflenir.

İleride otomatik görsel QA şunları kapsayabilir:

- tüm slaytların ekran görüntüsü,
- overflow tespiti,
- boş/bozuk slayt tespiti,
- minimum font boyutu kontrolü,
- 16:9 viewport testi,
- mobil/tablet davranış kontrolü.

## 8. PWA / çevrimdışı çalışma

Okul ortamında internet bağlantısı güvenilir kabul edilmez.

Hedef:

- uygulama kabuğunu cache'lemek,
- daha önce açılmış sunumları çevrimdışı gösterebilmek,
- bağlantı kesildiğinde mevcut sunumu bozmamak.

Bu özellik temel renderer çalıştıktan sonra uygulanabilir.

## 9. Netlify dağıtımı

- Tek repo kullanılacaktır.
- Tek Netlify projesi kullanılacaktır.
- Tüm sunumlar aynı uygulama altında yayınlanacaktır.
- Yeni sunum eklemek yeni Netlify projesi gerektirmeyecektir.
- SPA route'ları Netlify üzerinde doğrudan açılabilir olmalıdır.

## 10. Teknoloji tercihi

İlk tercih:

- React
- TypeScript
- Vite
- JSON Schema Draft 2020-12
- Ajv tabanlı schema + semantik deck doğrulaması
- Netlify

Gerekirse uygulama büyüdüğünde ek kütüphaneler değerlendirilebilir; ancak sunum motorunun bağımsız ve hafif kalması önceliklidir.

## 11. V1 dışında

Aşağıdakiler ilk sürümün zorunlu kapsamı değildir:

- tam teşekküllü WYSIWYG editör,
- kullanıcı hesabı sistemi,
- çok kullanıcılı gerçek zamanlı düzenleme,
- veritabanı zorunluluğu,
- ayrı backend zorunluluğu,
- PowerPoint'i ana çıktı formatı yapmak,
- Google Slides klonu oluşturmak,
- her slaytta serbest sürükle-bırak koordinatlandırma,
- ileri düzey video düzenleme,
- sunum başına bağımsız web uygulaması oluşturmak.

## 12. PPTX yaklaşımı

PPTX ana kaynak değildir.

Doğru yön:

```text
Sunum JSON'u
   ├──→ Web renderer  ← ana çıktı
   └──→ PPTX export   ← opsiyonel çıktı
```

PPTX dışa aktarma ileride eklenirse web sunumunun birebir kopyası olmak zorunda değildir. İçerik ve hiyerarşi korunmalı; hedef formatın sınırlamalarına uygun ayrı bir export katmanı kullanılmalıdır.

## 13. Kabul kriterleri — ilk çalışan sürüm

İlk çalışan sürüm tamamlanmış sayılmak için:

- [x] Canonical `deck.schema.json` tanımlı.
- [x] Tüm desteklenen slayt tiplerini içeren referans deck var.
- [x] Deck validator mevcut.
- [x] Push/PR sırasında GitHub Actions deck doğrulaması çalıştırıyor.
- [ ] React + TypeScript uygulaması açılıyor.
- [ ] En az iki örnek sunum JSON'dan yüklenebiliyor.
- [ ] `/p/:id` rotası doğrudan çalışıyor.
- [ ] En az 8 temel slayt tipi render ediliyor.
- [ ] Reveal sistemi ileri/geri çalışıyor.
- [ ] Klavye navigasyonu çalışıyor.
- [ ] Tam ekran sunum yapılabiliyor.
- [ ] 16:9 sahnede içerik taşması kontrol ediliyor.
- [ ] Geçersiz deck verisi anlaşılır hata üretiyor.
- [ ] Netlify deploy'u SPA rotalarıyla çalışıyor.
- [ ] Sunum içeriği değiştirilirken renderer kodunu değiştirmek gerekmiyor.

## 14. Mimari karar ölçütü

Yeni bir özellik eklenirken şu soru sorulmalıdır:

> Bu özellik sunum motoruna mı ait, yoksa yalnızca tek bir sunumun içeriğine mi?

Tek bir sunuma ait içerik davranışı mümkün olduğunca veri katmanında kalmalıdır. Birden fazla sunumda tekrar edecek davranış renderer/tasarım sistemine taşınmalıdır.
