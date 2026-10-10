# SACHET RSS/CAP integration contract

Verified 2026-10-10 against the official [feed directory](https://sachet.ndma.gov.in/CapFeed) and its [CAP XML integration guide](https://sachet.ndma.gov.in/docs/Integration_Guide_For_Agencies.pdf). These are provider observations and implementation requirements; incident publication is not implemented by this research check.

## Discovery and transport

The all-India RSS URL is `https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml`. The directory also publishes 36 state/territory feeds under the same path, including `rss_tamil.xml`, `rss_kerala.xml`, `rss_andaman.xml` and `rss_lakshadweep.xml`. `/rss/rss_india.xml` without the `/cap_public_website/` prefix returned 404 and must not be configured.

A real all-India response returned HTTP 200, 77,586 bytes and 99 entries. RSS contains channel metadata and item title, description, category, link, author, guid and pubDate. RSS is discovery, not the complete warning instruction/geometry contract. Duplicate items across regional feeds must not create duplicate sources.

An item links to `https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=…`. Fetch only reviewed HTTPS SACHET paths and permitted identifiers; never follow arbitrary report-supplied URLs. Bound redirects, response bytes, XML depth/vertices, timeouts and concurrent fetches. Reject DTD/entity declarations; do not render source HTML as executable UI.

## Mandatory ETag behavior

Persist the exact response ETag with the downloaded XML, content hash and storage ID. ETags are opaque strings: retain quotes and any weak prefix, without reconstructing them from a local hash.

| Response | Required application behavior |
| --- | --- |
| First 200 | Validate and store XML with its ETag; retain source and issued time. |
| Later request | Send the stored ETag in `If-None-Match`. |
| 304 | Read the existing stored XML immediately. Do not fetch again or parse an empty response body. Update successful-check time, preserving content revision/issued time. |
| Changed 200 | Validate new XML first; replace current XML/ETag together and version its semantic content. Preserve previous attributed source history. |
| Network/HTTP/parser failure | Preserve the last accepted document; record failure/freshness and use bounded later retry. Never interpret failure as cancellation. |
| 304 with unavailable cached XML | Record a cache-integrity error; do not loop requests. Repair in a later controlled job. |
| 200 without an ETag | Store valid content and explicitly record missing upstream ETag; never invent an upstream ETag. |

The sampled CAP returned 200 with 1,657 bytes and an ETag. Repeating it with `If-None-Match` returned 304 with zero body bytes, while the cached XML remained usable. That demonstrates the real conditional-fetch contract. A 304 is a successful source check, not a new warning or new alert revision.

## CAP fields and geography

The sampled namespace is CAP 1.2, `urn:oasis:names:tc:emergency:cap:1.2`. Parse top-level identifier, sender, sent, status, msgType, scope, restriction, addresses, note, incidents and references where present. Parse every info language independently: category, event, urgency, severity, certainty, effective/onset/expires, headline, description, instruction, contact, responseType, parameters and areas. Preserve original instructions and issuer-supplied translations.

The observed notice was Actual/Public/Alert, with event Flood, urgency Future, severity Moderate and certainty Possible. It is not automatically an immediate emergency merely because it is official. The sample had no responseType. Missing protective-action fields must remain unknown, with interpretation pending when necessary.

The sample area contained areaDesc, altitude and ceiling, but no inline polygon/circle/geocode. It referenced a `Polygon URL` parameter at `/cap_public_website/FetchPolygonXMLFile`. That endpoint returned a separate XML document containing alert/identifier/polygon, rather than JSON. Its geometry must be linked to the matching identifier, validated and attributed before targeting. Without valid geometry, preserve the advisory with geographic interpretation pending; never turn an area name into an invented precise point.

CAP polygon/circle coordinates use latitude,longitude; GeoJSON uses longitude,latitude. CAP circle radii are kilometres, while internal radii are metres. Preserve holes/multiple areas and explicit source precision. Administrative geography is broad; do not target an unrelated tourist just because the state matches. Polygon links are subject to the same host/path, size, parser and ETag rules as CAP documents.

## Revisions, cancellation and freshness

Canonical source identity is sender/identifier/sent, with reference chains for Update/Cancel. Do not use item titles as identity. A cancellation affects only referenced source records. Cancellation before its original requires a tombstone so an old original cannot resurrect it. Do not end an independently active authority/model source.

Test, Exercise, Draft and non-public notices cannot produce ordinary LIVE emergencies. Expiry and disappearance from the RSS window are distinct from cancellation and never mean all-clear. Keep issued time separate from successful retrieval/check time. Polling targets two minutes with per-source backoff and durable bounded work.

Live sampling above did not include an Update or Cancel notice; reference reconciliation, reversed arrival order, bad entries, multilingual documents and malformed geometry still require fixtures and integration tests. Qualification, translation, recipient targeting and notifications remain separate guarded workflows.
