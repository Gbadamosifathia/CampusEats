import firebase_admin
from django.apps import AppConfig
from django.conf import settings
from firebase_admin import credentials, initialize_app

class EatsConfig(AppConfig):
    name = 'Eats'

    def ready(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
            initialize_app(cred)