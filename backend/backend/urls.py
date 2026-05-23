from django.contrib import admin
from django.urls import path
from meetings import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/meetings/instant', views.instant_meeting),
    path('api/meetings/schedule', views.schedule_meeting),
    path('api/meetings/validate', views.validate_meeting),
    path('api/meetings/upcoming', views.upcoming_meetings),
    path('api/meetings/recent', views.recent_meetings),
]
