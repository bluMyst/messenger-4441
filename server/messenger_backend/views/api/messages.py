from http import HTTPStatus

from django.contrib.auth.middleware import get_user
from django.http import HttpResponse, JsonResponse
from messenger_backend.models import Conversation, Message
from online_users import online_users
from rest_framework.views import APIView


class Messages(APIView):
    """expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)"""

    def post(self, request):
        try:
            user = get_user(request)

            if user.is_anonymous:
                return HttpResponse(status=401)

            sender_id = user.id
            body = request.data
            conversation_id = body.get("conversationId")
            text = body.get("text")
            recipient_id = body.get("recipientId")
            sender = body.get("sender")

            # if we already know conversation id, we can save time and just add it to message and return
            if conversation_id:
                conversation = Conversation.objects.filter(id=conversation_id).first()
                message = Message(
                    senderId=sender_id, text=text, conversation=conversation
                )
                message.save()
                message_json = message.to_dict()
                return JsonResponse({"message": message_json, "sender": body["sender"]})

            # if we don't have conversation id, find a conversation to m       ake sure it doesn't already exist
            conversation = Conversation.find_conversation(sender_id, recipient_id)
            if not conversation:
                # create conversation
                conversation = Conversation(user1_id=sender_id, user2_id=recipient_id)
                conversation.save()

                if sender and sender["id"] in online_users:
                    sender["online"] = True

            message = Message(senderId=sender_id, text=text, conversation=conversation)
            message.save()
            message_json = message.to_dict()
            return JsonResponse({"message": message_json, "sender": sender})
        except Exception as e:
            return HttpResponse(status=500)

    def patch(self, request):
        """Expects json in the form:

        {'action': 'markRead',
         'conversationId': <int>,
         'messageIds': <list of ints>}

        (there may be support for other actions in the future)

        If all goes well, this will mark all designated messages as read,
        as long as they're part of the designated conversation.
        """
        user = get_user(request)

        if user.is_anonymous:
            return HttpResponse(status=HTTPStatus.UNAUTHORIZED)

        if (
            "action" not in request.data
            or "conversationId" not in request.data
            or "messageIds" not in request.data
        ):
            return JsonResponse(
                {"error": ["missing required parameter(s)"]},
                status=HTTPStatus.BAD_REQUEST,
            )

        if request.data["action"] != "markRead":
            return JsonResponse(
                {"error": ["unknown or invalid action", request.data["action"]]},
                status=HTTPStatus.BAD_REQUEST,
            )

        try:
            conversation_id = int(request.data["conversationId"])
            message_ids = [int(id) for id in request.data["messageIds"]]

            conversation = Conversation.objects.prefetch_related("messages").get(
                id=conversation_id
            )
        except ValueError:
            return JsonResponse(
                {"error": ["invalid parameter(s)"]}, status=HTTPStatus.BAD_REQUEST
            )
        except Conversation.DoesNotExist:
            return JsonResponse(
                {"error": ["conversation not found", conversation_id]},
                status=HTTPStatus.NOT_FOUND,
            )

        if conversation.user1 != user and conversation.user2 != user:
            return JsonResponse(
                {"error": ["you're not part of that conversation"]},
                status=HTTPStatus.FORBIDDEN,
            )

        messages = conversation.messages.filter(id__in=message_ids).exclude(senderId=user.id)

        if len(messages) < len(message_ids):
            return JsonResponse(
                {"error": ["not all message ids were found (or some of them were sent by you)", message_ids]},
                status=HTTPStatus.NOT_FOUND,
            )

        assert len(messages) == len(message_ids)

        for message in messages:
            message.readByRecipient = True
            message.save()

        return HttpResponse(status=HTTPStatus.NO_CONTENT)
