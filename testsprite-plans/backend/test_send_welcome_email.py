import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/send-welcome-email"

def test_send_welcome_email_validation():
    # POST webhook without valid body
    r = requests.post(TARGET_URL, json={})
    # Should probably throw 500 or 400 since payload.type will be undefined
    assert r.status_code in [400, 500]

test_send_welcome_email_validation()
