import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/github-sync"

def test_github_sync_validation():
    # POST without valid body
    r = requests.post(TARGET_URL, json={})
    # Should throw error based on missing data
    assert r.status_code in [400, 401, 500]

test_github_sync_validation()
