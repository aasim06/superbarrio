import urllib.request
import urllib.error
import json
import time
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://localhost:3000"

report = {
    "sections": {},
    "total_checks": 0,
    "passed_checks": 0,
    "failed_checks": 0,
    "warnings": [],
    "performance": {},
}

def log_test(section, name, passed, detail=""):
    if section not in report["sections"]:
        report["sections"][section] = []
    report["total_checks"] += 1
    if passed:
        report["passed_checks"] += 1
        report["sections"][section].append({"name": name, "status": "PASS", "detail": detail})
        print(f"  [PASS] {name}" + (f" -> {detail}" if detail else ""))
    else:
        report["failed_checks"] += 1
        report["sections"][section].append({"name": name, "status": "FAIL", "detail": detail})
        print(f"  [FAIL] {name} -> {detail}")

def make_req(url, method="GET", data=None, headers=None, follow_redirects=True):
    start = time.time()
    req_headers = {"User-Agent": "SuperBarrio-QA-Runner/1.0"}
    if headers:
        req_headers.update(headers)
    
    encoded_data = None
    if data is not None:
        if isinstance(data, dict):
            encoded_data = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif isinstance(data, (str, bytes)):
            encoded_data = data.encode("utf-8") if isinstance(data, str) else data

    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener() if follow_redirects else urllib.request.build_opener(NoRedirect)
    
    try:
        with opener.open(req, timeout=10) as res:
            body = res.read()
            elapsed = (time.time() - start) * 1000
            return {
                "status": res.status,
                "headers": dict(res.headers),
                "body": body,
                "url": res.geturl(),
                "time_ms": elapsed,
                "error": None,
            }
    except urllib.error.HTTPError as e:
        elapsed = (time.time() - start) * 1000
        return {
            "status": e.code,
            "headers": dict(e.headers),
            "body": e.read(),
            "url": e.geturl(),
            "time_ms": elapsed,
            "error": str(e),
        }
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        return {
            "status": 0,
            "headers": {},
            "body": b"",
            "url": url,
            "time_ms": elapsed,
            "error": str(e),
        }

print("\n" + "="*70)
print("  SUPERBARRIO FULL QA & STRESS AUDIT SUITE  ")
print("="*70)

# -------------------------------------------------------------
# 1. CATALOG INTEGRITY & IMAGE ASSET VALIDATION
# -------------------------------------------------------------
print("\n[SECTION 1] Catalog Integrity & Image Assets")
import re
with open("src/data/groceryData.ts", "r", encoding="utf-8") as f:
    catalog_ts = f.read()

images = re.findall(r'imageUrl:\s*[\'"]([^\'"]+)[\'"]', catalog_ts)
unique_images = list(dict.fromkeys(images))
log_test("catalog", f"Total unique product images ({len(unique_images)})", len(unique_images) == 51, f"{len(unique_images)} images found")

broken_images = []
for img_path in unique_images:
    res = make_req(f"{BASE_URL}{img_path}")
    if res["status"] != 200 or len(res["body"]) == 0:
        broken_images.append((img_path, res["status"]))

log_test("catalog", "All 51 local product images HTTP 200", len(broken_images) == 0, 
         f"0 broken" if not broken_images else f"Broken: {broken_images}")

# -------------------------------------------------------------
# 2. SECURITY & ROUTE PROTECTION (ADMIN ACCESS CONTROL)
# -------------------------------------------------------------
print("\n[SECTION 2] Security & Route Protection")
protected_routes = [
    "/dashboard",
    "/orders",
    "/products",
    "/add-product",
    "/categories",
    "/inventory",
    "/customers",
    "/delivery",
    "/coupons",
    "/profile",
    "/khata",
    "/whatsapp",
]

for r in protected_routes:
    # Unauthenticated: should redirect to /signin
    res = make_req(f"{BASE_URL}{r}", follow_redirects=False)
    is_redirect = res["status"] in (302, 307, 308)
    location = res["headers"].get("Location", "") or res["headers"].get("location", "")
    has_signin = "/signin" in location
    log_test("security", f"Unauth route {r} redirects to /signin", is_redirect and has_signin, f"Status {res['status']} -> {location}")

    # Authenticated with session cookie: should return 200
    res_auth = make_req(f"{BASE_URL}{r}", headers={"Cookie": "sb_admin_session=true"}, follow_redirects=True)
    log_test("security", f"Auth route {r} returns 200", res_auth["status"] == 200, f"Status {res_auth['status']}")

# -------------------------------------------------------------
# 3. AUTHENTICATION API MATRIX
# -------------------------------------------------------------
print("\n[SECTION 3] Authentication API Tests")

# Test 3.1: Valid login admin/admin
res_login = make_req(f"{BASE_URL}/api/auth/login", method="POST", data={"identifier": "admin", "password": "admin"})
cookie = res_login["headers"].get("Set-Cookie", "") or res_login["headers"].get("set-cookie", "")
log_test("auth", "POST /api/auth/login (admin/admin)", res_login["status"] == 200 and "sb_admin_session=true" in cookie, f"Status {res_login['status']}, Cookie={cookie[:30]}")

