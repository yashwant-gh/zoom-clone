import json
import random
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
from django.utils.dateparse import parse_datetime
from .models import Meeting

def generate_meeting_id():
    # Format: 123-456-789
    digits = [str(random.randint(0, 9)) for _ in range(9)]
    return f"{''.join(digits[:3])}-{''.join(digits[3:6])}-{''.join(digits[6:])}"

@csrf_exempt
def instant_meeting(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body) if request.body else {}
            host_name = data.get("hostName", "Zoom Host")
            meeting_id = generate_meeting_id()
            
            Meeting.objects.create(
                id=meeting_id,
                title=f"Instant Meeting - {host_name}",
                host_id="user-1",
                is_instant=True
            )
            return JsonResponse({"meetingId": meeting_id, "success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def schedule_meeting(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body) if request.body else {}
            title = data.get("title", "Scheduled Meeting")
            description = data.get("description", "")
            scheduled_for_str = data.get("scheduledFor")
            duration = int(data.get("duration", 60))
            
            scheduled_for = parse_datetime(scheduled_for_str) if scheduled_for_str else timezone.now()
            meeting_id = generate_meeting_id()
            
            Meeting.objects.create(
                id=meeting_id,
                title=title,
                description=description,
                host_id="user-1",
                is_instant=False,
                scheduled_for=scheduled_for,
                duration=duration
            )
            return JsonResponse({"meetingId": meeting_id, "success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def validate_meeting(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body) if request.body else {}
            meeting_id = data.get("meetingId", "").strip()
            
            meeting_exists = Meeting.objects.filter(id=meeting_id).exists()
            if meeting_exists:
                return JsonResponse({"valid": True})
            else:
                return JsonResponse({"valid": False, "error": "Meeting not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

def upcoming_meetings(request):
    try:
        now_minus_1_hour = timezone.now() - timedelta(hours=1)
        meetings = Meeting.objects.filter(
            host_id="user-1",
            is_instant=False,
            scheduled_for__gt=now_minus_1_hour
        ).order_by("scheduled_for")[:10]
        
        meeting_list = [{
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "scheduled_for": m.scheduled_for.isoformat() if m.scheduled_for else None,
            "duration": m.duration
        } for m in meetings]
        
        return JsonResponse({"meetings": meeting_list})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def recent_meetings(request):
    try:
        meetings = Meeting.objects.all().order_by("-created_at")[:10]
        
        meeting_list = [{
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "created_at": m.created_at.isoformat()
        } for m in meetings]
        
        return JsonResponse({"meetings": meeting_list})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
