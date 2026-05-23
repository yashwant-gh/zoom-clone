from django.db import models
from django.utils import timezone

class Meeting(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    host_id = models.CharField(max_length=100, default='user-1')
    is_instant = models.BooleanField(default=False)
    scheduled_for = models.DateTimeField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)  # in minutes
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} ({self.id})"
