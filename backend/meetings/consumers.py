import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class SignalingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f"meeting_{self.room_id}"
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and hasattr(self, 'user_id'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user.disconnected",
                    "user_id": self.user_id
                }
            )

    async def receive_json(self, content):
        message_type = content.get("type")
        
        if message_type == "join-room":
            self.user_id = content.get("userId")
            self.user_name = content.get("userName")
            
            # Allow targeted private routing by creating a personal group matching the user's ID
            await self.channel_layer.group_add(
                self.user_id,
                self.channel_name
            )
            
            # Join the meeting room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Broadcast to others in the room that a new user joined
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user.connected",
                    "sender_channel": self.channel_name,
                    "user_id": self.user_id,
                    "user_name": self.user_name
                }
            )

        elif message_type in ["offer", "answer", "ice-candidate"]:
            target_user_id = content.get("target")
            await self.channel_layer.group_send(
                target_user_id,
                {
                    "type": "signaling.payload",
                    "payload": content
                }
            )

    # Group handlers:
    
    async def user_connected(self, event):
        if event["sender_channel"] != self.channel_name:
            await self.send_json({
                "type": "user-connected",
                "userId": event["user_id"],
                "userName": event["user_name"]
            })

    async def user_disconnected(self, event):
        await self.send_json({
            "type": "user-disconnected",
            "userId": event["user_id"]
        })

    async def signaling_payload(self, event):
        await self.send_json(event["payload"])
