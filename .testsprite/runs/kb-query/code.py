# Auto-injected credentials — do not modify
__AUTH_CREDENTIAL__ = ""
__AUTH_TYPE__ = "public"
__AUTH_HEADERS__ = {}
import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/kb-query"

def test_kb_query_validation():
    # 1. Missing message body
    r = requests.post(TARGET_URL, json={})
    assert r.status_code == 400
    assert "Missing message" in r.text
    
    # 2. Unauthorized without token
    r = requests.post(TARGET_URL, json={"message": "hello"})
    assert r.status_code == 401
    assert "Unauthorized" in r.text

test_kb_query_validation()