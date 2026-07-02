import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/verify-contribution"

def test_verify_contribution_validation():
    # Missing parameters
    r = requests.post(TARGET_URL, json={})
    assert r.status_code == 400
    assert "Missing required fields" in r.text or "Missing" in r.text

test_verify_contribution_validation()