# Test 3.2: Valid login with email
res_email = make_req(f"{BASE_URL}/api/auth/login", method="POST", data={"identifier": "aasimameer06@gmail.com", "password": "admin"})
log_test("auth", "POST /api/auth/login (email/admin)", res_email["status"] == 200, f"Status {res_email['status']}")

# Test 3.3: Valid login with alternate username 'asif'
res_asif = make_req(f"{BASE_URL}/api/auth/login", method="POST", data={"identifier": "asif", "password": "admin"})
log_test("auth", "POST /api/auth/login (asif/admin)", res_asif["status"] == 200, f"Status {res_asif['status']}")

# Test 3.4: Invalid password
res_bad_pw = make_req(f"{BASE_URL}/api/auth/login", method="POST", data={"identifier": "admin", "password": "completely_wrong_password"})
log_test("auth", "POST /api/auth/login (wrong password rejected 401)", res_bad_pw["status"] == 401, f"Status {res_bad_pw['status']}")

# Test 3.5: Empty fields
res_empty = make_req(f"{BASE_URL}/api/auth/login", method="POST", data={})
log_test("auth", "POST /api/auth/login (empty payload rejected 400)", res_empty["status"] == 400, f"Status {res_empty['status']}")

# Test 3.6: Logout API
res_logout = make_req(f"{BASE_URL}/api/auth/logout", method="POST")
log_test("auth", "POST /api/auth/logout clears session", res_logout["status"] == 200, f"Status {res_logout['status']}")

# -------------------------------------------------------------
# 4. STOREFRONT & CART HEALTH
# -------------------------------------------------------------
print("\n[SECTION 4] Storefront & Cart Health")
res_store = make_req(f"{BASE_URL}/grocery")
log_test("storefront", "Storefront /grocery returns 200", res_store["status"] == 200, f"Latency: {res_store['time_ms']:.1f}ms")

res_checkout = make_req(f"{BASE_URL}/grocery/checkout")
log_test("storefront", "Checkout view /grocery/checkout returns 200", res_checkout["status"] == 200, f"Latency: {res_checkout['time_ms']:.1f}ms")

# Check that cart storage key is superbarrio_cart_v2 in source
with open("src/context/GroceryCartContext.tsx", "r", encoding="utf-8") as f:
    cart_code = f.read()
log_test("storefront", "Cart storage updated to superbarrio_cart_v2 (clean empty cart)", 'CART_STORAGE_KEY = "superbarrio_cart_v2"' in cart_code)

# -------------------------------------------------------------
# 5. API ENDPOINTS FUNCTIONAL VERIFICATION
# -------------------------------------------------------------
print("\n[SECTION 5] Database & Service APIs")

# 5.1 Products API
res_prods = make_req(f"{BASE_URL}/api/products")
try:
    prods_json = json.loads(res_prods["body"].decode("utf-8"))
    prods_list = prods_json.get("data", prods_json) if isinstance(prods_json, dict) else prods_json
    log_test("apis", "GET /api/products returns items", res_prods["status"] == 200 and len(prods_list) >= 50, f"{len(prods_list)} products")
except Exception as e:
    log_test("apis", "GET /api/products returns items", False, str(e))

# 5.2 Categories API
res_cats = make_req(f"{BASE_URL}/api/categories")
try:
    cats_json = json.loads(res_cats["body"].decode("utf-8"))
    cats_list = cats_json.get("data", cats_json) if isinstance(cats_json, dict) else cats_json
    log_test("apis", "GET /api/categories returns grocery departments", res_cats["status"] == 200 and len(cats_list) >= 6, f"{len(cats_list)} categories")
except Exception as e:
    log_test("apis", "GET /api/categories returns grocery departments", False, str(e))

# 5.3 Profile API
res_prof = make_req(f"{BASE_URL}/api/profile")
try:
    prof_json = json.loads(res_prof["body"].decode("utf-8"))
    prof_data = prof_json.get("data", {})
    log_test("apis", "GET /api/profile returns valid Admin Profile", res_prof["status"] == 200 and prof_data.get("email") == "aasimameer06@gmail.com", f"Name: {prof_data.get('firstName')} {prof_data.get('lastName')}")
except Exception as e:
    log_test("apis", "GET /api/profile returns valid Admin Profile", False, str(e))

# 5.4 Password change API with invalid current password
res_pw_fail = make_req(f"{BASE_URL}/api/profile/password", method="POST", data={"currentPassword": "wrong", "newPassword": "admin", "confirmPassword": "admin"}, headers={"Cookie": "sb_admin_session=true"})
log_test("apis", "POST /api/profile/password rejects wrong current password (400)", res_pw_fail["status"] == 400, f"Status {res_pw_fail['status']}")

# 5.5 Customers API
res_cust = make_req(f"{BASE_URL}/api/customers")
log_test("apis", "GET /api/customers returns 200", res_cust["status"] == 200, f"Status {res_cust['status']}")

