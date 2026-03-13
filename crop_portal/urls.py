from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    # API routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/crops/', include('apps.crops.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    # Serve React SPA for all other routes
    re_path(r'^(?!api/).*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
