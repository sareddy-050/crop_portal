from django.urls import path
from . import views

urlpatterns = [
    path('', views.CropListCreateView.as_view(), name='crop_list_create'),
    path('<int:pk>/', views.CropDetailView.as_view(), name='crop_detail'),
    path('<int:crop_id>/media/', views.CropMediaUploadView.as_view(), name='crop_media'),
    path('<int:crop_id>/save/', views.SavedCropToggleView.as_view(), name='save_crop'),
    path('saved/', views.SavedCropListView.as_view(), name='saved_crops'),
    path('mine/', views.FarmerCropsView.as_view(), name='my_crops'),
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('inquiries/send/', views.ContactInquiryCreateView.as_view(), name='send_inquiry'),
    path('inquiries/received/', views.FarmerInquiriesView.as_view(), name='farmer_inquiries'),
]
