import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/sync-org-stars"

def test_sync_org_stars():
    # Sync org stars handles missing auth by just continuing with anon operations if CORS allows it.
    # It might fail with a 500 if env vars are missing, or return 200 {success: true, ...}
    # It takes no body.
    r = requests.post(TARGET_URL)
    assert r.status_code == 401

test_sync_org_stars()
