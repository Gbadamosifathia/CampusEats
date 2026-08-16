from django.db import models
from django.contrib.auth.models import User
class Vendor(models.Model):
    name = models.CharField(max_length= 40)
    description = models.TextField()
    phone_number = models.CharField(max_length= 11)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    is_open = models.BooleanField(default=False)

class MenuItem(models.Model):
    name = models.CharField(max_length= 40)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_available = models.BooleanField(default=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor, on_delete= models.CASCADE)
    status = models.CharField(max_length= 10, choices=[
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Preparing', 'Preparing')
    ])
    total_amount=models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default= 1)
    price_per_order = models.DecimalField(max_digits=8, decimal_places=2)

class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.PROTECT)
    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=10, choices=[
        ('success', 'success'),
        ('failed', 'failed'),
        ('abandoned', 'abandoned'),
    ])
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    verified_at = models.DateTimeField(null=True, blank=True)