# Auto-injected credentials — do not modify
__AUTH_CREDENTIAL__ = ""
__AUTH_TYPE__ = "public"
__AUTH_HEADERS__ = {}
import requests

TARGET_URL = "https://xkbyhokikbzhdxdshvqh.supabase.co/functions/v1/sync-org-stars"


def test_sync_org_stars():
    r = requests.post(TARGET_URL, timeout=30)
    assert r.status_code == 204


test_sync_org_stars()