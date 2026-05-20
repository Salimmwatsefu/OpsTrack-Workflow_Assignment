from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from tracker.api import router as tracker_router

api = NinjaAPI()
api.add_router("/applications", tracker_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]