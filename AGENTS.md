# AGENTS.md

Bu repo, birden fazla sunumu tek web tabanlı renderer üzerinden çalıştırmak için kullanılır.

## En önemli kural

**Sunum içeriği ile renderer kodunu birbirinden ayır.**

Kullanıcı yeni bir sunum veya mevcut sunumun içerik değişikliğini istediğinde, aksi açıkça söylenmedikçe renderer/tasarım sistemi kodunu değiştirme.

## Canonical format

Sunum dosyaları:

```text
presentations/<deck-id>/deck.json
```

konumundadır.

Deck sözleşmesinin tek canonical kaynağı:

```text
schema/deck.schema.json
```

dosyasıdır.

Örnek:

```text
presentations/format-demo/deck.json
```

## Yeni sunum üretirken

1. `schema/deck.schema.json` dosyasını oku.
2. `presentations/format-demo/deck.json` örneğini incele.
3. Kullanıcının verdiği kaynaklardan bağımsız bir anlatım planı oluştur.
4. Yalnız schema'da tanımlı slayt tiplerini kullan.
5. `schemaVersion: 1` kullan.
6. Klasör adı ile `deck.id` aynı olsun.
7. Her slide için benzersiz, kebab-case uyumlu `id` üret.
8. Sunum meta dilini görünür içerikten çıkar; gerekirse `speakerNotes` kullan.
9. Kaynakta bulunmayan bilgileri kesin bilgi olarak üretme.
10. İş bittikten sonra `npm run validate:decks` çalıştır.

## Yasak varsayılan davranışlar

Kullanıcı açıkça istemedikçe:

- yeni slayt tipi uydurma,
- schema'yı yalnızca ürettiğin deck geçsin diye gevşetme,
- serbest HTML/CSS/JavaScript ekleme,
- koordinat tabanlı yerleşim üretme,
- her sunum için ayrı uygulama/proje oluşturma,
- yeni sunum için renderer koduna özel-case ekleme,
- PPTX'i canonical kaynak hâline getirme.

## Schema ile ifade edilemeyen ihtiyaç

Mevcut slayt tipleri gerçek bir ihtiyacı karşılamıyorsa:

1. Deck içinde sahte bir çözüm üretme.
2. İhtiyacın neden mevcut tiplerle ifade edilemediğini raporla.
3. Tek sunuma özel mi, tekrar kullanılabilir mi değerlendir.
4. Ancak kullanıcı renderer/schema geliştirmesini de istiyorsa yeni tip tasarla.
5. Yeni tip eklendiğinde schema, örnek deck, renderer ve doğrulama/testleri birlikte güncellenmelidir.

## İçerik kalitesi

- Slayt başına tek ana fikir tercih et.
- Uzun metni küçültmek yerine böl.
- Gerçek tabloyu `table` olarak tut.
- Karşılaştırmayı `comparison` olarak tut.
- Kavramları `definitions` olarak tut.
- Kronolojik ilişkileri `timeline` ile göster.
- Süreci `process` ile göster.
- Soru/cevap/kanıt ayrımını veri modelinde koru.
- Reveal sırasını schema'nın izin verdiği değerlerle tanımla.

## Doğrulama

Kurulum:

```bash
npm install
```

Tüm deck'leri doğrula:

```bash
npm run validate:decks
```

Doğrulama hatası varsa önce deck'i düzelt. Schema değişikliği ürün sözleşmesi değişikliğidir ve içerik düzeltmesi gibi yapılmamalıdır.
