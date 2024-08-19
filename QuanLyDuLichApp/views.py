import secrets
import traceback

from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import EmailMessage
from django.db.models import Prefetch
from django.shortcuts import render
from oauth2_provider.models import Application, AccessToken
from rest_framework import viewsets, permissions, status, parsers, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
import stripe
from django.conf import settings
from rest_framework.decorators import action
from .serializers import *
from rest_framework.response import Response
from datetime import datetime
from django.utils import timezone
from QuanLyDuLichApp import paginators
import cloudinary.uploader
import cloudinary
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET
import requests
import hmac
import hashlib
import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    @staticmethod
    def get_access_token(user):
        access_token = AccessToken.objects.filter(user=user).first()
        return access_token

    @action(methods=['post'], url_path="loginStaff", detail=False)
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        print(username, password)
        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=400)

        user = authenticate(username=username, password=password)
        print("userr", user);
        access_token = get_or_create_access_token(user)
        if user is None:
            return Response({'error': 'User not found'}, status=404)

        if not user.is_staff:
            return Response({'error': 'Unauthorized access'}, status=403)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=401)
        if not access_token:
            return Response({'error': 'Access token not found'}, status=status.HTTP_404_NOT_FOUND)
        serialized_user = UserSerializer(user).data
        response_data = {
            'user': serialized_user,
            'access_token': access_token.token,
            'expires': access_token.expires,
        }
        # If authentication is successful, serialize the user data
        return Response(response_data)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Tải lên avatar nếu có
        if 'file' in request.FILES:
            try:
                upload_result = cloudinary.uploader.upload(request.FILES['file'], resource_type="auto")
                data['avatar'] = upload_result['secure_url']
            except Exception as ex:
                return Response({'error': str(ex)}, status=500)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()

        return Response(UserSerializer(user).data)



def get_or_create_access_token(user):
    # Tìm application để cấp phát access token
    try:
        # Chọn ứng dụng mặc định hoặc theo logic của bạn
        application = Application.objects.get(name='DULICH')
    except Application.DoesNotExist:
        # Xử lý khi không tìm thấy ứng dụng
        return None

    # Kiểm tra nếu đã có access token cho người dùng này
    access_token = AccessToken.objects.filter(user=user, application=application).first()

    # Nếu không có, tạo mới access token
    if not access_token:
        # Tạo access token mới
        access_token = AccessToken.objects.create(
            user=user,
            token=secrets.token_urlsafe(32),
            application=application,
            expires=timezone.now() + timezone.timedelta(days=365)  # Thời gian hết hạn (ví dụ: 1 năm)
        )

    return access_token







@csrf_exempt
def save_invoice_and_send_email(request):
    print("dssd", request)
    if request.method == 'POST':
        try:

            data = json.loads(request.body)
            data2 = json.loads(data['body'])
            print("data", data)
            # Assuming data contains necessary information like tour_id, customer_email, etc.
            # Save invoice logic here (e.g., using Django ORM)
            print("data2", data2.get("id"))
            nd = ("Bạn đã thanh toán cho tour có tên:" +
                  data2.get("title") + "\nMã tour:" + data2.get("id") +
                  "\nChuyến tham quan:" +
                  data2.get("tour") +
                  "\nThời gian:" + data2.get("ngaykhoihanh") + "-" + data2.get(
                        "ngayketthuc") + "\nChúc bạn có 1 chặng du "
                                         "lịch đầy vui vẻ cùng "
                                         "với người thân và gia "
                                         "đình")
            print("dad", nd)
            # Example of sending confirmation email
            email_word = EmailMessage('Thanh toan thanh cong',
                                      nd,
                                      settings.EMAIL_HOST_USER,
                                      [data2.get("customer_email")])
            email_word.send(fail_silently=False)
            return JsonResponse({'message': 'Invoice saved and email sent successfully'}, status=200)

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)




