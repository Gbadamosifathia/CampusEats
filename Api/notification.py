import logging
from firebase_admin import messaging
from Eats.models import VendorDevice
logger = logging.getLogger(__name__)
def notify_vendor(vendor, order_id = None):
    tokens = list(VendorDevice.objects.filter(vendor=vendor).values_list('token', flat=True))
    if not tokens:
        return
    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title='New order',
            body='You have a new order on Campus Eats.',
        ),
        data={'order_id': str(order_id)} if order_id else {},
        tokens=tokens,
    )

    try:
        messaging.send_each_for_multicast(message)
    except Exception:
        logger.exception('failed to send order notification')