import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeExternalHttpUrl,
  normalizeLinkedInUrl,
  normalizeTwitterUrl,
  formatLinkedInDisplay,
  formatTwitterDisplay,
  formatCompactUrl,
} from "../socialLinks.js";

test("normalizeLinkedInUrl accepts full URLs, in/ paths, and plain slugs while rejecting unsafe schemes", () => {
  assert.equal(
    normalizeLinkedInUrl("https://www.linkedin.com/in/anmolsah"),
    "https://www.linkedin.com/in/anmolsah"
  );
  assert.equal(
    normalizeLinkedInUrl("linkedin.com/in/jane-doe"),
    "https://linkedin.com/in/jane-doe"
  );
  assert.equal(
    normalizeLinkedInUrl("in/alex-dev"),
    "https://www.linkedin.com/in/alex-dev"
  );
  assert.equal(
    normalizeLinkedInUrl("alex-dev"),
    "https://www.linkedin.com/in/alex-dev"
  );
  assert.equal(normalizeLinkedInUrl("   "), "");
  assert.equal(normalizeLinkedInUrl("javascript:alert(1)"), "");
});

test("normalizeTwitterUrl normalizes x.com, twitter.com, @handles, and plain handles to https://x.com/<handle>", () => {
  assert.equal(normalizeTwitterUrl("https://twitter.com/anmolsah"), "https://x.com/anmolsah");
  assert.equal(normalizeTwitterUrl("https://x.com/firstissue_dev"), "https://x.com/firstissue_dev");
  assert.equal(normalizeTwitterUrl("@firstissue_dev"), "https://x.com/firstissue_dev");
  assert.equal(normalizeTwitterUrl("firstissue_dev"), "https://x.com/firstissue_dev");
  assert.equal(normalizeTwitterUrl(""), "");
  assert.equal(normalizeTwitterUrl("javascript:alert(1)"), "");
});

test("normalizeExternalHttpUrl prepends https:// for domain names and blocks non-http protocols", () => {
  assert.equal(normalizeExternalHttpUrl("myapp.vercel.app"), "https://myapp.vercel.app/");
  assert.equal(
    normalizeExternalHttpUrl("https://firstissue.dev/explore"),
    "https://firstissue.dev/explore"
  );
  assert.equal(normalizeExternalHttpUrl("javascript:void(0)"), "");
  assert.equal(normalizeExternalHttpUrl("not a url"), "");
});

test("display formatters produce clean compact handles and URLs", () => {
  assert.equal(formatLinkedInDisplay("https://www.linkedin.com/in/anmolsah/"), "in/anmolsah");
  assert.equal(formatTwitterDisplay("https://twitter.com/anmolsah"), "@anmolsah");
  assert.equal(formatCompactUrl("https://www.firstissue.dev/u/anmolsah/"), "firstissue.dev/u/anmolsah");
});
