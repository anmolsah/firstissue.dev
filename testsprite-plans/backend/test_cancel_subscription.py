import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/cancel-subscription"

def test_cancel_subscription_validation():
    # Missing auth/userId
    r = requests.post(TARGET_URL, json={})
    assert r.status_code == 401 or r.status_code == 400

test_cancel_subscription_validation()
