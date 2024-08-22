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

class PostViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = BaiDangTour.objects.prefetch_related('tags')
    serializer_class = PostDetailSerializer

    def get_permissions(self):
        if self.action in ['add_comments', 'add_rating']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=["post"], url_path="userRegiterCartPost", detail=True,
            description="để luu user dang ki khi nguoi dung chi luu tour tam thoi")
    def update_CartPost(self, request, pk):
        print("Vo xem")
        try:
            lc, created = NguoiDangKy.objects.get_or_create(posts=self.get_object(), user=request.user)
        except Exception:
            return Response({'status': False, 'message': 'Bài post không tìm thấy'})

        return Response({'status': True, 'message': 'Luu thong tin thanh cong', 'created': created})


    @action(methods=["post"], url_path="luuThongTinNguoiThan", detail=True,
            description="để luu ")
    def save_NgThan(self, request, pk):
        print("Vo xem")
        try:
            lc, created = NguoiDangKy.objects.get_or_create(posts=self.get_object(), user=request.user)
            print('dawdawd',request.data)
            print('dawdawd',request.data.get('nguoi_than'))
            serializer = NguoiThanSerializer(many=True, data=request.data.get('nguoi_than'))
            serializer.is_valid(raise_exception=True)
            nguoi_than_data = serializer.validated_data
            HoaDon.objects.create(tongTien=request.data.get('tongtien'), user=lc, active=True)
            for nt_data in nguoi_than_data:
                NguoiThan.objects.create(user=lc, **nt_data)
            print("Vo cap nhat active")
            lc.active = True
            lc.save()
        except Exception:
            traceback.print_exc()
            return Response({'status': False, 'message': 'Bài post không tìm thấy'})

        return Response({'status': True, 'message': 'Luu thong tin thanh cong', 'created': created})