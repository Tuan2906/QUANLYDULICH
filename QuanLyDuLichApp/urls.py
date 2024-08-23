from django.urls import path, include
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
router.register('posts', PostViewSet, basename='posts')
router.register('postsTinTuc', PostTinTucViewSet, basename='postsTinTuc')
router.register('allposts', ListTinTucViewSet, basename='allposts')
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    path('api/post/', PostALlViewSet.as_view(), name='post'),
]
