import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/list-invoices"

def test_list_invoices_validation():
    # GET request without auth
    r = requests.get(TARGET_URL)
    assert r.status_code == 401
    assert "Missing Authorization header" in r.text or "Unauthorized" in r.text

test_list_invoices_validation()
