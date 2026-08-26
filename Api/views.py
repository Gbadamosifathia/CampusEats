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
import json
from django.http import HttpResponse
from decimal import Decimal
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.exceptions import TokenError
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        token= RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=205)
    except (TokenError, Exception):
        return Response({'error': 'Invalid or expired token'}, status=400)

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
            serializer.save(owner=request.user) 
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def vendor_detail(request, pk):
    if request.method == 'GET':
        vendor = get_object_or_404(Vendor, pk=pk)
        serializer = VendorSerializers(vendor)
        return Response(serializer.data)
    if request.method =='PUT':
        vendor = get_object_or_404(Vendor, pk=pk, owner= request.user)
        serializer = VendorSerializers(vendor, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    if request.method == 'DELETE':
        vendor = get_object_or_404(Vendor, pk=pk, owner= request.user)
        vendor.delete()
        return Response(status=204)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vendor_orders(request, pk):
    vendor = get_object_or_404(Vendor, pk=pk, owner=request.user)
    orders = Order.objects.filter(vendor=vendor)
    serializer = OrderSerializers(orders, many=True)
    return Response(serializer.data)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def menuitem_list_create(request):
    if request.method =="GET":
        vendor_id = request.query_params.get('vendor')
        if vendor_id:
            menuitems = MenuItem.objects.filter(vendor_id=vendor_id)
        else:
            menuitems = MenuItem.objects.filter(vendor__owner = request.user)
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
    if request.method == "GET":
        menuitem = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializers(menuitem)
        return Response(serializer.data)
    if request.method == "PUT":
        menuitem = get_object_or_404(MenuItem, pk=pk, vendor__owner=request.user)
        serializer = MenuItemSerializers(menuitem, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    if request.method == "DELETE":
        menuitem = get_object_or_404(MenuItem, pk=pk, vendor__owner=request.user)
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
            serializers.save(user=request.user)
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
        order_id = request.data.get('order')
        order = get_object_or_404(Order, id=order_id, user=request.user)
        serializer = OrderItemSerializers(data = request.data)
        if serializer.is_valid():
            serializer.save(order=order)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def order_status_update(request, pk):
    order = get_object_or_404(Order, pk=pk, vendor__owner= request.user)
    new_status = request.data.get('status')
    valid_statuses = ['Pending', 'Paid', 'Preparing', 'Completed', 'Cancelled']
    if new_status not in valid_statuses:
        return Response({'error': 'invalid status'}, status= 400)
    order.status = new_status
    order.save()
    return Response(OrderSerializers(order).data)

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
        "amount" : int(Decimal(str(order.total_amount ))* 100),
        "reference": f"order_{order_id}_{order.created_at.timestamp()}",
    }

    response = requests.post("https://api.paystack.co/transaction/initialize", json = data, headers=headers)
    result = response.json()
    if not response.ok or not result.get('status'):
        return Response({'error': 'Failed to initialize payment'}, status=502)
    Payment.objects.create(
        order=order,
        reference=data['reference'],
        amount=order.total_amount,
        status='Pending'
    )
    return Response(result)

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
def paystack_webhook(request):
    if request.method != 'POST':
        return HttpResponse(status=405)
        
    paystack_signature = request.headers.get('x-paystack-signature')
    if not paystack_signature:
        return HttpResponse('Missing signature header', status=400)
    
    computed_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
        request.body,
        hashlib.sha512
    ).hexdigest()
    
    if not hmac.compare_digest(computed_signature, paystack_signature):
        return HttpResponse('Invalid signature', status=400)
    
    # Parse the raw body manually since we removed @api_view
    try:
        event = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponse(status=400)
    if event['event'] == 'charge.success':
        reference = event['data']['reference']
        try:
            payment = Payment.objects.get(reference=reference)
        except ObjectDoesNotExist:
            # Return 200 so Paystack stops retrying a transaction that isn't in your DB
            return HttpResponse(status=200)
            
        payment.status = 'Success'
        payment.verified_at = timezone.now()
        payment.save()
        
        payment.order.status = 'Paid'
        payment.order.save()
        
    return HttpResponse(status=200)