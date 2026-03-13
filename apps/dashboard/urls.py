from django.urls import path
from . import views

urlpatterns = [
    path('farmer/', views.FarmerDashboardView.as_view(), name='farmer_dashboard'),
    path('customer/', views.CustomerDashboardView.as_view(), name='customer_dashboard'),
    path('admin/', views.AdminDashboardView.as_view(), name='admin_dashboard'),
]
