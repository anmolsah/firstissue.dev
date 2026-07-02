import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/create-checkout"

def test_create_checkout_validation():
    # Missing auth/body
    r = requests.post(TARGET_URL, json={})
    assert r.status_code == 401 or r.status_code == 400

test_create_checkout_validation()
