import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/smart-match"

def test_smart_match_validation():
    # POST without body
    r = requests.post(TARGET_URL, json={})
    assert r.status_code == 401
    assert "Missing required parameters" in r.text or "Invalid request" in r.text or "not" in r.text.lower() or "missing" in r.text.lower()

test_smart_match_validation()
