from rest_framework import serializers
from Eats.models import Vendor, MenuItem, Order, OrderItem, Payment
from django.contrib.auth.models import User

class VendorSerializers(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class MenuItemSerializers(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class OrderSerializers(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

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