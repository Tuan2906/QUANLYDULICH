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



class CommentViewSet(viewsets.ViewSet, generics.GenericAPIView):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer

    # permission_classes = [perm.CommentOwner]
    def get_permissions(self):
        if self.action in ['add_and_get_comment_reply'] and self.request.POST:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['post', 'get'], url_path='replies', detail=True,
            description="Lay va luu danh sach rep cua 1 comment")
    def add_and_get_comment_reply(self, request, pk):
        comment = self.get_object()
        if request.method.__eq__('POST'):
            reply = CommentReply.objects.create(cmtRep=comment, content=request.data.get('content'), user=request.user)
            return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        if request.method.__eq__('GET'):
            rep = comment.comment_reply.all().order_by("-created_date")
            return Response(ReplySerializer(rep, many=True).data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_408_REQUEST_TIMEOUT)


class LocalViewSet(viewsets.ViewSet, generics.ListAPIView): # Lay ds dia diem
    queryset = Local.objects.all()
    serializer_class = LocalSerializer


class TransportationViewSet(viewsets.ViewSet, generics.ListAPIView): # lay ds phuong tien
    queryset = Transportation.objects.all()
    serializer_class = TransportationsSerilializer



class PictureViewSet(viewsets.ViewSet, generics.ListAPIView): # lay ds hinh anh
    queryset = JourneyPictures.objects.all()
    serializer_class = ImageSerializer
    pagination_class = paginators.PicturePaginator


class TagViewSet(viewsets.ViewSet, generics.ListAPIView):  # Lay ds tag
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    @action(methods=['get'], url_path='posts', detail=True, description="lay post theo tag")
    def get_posts_by_tag(self, request, pk):
        post_with_tag = BaiDangTour.objects.filter(tags__id=pk).select_related('journey').filter(
            journey__ngayDi__gte=timezone.now()).order_by('-created_date')
        print('dadajjjjjj')
        jn = self.request.query_params.get('q')
        c = self.request.query_params.get('c')
        a = self.request.query_params.get('a')
        ti = self.request.query_params.get('ti')
        if jn and jn != 'undefined':
            print('1')
            print(jn)
            post_with_tag = post_with_tag.filter(title__icontains=jn)
        if c and c != 'undefined':
            print('2')
            post_with_tag = post_with_tag.filter(journey__id_tuyenDuong__id_noiDi__id=c)
        if a and a != 'undefined':
            print('3')
            post_with_tag = post_with_tag.filter(journey__id_tuyenDuong__id_noiDen__id=a)
        if ti and ti != 'undefined':
            print('4')
            ti = datetime.strptime(ti, "%Y-%m-%d").date()
            print(ti)
            post_with_tag = post_with_tag.filter(journey__ngayDi__date__gte=ti)
        paginator = paginators.ListPostsPaginator()

        serializer = Posts_userSerializer(post_with_tag, many=True)
        page = paginator.paginate_queryset(post_with_tag, request)
        if page is not None:
            serializer = Posts_userSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        print('anc')
        return Response(serializer, status=status.HTTP_200_OK)


class DanhMucViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = DanhMuc.objects.filter(active=True)
    serializer_class = DanhMucSerializer

    def get_queryset(self):
        queryset = self.queryset

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(name__icontains=q)

        return queryset

    class PostViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
        queryset = BaiDangTour.objects.prefetch_related('tags')
        serializer_class = PostDetailSerializer

        # Xóa hoặc lấy chi tiết bài viết
        def get_permissions(self):
            if self.action in ['add_comments', 'add_rating']:
                return [permissions.IsAuthenticated()]
            return [permissions.AllowAny()]

        @action(methods=['post'], url_path='rates', detail=True,
                description="Lưu rating của user đó thuộc bài đăng đó")
        def add_rating(self, request, pk):
            c = self.get_object().rating_set.create(rate=request.data.get('rate'),
                                                    user=request.user)
            return Response(RatingSerializer(c).data, status=status.HTTP_201_CREATED)

@csrf_exempt
def handle_payments(request):
    try:
        # Lấy giá từ request.POST
        # Các tham số gửi đến MoMo để lấy payUrl

        print(request.POST.get('amount'))
        endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
        partnerCode = "MOMO"
        accessKey = "F8BBA842ECF85"
        secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
        orderInfo = "Thanh toan qua MoMo"
        redirectUrl = "http://localhost:3000/success"
        ipnUrl = "http://192.168.1.17:8000/momo_ipn"
        amount = request.POST.get('amount')
        orderId = str(uuid.uuid4())
        requestId = str(uuid.uuid4())
        requestType = "payWithATM"
        extraData = ""  # Pass empty value or Encode base64 JsonString

        # Trước khi ký HMAC SHA256
        rawSignature = f"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}"

        # Tạo chữ ký
        h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
        signature = h.hexdigest()

        # Đối tượng JSON gửi đến endpoint MoMo
        data = {
            'partnerCode': partnerCode,
            'partnerName': "Test",
            'storeId': "MomoTestStore",
            'requestId': requestId,
            'amount': amount,
            'orderId': orderId,
            'orderInfo': orderInfo,
            'redirectUrl': redirectUrl,
            'ipnUrl': ipnUrl,
            'lang': "vi",
            'extraData': extraData,
            'requestType': requestType,
            'signature': signature
        }

        # Chuyển đổi dữ liệu thành JSON
        data = json.dumps(data)
        clen = len(data)

        try:
            # Gửi yêu cầu POST đến endpoint MoMo với dữ liệu JSON
            response = requests.post(endpoint, data=data,
                                     headers={'Content-Type': 'application/json', 'Content-Length': str(clen)})

            # Xử lý phản hồi từ API
            if response.status_code == 200:
                data = response.json()
                return JsonResponse({'payUrl': data.get('payUrl'),'orderId':orderId })
            else:
                return JsonResponse({'error': f'Error: {response.status_code}'}, status=response.status_code)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)