# 5.6 Uploads dynamic streaming route
res_upload_stream = make_req(f"{BASE_URL}/uploads/1794678331404-Screenshot_2026-09-21_132329.png")
log_test("apis", "GET /uploads/... dynamic streamer serves image", res_upload_stream["status"] == 200 and len(res_upload_stream["body"]) > 100000, f"Size: {len(res_upload_stream['body'])} bytes")

# -------------------------------------------------------------
# 6. END-TO-END TRANSACTION SIMULATION (ORDER CREATION & DISPATCH)
# -------------------------------------------------------------
print("\n[SECTION 6] End-To-End E-Commerce Transaction")
order_payload = {
    "customerName": "QA Verification Customer",
    "phone": "+34 699 112 233",
    "email": "customer.qa@superbarrio.es",
    "address": "Calle Gran Vía 12, 3B, Madrid",
    "streetAddress": "Calle Gran Vía 12",
    "apartment": "3B",
    "postalCode": "28013",
    "city": "Madrid",
    "province": "Madrid",
    "deliverySlot": "Hoy - Tarde (17:00 - 20:00)",
    "paymentMethod": "bizum",
    "deliveryNotes": "Automated QA Verification Order",
    "items": [
        {"id": "g-02", "quantity": 2},
        {"id": "g-05", "quantity": 3}
    ]
}

res_order = make_req(f"{BASE_URL}/api/orders", method="POST", data=order_payload)
created_order_id = None
try:
    order_res_json = json.loads(res_order["body"].decode("utf-8"))
    created_order_id = (
        order_res_json.get("orderId")
        or order_res_json.get("order", {}).get("orderId")
        or order_res_json.get("data", {}).get("orderId")
    )
    is_created = res_order["status"] in (200, 201) and created_order_id is not None
    log_test("ecommerce", "POST /api/orders creates genuine order", is_created, f"Order ID: {created_order_id}")
    
    # Also verify GET /api/orders returns this order
    res_get_orders = make_req(f"{BASE_URL}/api/orders")
    orders_data = json.loads(res_get_orders["body"].decode("utf-8")).get("data", [])
    found_order = any(o.get("orderId") == created_order_id for o in orders_data)
    log_test("ecommerce", "GET /api/orders reflects newly created order", found_order, f"Found {created_order_id} in {len(orders_data)} orders")
except Exception as e:
    log_test("ecommerce", "POST /api/orders creates genuine order", False, str(e))

# -------------------------------------------------------------
# 7. HIGH-CONCURRENCY LOAD & STRESS TESTING
# -------------------------------------------------------------
print("\n[SECTION 7] High-Concurrency Load & Stress Test (100 Requests)")
CONCURRENT_REQUESTS = 100
WORKERS = 10
targets = [
    f"{BASE_URL}/grocery",
    f"{BASE_URL}/api/products",
    f"{BASE_URL}/api/categories",
    f"{BASE_URL}/api/profile",
]

stress_start = time.time()
latencies = []
errors = 0
status_codes = {}

def hit_target(url):
    return make_req(url, headers={"Cookie": "sb_admin_session=true"})

with ThreadPoolExecutor(max_workers=WORKERS) as executor:
    futures = [executor.submit(hit_target, targets[i % len(targets)]) for i in range(CONCURRENT_REQUESTS)]
    for f in as_completed(futures):
        r = f.result()
        latencies.append(r["time_ms"])
        status = r["status"]
        status_codes[status] = status_codes.get(status, 0) + 1
        if status not in (200, 304, 307):
            errors += 1

stress_total_time = time.time() - stress_start
avg_latency = sum(latencies) / len(latencies)
p95_latency = sorted(latencies)[int(len(latencies) * 0.95)]
rps = CONCURRENT_REQUESTS / stress_total_time

report["performance"] = {
    "total_requests": CONCURRENT_REQUESTS,
    "concurrency_workers": WORKERS,
    "total_duration_sec": round(stress_total_time, 2),
    "requests_per_second": round(rps, 1),
    "avg_latency_ms": round(avg_latency, 1),
    "p95_latency_ms": round(p95_latency, 1),
    "max_latency_ms": round(max(latencies), 1),
    "status_distribution": status_codes,
    "error_rate_pct": round((errors / CONCURRENT_REQUESTS) * 100, 2),
}

print(f"\n  Concurrency Workers : {WORKERS}")
print(f"  Total Requests      : {CONCURRENT_REQUESTS}")
print(f"  Total Time          : {stress_total_time:.2f} s")
print(f"  Throughput (RPS)    : {rps:.1f} req/s")
print(f"  Avg Latency         : {avg_latency:.1f} ms")
print(f"  95th Percentile     : {p95_latency:.1f} ms")
print(f"  Status Codes        : {status_codes}")
print(f"  Error Rate          : {report['performance']['error_rate_pct']}%")

log_test("performance", "Stress test 100% success (0 server errors)", errors == 0, f"RPS: {rps:.1f}, Avg Latency: {avg_latency:.1f}ms")

# -------------------------------------------------------------
# SUMMARY REPORT
# -------------------------------------------------------------
print("\n" + "="*70)
print(f"  FINAL SUMMARY: {report['passed_checks']} PASSED | {report['failed_checks']} FAILED")
print("="*70 + "\n")
with open("qa_audit_results.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)
