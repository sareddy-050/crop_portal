from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum, Avg
from apps.crops.models import Crop, ContactInquiry, SavedCrop
from apps.accounts.models import User


class FarmerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        crops = Crop.objects.filter(farmer=user)
        stats = {
            'total_listings': crops.count(),
            'available': crops.filter(status='available').count(),
            'sold': crops.filter(status='sold').count(),
            'total_views': crops.aggregate(v=Sum('views_count'))['v'] or 0,
            'total_inquiries': ContactInquiry.objects.filter(crop__farmer=user).count(),
            'new_inquiries': ContactInquiry.objects.filter(crop__farmer=user, status='new').count(),
            'recent_crops': [
                {
                    'id': c.id,
                    'name': c.name,
                    'status': c.status,
                    'price_per_unit': str(c.price_per_unit),
                    'unit': c.unit,
                    'views_count': c.views_count,
                    'created_at': c.created_at.isoformat(),
                }
                for c in crops.order_by('-created_at')[:5]
            ],
        }
        return Response(stats)


class CustomerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        stats = {
            'saved_crops': SavedCrop.objects.filter(user=user).count(),
            'inquiries_sent': ContactInquiry.objects.filter(sender=user).count(),
            'recent_inquiries': [
                {
                    'id': i.id,
                    'crop_name': i.crop.name,
                    'farmer_name': i.crop.farmer.full_name,
                    'message': i.message[:80],
                    'status': i.status,
                    'created_at': i.created_at.isoformat(),
                }
                for i in ContactInquiry.objects.filter(sender=user).select_related('crop__farmer').order_by('-created_at')[:5]
            ],
        }
        return Response(stats)


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        stats = {
            'total_users': User.objects.count(),
            'farmers': User.objects.filter(role='farmer').count(),
            'customers': User.objects.filter(role='customer').count(),
            'total_crops': Crop.objects.count(),
            'available_crops': Crop.objects.filter(status='available').count(),
            'total_inquiries': ContactInquiry.objects.count(),
        }
        return Response(stats)
