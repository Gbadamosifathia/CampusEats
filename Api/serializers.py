from rest_framework import serializers
from Eats.models import Vendor, MenuItem, Order, OrderItem, Payment
from django.contrib.auth.models import User
from django.db import transaction

class VendorSerializers(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class MenuItemSerializers(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class OrderSerializers(serializers.ModelSerializer):
    # This tells the serializer to expect a list of items from the frontend
    items = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Order
        # Include all your fields, plus the new 'items' field
        fields = ['id', 'vendor', 'status', 'total_amount', 'created_at', 'items']
        
        # CRITICAL: We block the frontend from setting the user, total_amount, or status
        read_only_fields = ['user', 'total_amount', 'status']

    def create(self, validated_data):
        # Pull the list of items out of the frontend's request
        items_data = validated_data.pop('items')
        
        # transaction.atomic() ensures that if one item fails, the whole order is cancelled.
        # It prevents half-complete orders from saving to the database.
        with transaction.atomic():
            # 1. Create the initial Order with a temporary total of 0
            order = Order.objects.create(total_amount=0, status='Pending', **validated_data)
            
            calculated_total = 0
            
            # 2. Loop through the items the frontend sent
            for item in items_data:
                # Get the real menu item directly from your secure database
                menu_item = MenuItem.objects.get(id=item['menu_item'])
                quantity = item.get('quantity', 1)
                # 3. Create the OrderItem record
                OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    quantity=quantity,
                    price_per_order=menu_item.price # Lock in the price at time of order
                )
                
                # 4. Add the true cost to our running total
                calculated_total += (menu_item.price * quantity)
            
            # 5. Update the parent Order with the final, secure total amount
            order.total_amount = calculated_total
            order.save()
            
            return order


class OrderItemSerializers(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class SignupSerializers(serializers.ModelSerializer):
    # We add an optional toggle flag and vendor fields directly to the main signup
    is_vendor = serializers.BooleanField(write_only=True, default=False)
    shop_name = serializers.CharField(max_length=40, required=False, write_only=True)
    description = serializers.CharField(required=False, write_only=True)
    phone_number = serializers.CharField(max_length=11, required=False, write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password', 
                  'is_vendor', 'shop_name', 'description', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")
        return value

    def create(self, validated_data):
        # 1. Extract the vendor-specific data before creating the user
        is_vendor = validated_data.pop('is_vendor', False)
        shop_name = validated_data.pop('shop_name', None)
        description = validated_data.pop('description', "")
        phone_number = validated_data.pop('phone_number', None)

        # 2. Create the standard User account
        user = User.objects.create_user(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        
        # 3. If the frontend sent 'is_vendor: true', create the shop!
        if is_vendor:
            if not shop_name or not phone_number:
                raise serializers.ValidationError("Shop name and phone number are required for vendors.")
                
            Vendor.objects.create(
                owner=user,
                name=shop_name,
                description=description,
                phone_number=phone_number,
                # is_approved=False  <-- Add this if you put the lock on your models!
            )           
        return user
    
class PaymentSerializers(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"