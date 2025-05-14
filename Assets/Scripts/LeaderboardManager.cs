using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using System;
using TMPro;

[Serializable]
public class ApiResponse
{
    public bool success;
    public string message;
    public string error;
}

[Serializable]
public class ScoreEntry
{
    public string username;
    public int score;
    public int rank;
}

public class LeaderboardManager : MonoBehaviour
{
    private string apiUrl = "https://your-vercel-app.vercel.app/api/scores";
    private string username;

    [SerializeField]
    private TMP_InputField usernameInput;
    
    [SerializeField]
    private GameObject usernamePanel;
    
    [SerializeField]
    private TextMeshProUGUI errorText;

    public delegate void OnUsernameResult(bool success, string message);
    public delegate void OnScoreSubmitResult(bool success, string message);

    public event OnUsernameResult OnUsernameChecked;
    public event OnScoreSubmitResult OnScoreSubmitted;

    private void Start()
    {
        username = PlayerPrefs.GetString("Username", "");
        if (string.IsNullOrEmpty(username))
        {
            ShowUsernamePanel();
        }
    }

    public void ShowUsernamePanel()
    {
        usernamePanel.SetActive(true);
    }

    public void OnUsernameSubmit()
    {
        StartCoroutine(CheckAndSetUsername(usernameInput.text));
    }

    private IEnumerator CheckAndSetUsername(string newUsername)
    {
        if (string.IsNullOrEmpty(newUsername))
        {
            ShowError("Kullanıcı adı boş olamaz!");
            OnUsernameChecked?.Invoke(false, "Kullanıcı adı boş olamaz!");
            yield break;
        }

        using (UnityWebRequest request = UnityWebRequest.Head($"{apiUrl}?username={UnityWebRequest.EscapeURL(newUsername)}"))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                username = newUsername;
                PlayerPrefs.SetString("Username", username);
                PlayerPrefs.Save();
                usernamePanel.SetActive(false);
                errorText.text = "";
                OnUsernameChecked?.Invoke(true, "Kullanıcı adı başarıyla kaydedildi!");
            }
            else
            {
                string message = "Bir hata oluştu";
                if (request.responseCode == 409)
                {
                    message = "Bu kullanıcı adı zaten kullanımda!";
                }
                else if (request.responseCode == 400)
                {
                    message = "Kullanıcı adı 3-20 karakter arasında olmalı ve şunları içerebilir:\n" +
                             "- Harfler (Türkçe karakterler dahil)\n" +
                             "- Rakamlar\n" +
                             "- Noktalama işaretleri (.-_,?!@#$%&*()+=:;)\n" +
                             "Kurallar:\n" +
                             "- Noktalama işareti ile başlayamaz ve bitemez\n" +
                             "- Ardışık noktalama işareti kullanılamaz";
                }
                ShowError(message);
                OnUsernameChecked?.Invoke(false, message);
            }
        }
    }

    private void ShowError(string message)
    {
        errorText.text = message;
    }

    public void SubmitScore(int score)
    {
        if (string.IsNullOrEmpty(username))
        {
            ShowUsernamePanel();
            OnScoreSubmitted?.Invoke(false, "Önce kullanıcı adı belirlemelisiniz!");
            return;
        }
        StartCoroutine(SubmitScoreCoroutine(score));
    }

    public void GetLeaderboard(System.Action<List<ScoreEntry>> callback)
    {
        StartCoroutine(GetLeaderboardCoroutine(callback));
    }

    private IEnumerator SubmitScoreCoroutine(int score)
    {
        // URL encode the username to handle special characters
        string encodedUsername = UnityWebRequest.EscapeURL(username);
        var jsonData = JsonUtility.ToJson(new ScoreData { username = username, score = score });

        Debug.Log($"Gönderilen skor: {score} - Kullanıcı: {username}");
        Debug.Log($"URL-encoded username: {encodedUsername}");
        Debug.Log("JSON içeriği: " + jsonData);

        var request = new UnityWebRequest(apiUrl, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        Debug.Log($"Sunucu yanıtı: {request.downloadHandler.text}");
        Debug.Log($"Yanıt kodu: {request.responseCode}");

        if (request.result == UnityWebRequest.Result.Success)
        {
            var response = JsonUtility.FromJson<ApiResponse>(request.downloadHandler.text);
            OnScoreSubmitted?.Invoke(response.success, response.message);
            
            if (response.success)
            {
                Debug.Log("Skor başarıyla gönderildi: " + response.message);
            }
            else
            {
                Debug.LogWarning("Skor gönderimi başarısız: " + response.message);
            }
        }
        else
        {
            string errorMessage = $"Skor gönderilirken bir hata oluştu: {request.responseCode}";

            if (request.responseCode == 400)
            {
                errorMessage = "Kullanıcı adı 3-20 karakter arasında olmalı ve şunları içerebilir:\n" +
                             "- Harfler (Türkçe karakterler dahil)\n" +
                             "- Rakamlar\n" +
                             "- Noktalama işaretleri (.-_,?!@#$%&*()+=)\n" +
                             "Kurallar:\n" +
                             "- Noktalama işareti ile başlayamaz ve bitemez\n" +
                             "- Ardışık noktalama işareti kullanılamaz";
            }
            else if (request.responseCode == 409)
            {
                errorMessage = "Bu kullanıcı adı zaten kullanımda.";
            }
            else if (request.responseCode == 500)
            {
                errorMessage = "Sunucu hatası.";
            }
            
            Debug.LogError($"Skor gönderme hatası: {errorMessage}");
            Debug.LogError($"Sunucu yanıtı: {request.downloadHandler.text}");
            OnScoreSubmitted?.Invoke(false, errorMessage);
        }
    }

    [Serializable]
    private class ScoreData
    {
        public string username;
        public int score;
    }

    private IEnumerator GetLeaderboardCoroutine(System.Action<List<ScoreEntry>> callback)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(apiUrl))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string json = request.downloadHandler.text;
                var wrapper = JsonUtility.FromJson<ScoreEntry[]>(json);
                callback?.Invoke(new List<ScoreEntry>(wrapper));
            }
            else
            {
                Debug.LogError("Skor tablosu alınırken hata: " + request.error);
                callback?.Invoke(null);
            }
        }
    }
} 