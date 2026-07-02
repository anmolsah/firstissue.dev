import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/github-data"

def test_github_data_validation():
    # POST without required action/username
    r = requests.post(TARGET_URL, json={})
    assert r.status_code == 400
    assert "Missing" in r.text or "required" in r.text or "not provided" in r.text or "Invalid" in r.text or "action" in r.text

test_github_data_validation()
