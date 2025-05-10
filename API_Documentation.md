# API Dökümantasyonu

Bu doküman, Unity ile geliştirilen oyunumuz tarafından kullanılacak API endpointlerini açıklar.

## Temel Bilgiler

- Base URL: `https://<YOUR_DOMAIN>/api`
- Tüm istekler JSON formatında gönderilmeli ve yanıt JSON döner.
- CORS: Tüm originlere izin verilmiştir (`Access-Control-Allow-Origin: *`).

### Ortam Değişkenleri

- `JWT_SECRET`: Admin tokenları oluşturmak için kullanılan gizli anahtar.
- `DATABASE_URL`: Prisma Client'ın bağlandığı veritabanı URL'si.

---

## Admin Endpointleri

### 1) POST /api/admin/register

**Açıklama:** Yeni admin hesabı oluşturur.

#### İstek
- Method: `POST`
- URL: `/api/admin/register`
- Headers:
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "username": "admin_kullanici_adi",
    "password": "sifre"
  }
  ```

#### Başarılı Yanıt
- Status: `201 Created`
- Body (JSON):
  ```json
  {
    "id": 1,
    "username": "admin_kullanici_adi"
  }
  ```

#### Hata Durumları
- `400 Bad Request`: Eksik parametre veya kullanıcı adı zaten var.
- `405 Method Not Allowed`: Yanlış HTTP metodu.
- `500 Internal Server Error`: Sunucu hatası.

---

### 2) POST /api/admin/login

**Açıklama:** Admin giriş yapar ve JWT token alır.

#### İstek
- Method: `POST`
- URL: `/api/admin/login`
- Headers:
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "username": "admin_kullanici_adi",
    "password": "sifre"
  }
  ```

#### Başarılı Yanıt
- Status: `200 OK`
- Body (JSON):
  ```json
  {
    "token": "<JWT_TOKEN>"
  }
  ```

#### Hata Durumları
- `400 Bad Request`: Eksik parametre.
- `401 Unauthorized`: Geçersiz kredensiyaller.
- `405 Method Not Allowed`: Yanlış HTTP metodu.
- `500 Internal Server Error`: Sunucu hatası.

---

## Puan Endpointleri

### 3) GET /api/scores

**Açıklama:** En yüksek 100 puanı listeler.

#### İstek
- Method: `GET`
- URL: `/api/scores`

#### Başarılı Yanıt
- Status: `200 OK`
- Body (JSON):
  ```json
  [
    {
      "id": 1,
      "username": "player1",
      "score": 1500
    },
    {
      "id": 2,
      "username": "player2",
      "score": 1200
    },
    ...
  ]
  ```

#### Hata Durumları
- `500 Internal Server Error`: Puanlar alınamadı.

---

### 4) POST /api/scores

**Açıklama:** Yeni puan ekler veya mevcut oyuncunun en yüksek puanını günceller.

#### İstek
- Method: `POST`
- URL: `/api/scores`
- Headers:
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "username": "player1",
    "score": 1200
  }
  ```

#### Başarılı Yanıt
- Status: `200 OK`
- Body (JSON):
  ```json
  {
    "message": "Skor başarıyla kaydedildi"
  }
  ```

#### Hata Durumları
- `400 Bad Request`: Geçersiz kullanıcı adı veya skor.
- `409 Conflict`: Kullanıcı adı formatı geçersiz veya zaten kullanımda.
- `500 Internal Server Error`: Skor kaydedilemedi.

---

### 5) HEAD /api/scores?username={username}

**Açıklama:** Kullanıcı adının uygunluğunu kontrol eder.

#### İstek
- Method: `HEAD`
- URL: `/api/scores?username=player1`

#### Yanıt Kodları
- `200 OK`: Kullanıcı adı boşta.
- `409 Conflict`: Kullanıcı adı zaten var.
- `400 Bad Request`: Geçersiz formatta kullanıcı adı.
- `500 Internal Server Error`: Sunucu hatası.

---

### 6) DELETE /api/scores?username={username}

**Açıklama:** Belirtilen oyuncunun puanını siler (Admin yetkisi gerekir).

#### İstek
- Method: `DELETE`
- URL: `/api/scores?username=player1`
- Headers:
  - `x-api-key: <JWT_TOKEN>`

#### Başarılı Yanıt
- Status: `200 OK`
- Body (JSON):
  ```json
  {
    "message": "Skor başarıyla silindi"
  }
  ```

#### Hata Durumları
- `400 Bad Request`: Geçersiz veya eksik parametre.
- `401 Unauthorized`: Yetkisiz erişim (geçersiz token).
- `404 Not Found`: Kullanıcı bulunamadı.
- `500 Internal Server Error`: Skor silinemedi.

---

## Unity C# Örnek Kullanım

### Örnek: Puan Gönderme
```csharp
using UnityEngine.Networking;
using System.Collections;
using UnityEngine;

public class ApiClient : MonoBehaviour
{
    private string baseUrl = "https://yourdomain.com/api";

    public IEnumerator SubmitScore(string username, int score)
    {
        var url = $"{baseUrl}/scores";
        var requestData = new { username = username, score = score };
        string json = JsonUtility.ToJson(requestData);

        using (UnityWebRequest request = UnityWebRequest.Post(url, json))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Skor gönderildi: " + request.downloadHandler.text);
            }
            else
            {
                Debug.LogError($"Hata: {request.error}");
            }
        }
    }
}
```