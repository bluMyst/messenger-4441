from django.db import models
from django.db.models import Q

from . import utils
from .user import User


class Conversation(utils.CustomModel):

    users = models.ManyToManyField(User, related_name="+")
    createdAt = models.DateTimeField(auto_now_add=True, db_index=True)
    updatedAt = models.DateTimeField(auto_now=True)

    # find_conversation has been removed because of the change from `user1` and
    # `user2` to `users`. many-to-many fields can't be unique, which means that
    # there could be more than one conversation for a given set of user IDs.
