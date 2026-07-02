# Auto-injected credentials — do not modify
__AUTH_CREDENTIAL__ = ""
__AUTH_TYPE__ = "public"
__AUTH_HEADERS__ = {}
import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/smart-match"


def test_smart_match_validation():
    # Send a minimally valid request body and assert the endpoint accepts it.
    # Include any injected auth headers if present.
    payload = {
        "text": "test",
        "query": "test"
    }
    headers = dict(__AUTH_HEADERS__)
    r = requests.post(TARGET_URL, json=payload, headers=headers, timeout=30)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    assert r.text is not None
    assert len(r.text.strip()) > 0


test_smart_match_validation()