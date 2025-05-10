using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using System;
using TMPro;

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

    private void Start()
    {
        // Eğer daha önce kaydedilmiş bir kullanıcı adı varsa
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
            yield break;
        }

        // Kullanıcı adı kontrolü için HEAD isteği
        using (UnityWebRequest request = UnityWebRequest.Head($"{apiUrl}?username={UnityWebRequest.EscapeURL(newUsername)}"))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                // Kullanıcı adı kullanılabilir
                username = newUsername;
                PlayerPrefs.SetString("Username", username);
                PlayerPrefs.Save();
                usernamePanel.SetActive(false);
                errorText.text = "";
            }
            else if (request.responseCode == 409)
            {
                ShowError("Bu kullanıcı adı zaten kullanımda!");
            }
            else if (request.responseCode == 400)
            {
                ShowError("Geçersiz kullanıcı adı formatı!");
            }
            else
            {
                ShowError("Bir hata oluştu, lütfen tekrar deneyin.");
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
        var scoreData = new Dictionary<string, string>
        {
            { "username", username },
            { "score", score.ToString() }
        };

        var jsonData = JsonUtility.ToJson(scoreData);
        var request = new UnityWebRequest(apiUrl, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Skor başarıyla gönderildi!");
        }
        else
        {
            Debug.LogError("Skor gönderilirken hata: " + request.error);
        }
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