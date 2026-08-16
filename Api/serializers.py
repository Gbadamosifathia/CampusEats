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
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only':True}}


        def create(self, validated_data):
            user = User.objects.create_user(
                first_name = validated_data['first_name'],
                last_name = validated_data['last_name'],
                username= validated_data['username'],
                email= validated_data['email'],
                password= validated_data['password']
            )
            return user
        def validate_email(self, value):
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email already in use")
            return value
        def validate_first_name(self, value):
            if not value.isalpha():
                raise serializers.ValidationError("Use only letter")
            return value
        def validate_last_name(self, value):
            if not value.isalpha():
                raise serializers.ValidationError("use only letters")
            return value
class PaymentSerializers(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"