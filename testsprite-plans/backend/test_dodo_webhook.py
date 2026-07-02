import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/dodo-webhook"

def test_dodo_webhook_validation():
    # POST webhook without valid body
    r = requests.post(TARGET_URL, json={})
    # Should throw error based on missing data
    assert r.status_code in [400, 401, 500]

test_dodo_webhook_validation()
