from django.urls import path, include
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
# router.register(r'tintuc', BaiDangTinTucViewSet, basename='tintuc')
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    # path('api/user_pay/', save_user_data, name='save_user_data'),
    path('api/save_invoice_and_send_email', save_invoice_and_send_email, name='save_invoice_and_send_email'),
]
