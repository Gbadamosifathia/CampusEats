from django.urls import path
from . import views

urlpatterns =[
    path('vendor_list/', views.vendor_list_create, name="vendor_list_create"),
    path('vendor/<int:pk>/', views.vendor_detail, name="vendor_detail"),
    path('menuitem_list/', views.menuitem_list_create, name="menuitem_list_create"),
    path('menuitem/<int:pk>/', views.menuitem_detail, name="menuitem_detail"),
    path('order_list/', views.order_list_create, name="order_list_create"),
    path('order/<int:pk>/', views.order_detail, name="order_detail"),
    path('orderitem_list/', views.orderitem_list_create, name="orderitem_list_create"),
    path('orderitem/<int:pk>/', views.orderitem_detail, name="orderitem_detail"),
    path('signup/', views.signup, name='signup'),
    path('logout', views.logout, name='logout'),
    path('payment/initialize/<int:order_id>/', views.initialize_payment, name="initialize_payment"),
    path('payment_verify/<str:reference>/', views.verify_payment, name="verify_payment"),
    path('webhook/paystack/', views.paystack_webhook, name='paystack_webhook'),
]