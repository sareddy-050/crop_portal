from django.db import models
from django.conf import settings
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, help_text='Bootstrap icon class')
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'cp_categories'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Crop(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('pending', 'Pending'),
        ('expired', 'Expired'),
    ]
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('quintal', 'Quintal'),
        ('ton', 'Ton'),
        ('piece', 'Piece'),
        ('dozen', 'Dozen'),
        ('bundle', 'Bundle'),
    ]

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='crops'
    )
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    quantity_available = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=255)
    harvest_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    is_organic = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cp_crops'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} by {self.farmer.full_name}'


class CropMedia(models.Model):
    MEDIA_TYPE_CHOICES = [('image', 'Image'), ('video', 'Video')]

    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='crops/media/')
    media_type = models.CharField(max_length=5, choices=MEDIA_TYPE_CHOICES, default='image')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cp_crop_media'

    def save(self, *args, **kwargs):
        if self.is_primary:
            CropMedia.objects.filter(crop=self.crop, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class ContactInquiry(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
    ]

    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='inquiries')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_inquiries'
    )
    message = models.TextField()
    phone = models.CharField(max_length=15, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cp_contact_inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f'Inquiry on {self.crop.name} by {self.sender.full_name}'


class SavedCrop(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_crops'
    )
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cp_saved_crops'
        unique_together = ['user', 'crop']
