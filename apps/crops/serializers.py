from rest_framework import serializers
from .models import Crop, CropMedia, Category, ContactInquiry, SavedCrop
from apps.accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class CropMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropMedia
        fields = ['id', 'file', 'media_type', 'is_primary', 'uploaded_at']


class CropListSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farmer_id = serializers.IntegerField(source='farmer.id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Crop
        fields = [
            'id', 'name', 'price_per_unit', 'unit', 'quantity_available',
            'location', 'status', 'is_organic', 'views_count',
            'farmer_name', 'farmer_id', 'category_name', 'primary_image', 'created_at'
        ]

    def get_primary_image(self, obj):
        media = obj.media.filter(media_type='image', is_primary=True).first()
        if not media:
            media = obj.media.filter(media_type='image').first()
        if media:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(media.file.url)
            return media.file.url
        return None


class CropDetailSerializer(serializers.ModelSerializer):
    farmer = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    # Accept category_id as integer or empty string
    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    media = CropMediaSerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    inquiries_count = serializers.SerializerMethodField()

    class Meta:
        model = Crop
        fields = [
            'id', 'farmer', 'category', 'category_id', 'name', 'description',
            'price_per_unit', 'unit', 'quantity_available', 'location',
            'harvest_date', 'status', 'is_organic', 'views_count',
            'media', 'is_saved', 'inquiries_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['farmer', 'views_count', 'created_at', 'updated_at']

    def validate_category_id(self, value):
        if not value:
            return None
        try:
            cat = Category.objects.get(pk=value)
            return cat
        except Category.DoesNotExist:
            raise serializers.ValidationError('Category not found.')

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedCrop.objects.filter(user=request.user, crop=obj).exists()
        return False

    def get_inquiries_count(self, obj):
        return obj.inquiries.count()

    def create(self, validated_data):
        category = validated_data.pop('category_id', None)
        crop = Crop.objects.create(**validated_data)
        if category:
            crop.category = category
            crop.save()
        return crop

    def update(self, instance, validated_data):
        category = validated_data.pop('category_id', None)
        if category is not None:
            instance.category = category
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ContactInquirySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    crop_name = serializers.CharField(source='crop.name', read_only=True)

    class Meta:
        model = ContactInquiry
        fields = ['id', 'crop', 'crop_name', 'sender', 'sender_name', 'message', 'phone', 'status', 'created_at']
        read_only_fields = ['sender', 'status', 'created_at', 'sender_name', 'crop_name']
