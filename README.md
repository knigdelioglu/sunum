# Sunum

Yapay zekâ ile hızlı, tutarlı ve tekrar kullanılabilir **web tabanlı sunumlar** üretmek için sunum motoru.

Bu projenin temel yaklaşımı, her sunum için ayrı bir uygulama geliştirmek yerine **tek bir sunum renderer'ı** kullanmak ve değişen içeriği veri olarak tutmaktır.

```text
Yapay zekâ / editör
        ↓
deck.json
        ↓
Sunum motoru
        ↓
Web sunumu
        ↓
Netlify
```

## Amaç

- PowerPoint/PPTX üretimindeki yerleşim, taşma ve biçim tutarsızlıklarını azaltmak.
- Yapay zekânın doğrudan piksel düzeyinde tasarım yapması yerine yapılandırılmış sunum içeriği üretmesini sağlamak.
- Tek repo ve tek Netlify projesi üzerinden birden fazla sunumu yayınlamak.
- Sunumları URL ile açabilmek ve gerektiğinde tek bir “aktif sunum” adresi kullanmak.
- Sunumlarda aşamalı gösterim, soru-cevap, kavram açıklaması, tablo, karşılaştırma ve zaman çizgisi gibi öğretim odaklı etkileşimleri desteklemek.
- Okul ortamında bağlantı sorunlarına karşı çevrimdışı/önbellek desteğine uygun bir temel oluşturmak.

## Temel ilke

**İçerik ile sunum motoru birbirinden ayrıdır.**

Sunum motoru görünüm, tipografi, yerleşim, responsive davranış, klavye kontrolü ve reveal/animasyon davranışlarını yönetir. Yapay zekâ ise mümkün olduğunca yalnızca sunumun akışını ve içeriğini üretir.

Örnek:

```json
{
  "id": "osmancik",
  "title": "Osmancık",
  "slides": [
    {
      "type": "title",
      "title": "Osmancık",
      "subtitle": "Tarık Buğra"
    },
    {
      "type": "question",
      "question": "Osmancık'ın değişiminin temel nedeni nedir?",
      "answer": "Bireysel benliğini aşarak toplumsal bir sorumluluk üstlenmesidir.",
      "reveal": ["answer"]
    }
  ]
}
```

## Canonical deck formatı

Sunum içeriğinin tek sözleşmesi [schema/deck.schema.json](./schema/deck.schema.json) dosyasıdır.

Her sunum:

```text
presentations/<sunum-id>/deck.json
```

konumunda tutulur. Deck içinde `schemaVersion: 1` bulunmalı ve `deck.id` klasör adıyla aynı olmalıdır.

Tüm desteklenen slayt tiplerini gösteren çalışan örnek:

[**presentations/format-demo/deck.json**](./presentations/format-demo/deck.json)

AI'ya yeni sunum hazırlatırken kullanılacak hazır talimat:

[**prompts/CREATE_PRESENTATION.md**](./prompts/CREATE_PRESENTATION.md)

Kodlama ajanları için repo kuralları:

[**AGENTS.md**](./AGENTS.md)

## Repo yapısı

```text
sunum/
├── schema/
│   └── deck.schema.json          # Canonical veri sözleşmesi
├── presentations/
│   └── format-demo/
│       └── deck.json             # Referans deck
├── prompts/
│   └── CREATE_PRESENTATION.md    # AI sunum üretim promptu
├── scripts/
│   └── validate-decks.mjs        # Schema + semantik doğrulama
├── public/
│   └── images/
├── src/                          # Sunum motoru (sonraki aşama)
├── AGENTS.md
├── SCOPE.md
└── README.md
```

Deck'leri yerelde doğrulamak için:

```bash
npm install
npm run validate:decks
```

Aynı doğrulama GitHub Actions üzerinde push ve pull request'lerde otomatik çalışır.

Planlanan URL yapısı:

```text
/                       → aktif sunum veya sunum kütüphanesi
/p/:presentationId      → belirli sunum
/p/:presentationId?present=1
/p/:presentationId?presenter=1
```

## Planlanan slayt tipleri

İlk sürümde öncelikli tipler:

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

Gerektiğinde standart şablonların dışına çıkan özel bileşenler için kontrollü bir `custom` mekanizması eklenebilir.

## Aşamalı gösterim

Sunum motoru içerik sırasını kontrollü biçimde açabilmelidir.

Örneğin bir kavram slaytı:

```text
1. tık → ilk 3 kavram
2. tık → ilk 3 kavramın anlamları
3. tık → sonraki 3 kavram
4. tık → onların anlamları
```

Bu davranış içerikte deklaratif olarak tanımlanmalı; her sunum için yeniden kod yazılmamalıdır.

## Tasarım hedefleri

- 16:9 sunum öncelikli görünüm
- Projektör ve akıllı tahta için yüksek okunabilirlik
- Tutarlı tipografi ve boşluk sistemi
- Minimum font boyutu koruması
- Metin taşmasını engelleyen doğrulamalar
- Klavye ile hızlı kullanım
- Tam ekran sunum
- Responsive ama slayt oranını koruyan düzen
- Sunum sırasında gereksiz uygulama arayüzü göstermeme

## Klavye hedefleri

- `→`, `Space`: sonraki reveal / slayt
- `←`: önceki reveal / slayt
- `F`: tam ekran
- `Esc`: sunum genel görünümü veya sunum modundan çıkış

## Yapay zekâ ile çalışma

Yeni bir sunum için [prompts/CREATE_PRESENTATION.md](./prompts/CREATE_PRESENTATION.md) doğrudan kullanılabilir.

Tercih edilen akış:

1. Kaynaklar ve amaç yapay zekâya verilir.
2. Yapay zekâ sunum dramaturjisini ve slayt akışını oluşturur.
3. Uygun standart slayt tiplerini seçer.
4. Geçerli sunum JSON'u üretir.
5. Şema/doğrulama kontrolleri çalışır.
6. Sunum motoru içeriği render eder.
7. Gerekirse görsel QA yapılır.
8. Git push sonrası Netlify yayını güncellenir.

Yapay zekânın mümkün olduğunca doğrudan CSS/yerleşim üretmesi yerine mevcut tasarım sistemini kullanması tercih edilir.

## Netlify

Hedef, **tek Netlify projesinden tüm sunumları yayınlamaktır**. Her sunum için ayrı Netlify sitesi veya ayrı uygulama oluşturulmayacaktır.

İleride aktif sunum seçimi, PWA/offline çalışma ve gerekirse runtime içerik yükleme eklenebilir.

## Durum

Deck veri sözleşmesi, referans sunum, doğrulama scripti, AI üretim promptu ve CI doğrulaması hazırdır. Web renderer henüz geliştirme aşamasına geçmemiştir.

İlk geliştirme kapsamı ve sınırlar için [SCOPE.md](./SCOPE.md) dosyasına bakın.
