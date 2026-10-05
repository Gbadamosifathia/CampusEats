# CampusEats — Deferred Issues Backlog
> Last reviewed: 2026-08-24

## 🔴 Critical

### 1. `Order.status` model choices missing `Completed` and `Cancelled`
**File:** `Eats/models.py` (L20-24)  
**Problem:** The model only has `Pending`, `Paid`, `Preparing`. The backend `order_status_update` view allows `Completed` and `Cancelled`, and the Order Tracking frontend expects `Completed`. Django may silently ignore or fail on invalid choices.  
**Fix:** Add to the choices tuple:
```python
('Completed', 'Completed'),
('Cancelled', 'Cancelled'),
```
Then run `python manage.py makemigrations && python manage.py migrate`.

---

### 2. `PaymentSerializers` is defined inside `SignupSerializers` — unreachable
**File:** `Api/serializers.py` (L73-76)  
**Problem:** `class PaymentSerializers` is indented inside `class SignupSerializers`, making it an inner class that can never be imported or used anywhere.  
**Fix:** Unindent it to be a top-level class.

---

### 3. Paystack Webhook never sets `order.status = 'Paid'`
**File:** `Api/views.py` (L272)  
**Problem:** After payment, the webhook marks `payment.status = 'Success'` but never updates `payment.order.status` to `'Paid'`. Vendors always see orders stuck at `Pending`.  
**Fix:**
```python
# After payment.save():
payment.order.status = 'Paid'
payment.order.save()
```

---

## 🟡 Medium

### 4. Kitchen note captured in Checkout but never sent to backend
**File:** `frontend/src/pages/Checkout.jsx` (L14)  
**Problem:** `note` state is set by the textarea but never included in the Order POST body. The Order model also has no `notes` field.  
**Options:**
- Add a `notes` CharField to the Order model + migration, then send it in the POST
- Or remove the UI field to avoid confusing students

---

### 5. `Payment.status` case mismatch
**File:** `Api/views.py` (L231), `Eats/models.py` (L37-41)  
**Problem:** Model choices are lowercase (`success`, `failed`, `abandoned`) but `verify_payment` sets `payment.status = 'Success'` (capital S).  
**Fix:** Either change the model choice to `('Success', 'Success')` or change `views.py` to use `'success'`. Be consistent.

---

### 6. CORS origin is hardcoded, not environment-variable
**File:** `main/settings.py` (L159)  
**Problem:** `CORS_ALLOWED_ORIGINS = ["https://campus-eats-beta.vercel.app"]` is hardcoded. Any Vercel preview URL will be blocked.  
**Fix:** Move to `.env`:
```python
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=Csv())
```

---

## 🟢 Low

### 7. `Payment` created with `status='Pending'` — not a valid choice
**File:** `Api/views.py` (L217)  
**Problem:** `Payment.objects.create(..., status='Pending')` uses a value not in the model's choices (`success`, `failed`, `abandoned`).  
**Fix:** Either add `('Pending', 'Pending')` to Payment choices (with migration) or remove the initial status and make the field `null=True, blank=True`.
