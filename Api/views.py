from rest_framework.response import Response
from rest_framework.decorators import api_view
from Eats.models import Vendor, MenuItem, Order, OrderItem, Payment
from .serializers import VendorSerializers, MenuItemSerializers, OrderSerializers, OrderItemSerializers, SignupSerializers
from django.shortcuts import get_object_or_404
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings
from django.utils import timezone
import hmac
import hashlib
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get('refresh')
    token= RefreshToken(refresh_token)
    token.blacklist()
    return Response(status=205)

@api_view(["POST"])
def signup(request):
    serializer = SignupSerializers(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': "User created successfully"}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def vendor_list_create(request):
    if request.method == 'GET':
        vendors = Vendor.objects.all()
        serializer = VendorSerializers(vendors, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = VendorSerializers(data = request.data)
        if serializer.is_valid():
            serializer.save() 
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def vendor_detail(request, pk):
    vendor = get_object_or_404(Vendor, pk=pk, owner= request.user)
    if request.method == 'GET':
        serializer = VendorSerializers(vendor)
        return Response(serializer.data)
    if request.method =='PUT':
        serializer = VendorSerializers(vendor, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    if request.method == 'DELETE':
        vendor.delete()
        return Response(status=204)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def menuitem_list_create(request):
    if request.method =="GET":
        menuitems = MenuItem.objects.all()
        serializer = MenuItemSerializers(menuitems, many=True)
        return Response(serializer.data)
    if request.method == 'POST':
        vendor_id = request.data.get('vendor')
        vendor = get_object_or_404(Vendor, id=vendor_id, owner=request.user)
        serializer = MenuItemSerializers(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def menuitem_detail(request, pk):
    menuitem = get_object_or_404(MenuItem, pk=pk, vendor__owner=request.user)
    if request.method == "GET":
        serializer = MenuItemSerializers(menuitem)
        return Response(serializer.data)
    if request.method == "PUT":
        serializer = MenuItemSerializers(menuitem, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    if request.method == "DELETE":
        menuitem.delete()
        return Response(status=204)
    
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def order_list_create(request):
    if request.method == "GET":
        orders = Order.objects.filter(user=request.user)
        serializers = OrderSerializers(orders, many=True)
        return Response(serializers.data)
    if request.method == "POST": 
        serializers = OrderSerializers(data = request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data, status=201)
        return Response(serializers.errors, status=400)
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    order = get_object_or_404(Order, pk=pk, user=request.user)
    if request.method == "GET":
        serializer = OrderSerializers(order)
        return Response(serializer.data)
    if request.method == "PUT":
        serializer = OrderSerializers(order, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    if request.method == "DELETE":
        order.delete()
        return Response(status=204)
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def orderitem_list_create(request):
    if request.method == "GET":
        orderitems = OrderItem.objects.filter(order__user= request.user)
        serializer = OrderItemSerializers(orderitems, many= True)
        return Response(serializer.data)
    if request.method == "POST":
        serializer = OrderItemSerializers(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def orderitem_detail(request, pk):
    orderitem = get_object_or_404(OrderItem, pk=pk, order__user=request.user)
    if request.method == "GET":
        serializer = OrderItemSerializers(orderitem)
        return Response(serializer.data)
    if request.method == "PUT":
        serializer = OrderItemSerializers(orderitem, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status= 400)
    if request.method == "DELETE":
        orderitem.delete()
        return Response(status=204)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initialize_payment(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if order.user != request.user:
        return Response({'error': "not authorized for this order"}, status=403)
    headers = {
        "Authorization" : f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type" : "application/json"
    }
    data = {
        "email" : request.user.email,
        "amount" : int(order.total_amount * 100),
        "reference": f"order_{order_id}_{order.created_at.timestamp()}",
    }
    response = requests.post("https://api.paystack.co/transaction/initialize", json = data, headers=headers)
    return Response(response.json())
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_payment(request, reference):
    headers = {
        "Authorization" : f"Bearer {settings.PAYSTACK_SECRET_KEY}",
    }
    response = requests.get(f"https://api.paystack.co/transaction/verify/{reference}", headers=headers)
    result = response.json()
    if result ['data'] ['status'] == 'success':
        payment = get_object_or_404(Payment, reference=reference, order__user= request.user)
        payment.status = 'Success'
        payment.verified_at = timezone.now()
        payment.save()
        payment.order.status = 'Paid'
        payment.order.save()
        return Response({'message': 'payment verified successfully'})
    return Response({'message':'payment verification failed'}, status=400)

@csrf_exempt
@api_view(['POST'])
def paystack_webhook(request):
    paystack_signature = request.headers.get('x-paystack-signature')
    
    computed_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
        request.body,
        hashlib.sha512
    ).hexdigest()
    
    if computed_signature != paystack_signature:
        return Response({'error': 'Invalid signature'}, status=400)
    
    event = request.data
    if event['event'] == 'charge.success':
        reference = event['data']['reference']
        payment = get_object_or_404(Payment, reference=reference)
        payment.status = 'Success'
        payment.verified_at = timezone.now()
        payment.save()
        
        payment.order.status = 'Paid'
        payment.order.save()
    
    return Response(status=200)