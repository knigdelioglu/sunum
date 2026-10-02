# Yeni Sunum Üretim Promptu

Aşağıdaki şablonu, bir yapay zekâdan bu repo için yeni sunum içeriği üretmesini isterken kullan.

---

Bu repo için yeni bir web sunumu hazırla.

## Girdi

- Hedef kitle: **[HEDEF KİTLE]**
- Yaklaşık süre: **[SÜRE]**
- Amaç: **[AMAÇ]**
- Sunum kimliği / slug: **[SUNUM-ID]**
- Kaynaklar: **[KAYNAKLAR / DOSYALAR / NOTLAR]**

## Zorunlu repo sözleşmesi

Önce şu dosyaları oku:

1. `schema/deck.schema.json`
2. `presentations/format-demo/deck.json`
3. `SCOPE.md`
4. `AGENTS.md`

Yeni sunumu yalnızca:

`presentations/[SUNUM-ID]/deck.json`

olarak oluştur.

`schemaVersion` değeri **1** olmalı ve `deck.id` klasör adıyla birebir aynı olmalı.

Yalnız schema tarafından desteklenen slayt tiplerini kullan:

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

Desteklenmeyen yeni bir `type` uydurma. İhtiyaç mevcut tiplerle doğru biçimde ifade edilemiyorsa deck'i bozmak yerine bunu raporla.

## İçerik ilkeleri

- Her slaytta mümkün olduğunca tek temel düşünce işle.
- Projeksiyonda okunamayacak uzun paragraflar oluşturma; içeriği yeni slaytlara böl.
- Karşılaştırma içeriğini paragraf yerine `comparison` ile ver.
- Gerçek satır/sütun ilişkisi varsa `table` kullan.
- Kronolojik anlatımda `timeline`, aşamalı süreçte `process` kullan.
- Kavram ve anlamları için `definitions` kullan.
- Soru-cevap içeriğinde uygun olduğunda `reveal` ile bilgiyi aşamalı aç.
- Kaynakta olmayan bilgiyi kesin gerçek gibi ekleme.
- Kaynağa dayalı kritik içerikte `source` alanını kullan.
- “Öğrenciye sorun”, “öğretmen burada açıklar”, “bu slaytta...” gibi projeksiyonda görünmemesi gereken meta ifadeleri görünür içeriğe yazma. Gerekliyse `speakerNotes` alanına taşı.
- Keyfi HTML, CSS, JavaScript, piksel koordinatı, font boyutu veya renk kodu üretme.
- Sunum görünümünü değiştirmek için renderer koduna dokunma.

## Reveal

`reveal` yalnızca ilgili slayt tipinin schema'da izin verdiği değerleri kullanmalıdır.

Örnek soru:

```json
{
  "id": "s05",
  "type": "question",
  "question": "Bu parçanın ana düşüncesi nedir?",
  "hint": "Tekrarlanan düşünceye dikkat edin.",
  "answer": "Ana düşünce...",
  "evidence": "Metindeki ... ifadesi bunu destekler.",
  "reveal": ["hint", "answer", "evidence"]
}
```

Örnek kavramlar:

```json
{
  "id": "s06",
  "type": "definitions",
  "title": "Kavramlar",
  "groupSize": 3,
  "items": [
    { "term": "Zihniyet", "definition": "..." },
    { "term": "Üslup", "definition": "..." },
    { "term": "İleti", "definition": "..." }
  ],
  "reveal": ["terms", "definitions"]
}
```

Bu yapı renderer tarafından “önce kavram grubu, sonra o grubun anlamları” biçiminde yorumlanacaktır.

## Tamamlama

Deck'i oluşturduktan sonra:

```bash
npm install
npm run validate:decks
```

çalıştır.

Doğrulama başarısızsa schema'yı gevşetme. Önce deck'i sözleşmeye uyacak şekilde düzelt.

Görevin sonunda yalnızca:
- oluşturulan sunumun yolu,
- slayt sayısı,
- doğrulama sonucu,
- varsa mevcut şemayla ifade edilemeyen ihtiyaçlar

hakkında kısa rapor ver.
