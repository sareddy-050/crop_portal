from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from .models import Crop, CropMedia, Category, ContactInquiry, SavedCrop
from .serializers import (
    CropListSerializer, CropDetailSerializer, CropMediaSerializer,
    CategorySerializer, ContactInquirySerializer
)


class IsFarmerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'farmer'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.farmer == request.user


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CropListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsFarmerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'location', 'farmer__full_name']
    ordering_fields = ['price_per_unit', 'created_at', 'views_count']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CropDetailSerializer
        return CropListSerializer

    def get_queryset(self):
        qs = Crop.objects.select_related('farmer', 'category').prefetch_related('media')
        # Filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        organic = self.request.query_params.get('is_organic')
        if organic == 'true':
            qs = qs.filter(is_organic=True)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price_per_unit__gte=min_price)
        if max_price:
            qs = qs.filter(price_per_unit__lte=max_price)
        location = self.request.query_params.get('location')
        if location:
            qs = qs.filter(location__icontains=location)
        return qs

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


class CropDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Crop.objects.select_related('farmer', 'category').prefetch_related('media', 'inquiries')
    serializer_class = CropDetailSerializer
    permission_classes = [IsFarmerOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Crop.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CropMediaUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, crop_id):
        try:
            crop = Crop.objects.get(pk=crop_id, farmer=request.user)
        except Crop.DoesNotExist:
            return Response({'error': 'Crop not found or not authorized.'}, status=status.HTTP_404_NOT_FOUND)

        files = request.FILES.getlist('files')
        media_type = request.data.get('media_type', 'image')
        created_media = []
        for i, f in enumerate(files):
            is_primary = (i == 0 and not crop.media.filter(is_primary=True).exists())
            m = CropMedia.objects.create(crop=crop, file=f, media_type=media_type, is_primary=is_primary)
            created_media.append(CropMediaSerializer(m, context={'request': request}).data)

        return Response({'media': created_media}, status=status.HTTP_201_CREATED)

    def delete(self, request, crop_id):
        media_id = request.data.get('media_id')
        try:
            media = CropMedia.objects.get(pk=media_id, crop__farmer=request.user)
            media.file.delete(save=False)
            media.delete()
            return Response({'message': 'Deleted.'})
        except CropMedia.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class SavedCropToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, crop_id):
        try:
            crop = Crop.objects.get(pk=crop_id)
        except Crop.DoesNotExist:
            return Response({'error': 'Crop not found.'}, status=status.HTTP_404_NOT_FOUND)

        saved, created = SavedCrop.objects.get_or_create(user=request.user, crop=crop)
        if not created:
            saved.delete()
            return Response({'saved': False, 'message': 'Removed from saved.'})
        return Response({'saved': True, 'message': 'Saved!'}, status=status.HTTP_201_CREATED)


class SavedCropListView(generics.ListAPIView):
    serializer_class = CropListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        saved_ids = SavedCrop.objects.filter(user=self.request.user).values_list('crop_id', flat=True)
        return Crop.objects.filter(id__in=saved_ids).select_related('farmer', 'category').prefetch_related('media')


class FarmerCropsView(generics.ListAPIView):
    serializer_class = CropListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Crop.objects.filter(farmer=self.request.user).select_related('category').prefetch_related('media')


class ContactInquiryCreateView(generics.CreateAPIView):
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class FarmerInquiriesView(generics.ListAPIView):
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContactInquiry.objects.filter(crop__farmer=self.request.user).select_related('sender', 'crop')
