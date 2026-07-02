import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/kb-query"

def test_kb_query_validation():
    # 1. Missing message body
    r = requests.post(TARGET_URL, json={})
    assert r.status_code == 401
    
    # 2. Unauthorized without token
    r = requests.post(TARGET_URL, json={"message": "hello"})
    assert r.status_code == 401
    assert "authorization" in r.text.lower()

test_kb_query_validation()
