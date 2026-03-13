from django.contrib import admin
from .models import Crop, CropMedia, Category, ContactInquiry, SavedCrop

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']

class CropMediaInline(admin.TabularInline):
    model = CropMedia
    extra = 0

@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ['name', 'farmer', 'category', 'price_per_unit', 'unit', 'status', 'created_at']
    list_filter = ['status', 'is_organic', 'category']
    search_fields = ['name', 'farmer__full_name', 'location']
    inlines = [CropMediaInline]

@admin.register(ContactInquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['crop', 'sender', 'status', 'created_at']
    list_filter = ['status']
