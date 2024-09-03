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

    @action(methods=['get'], url_path='postsXetDuyet', detail=True,
            permission_classes=[IsAuthenticated])  # user/id/posts: cho xem trang cá nhan ng khac
    def get_posts_userNV(self, request, pk=None):
        user = self.get_object()
        print(user)
        print(request.user)
        # Kiểm tra xem người dùng đã đăng nhập chưa
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Kiểm tra xem người dùng có phải là nhân viên không
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)
        return GetPostCartUser.get_post_userNV(request=request, user=user)


    @action(methods=['get'], url_path='tinTucXetDuyet', detail=True,
            permission_classes=[IsAuthenticated])  # user/id/posts: cho xem trang cá nhan ng khac
    def get_tintuc_userNV(self, request, pk=None):
        user = self.get_object()
        print(user)
        print(request.user)
        # Kiểm tra xem người dùng đã đăng nhập chưa
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Kiểm tra xem người dùng có phải là nhân viên không
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)
        return GetPostCartUser.get_tintuc_userNV(request=request, user=user)

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

    @action(methods=['get'], url_path='cartUser/posts', detail=False)  # Lấy post cua user dang ki của current
    def get_posts_current_user(self, request):
        print(request.user)
        user = request.user.id
        return GetPostCartUser.get_post_user(request=request, user=user)


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

    # @action(methods=['post', 'get'], url_path='comments', detail=True, description="them và lấy comment cho post")
    # def add_comment(self, request, pk):
    #     if request.method.__eq__('POST'):
    #         c = self.get_object().comments_set.create(content=request.data.get('content'),
    #                                                   user=request.user)
    #         return Response(CommentSerializer(c).data, status=status.HTTP_201_CREATED)
    #     elif request.method.__eq__('GET'):
    #         comments = self.get_object().comments_set.select_related('user').order_by('-id')
    #         paginator = paginators.CommentPaginator()
    #         page = paginator.paginate_queryset(comments, request)
    #         if page is not None:
    #             serializer = CommentSerializer(page, many=True)
    #             return paginator.get_paginated_response(serializer.data)
    #         return Response(CommentSerializer(comments, many=True).data)

    # cho nay viet luu ket hop vs luu thanh toan
    @action(methods=["post"], url_path="userRegiterCartPost", detail=True,
            description="để luu user dang ki khi nguoi dung chi luu tour tam thoi")
    def update_CartPost(self, request, pk):
        print("Vo xem")
        try:
            lc, created = NguoiDangKy.objects.get_or_create(posts=self.get_object(),
                                                            user=request.user)
            # print(lc.active)
            # print(lc)
            #
            # if not created:
            #     print("Vo cap nhat active")
            #     lc.active = not lc.active
            #     lc.save()
        except Exception:
            return Response({'status': False, 'message': 'Bài post không tìm thấy'})

        return Response({'status': True, 'message': 'Luu thong tin thanh cong', 'created': created})

    @action(methods=["post"], url_path="luuThongTinNguoiThan", detail=True,
            description="để luu ")
    def save_NgThan(self, request, pk):
        print("Vo xem")
        try:

            lc, created = NguoiDangKy.objects.get_or_create(posts=self.get_object(),
                                                            user=request.user)
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

    @action(methods=["delete"], url_path='deleteCart', detail=True,
            description="Xoa khoi gio hang")
    def del_travelCompanion(self, request, pk):
        if request.method.__eq__("DELETE"):
            try:
                travelCompanion_Del = self.get_object().nguoidangky_set.filter(
                    user=request.user)
                print(travelCompanion_Del)
                travelCompanion_Del.delete()
            except ObjectDoesNotExist:
                return Response({"error": "Không tìm thấy bai dang da chon"},
                                status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['post', 'get'], url_path='comments', detail=True,
            description="them và lấy comment cho post")
    def add_comment(self, request, pk):
        if request.method.__eq__('POST'):
            print("re", request.user)
            c = self.get_object().comments_set.create(content=request.data.get('content'),
                                                      user=request.user)
            return Response(CommentSerializer(c).data, status=status.HTTP_201_CREATED)
        elif request.method.__eq__('GET'):
            comments = self.get_object().comments_set.select_related('user').order_by('-id')
            paginator = paginators.ListPostsPaginator()
            page = paginator.paginate_queryset(comments, request)
            if page is not None:
                serializer = CommentSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            return Response(CommentSerializer(comments, many=True).data)


class ListPostViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = BaiDangTour.objects.select_related('journey').filter(
        journey__ngayDi__gte=datetime.now()).prefetch_related(Prefetch('giave_set')).order_by('-created_date')
    serializer_class = PostSerializer

    # Lấy tat ca cac post
    def get_queryset(self):  # Lọc post
        queryset = BaiDangTour.objects.select_related('journey').filter(
            journey__ngayDi__gte=datetime.now()).prefetch_related(Prefetch('giave_set')).order_by('-created_date')
        print('dawdawdadwd', timezone.now().date())
        print(queryset)
        if self.action.__eq__('list'):
            jn = self.request.query_params.get('q')
            c = self.request.query_params.get('c')
            a = self.request.query_params.get('a')
            t = self.request.query_params.get('t')
            ti = self.request.query_params.get('ti')
            if jn and jn != 'undefined':
                print('1')
                print(jn)
                queryset = queryset.filter(title__icontains=jn)
                print(queryset)

            if c and c != 'undefined':
                print('2')
                print(queryset)
                queryset = queryset.filter(journey__id_tuyenDuong__id_noiDi__id=c)
                print(queryset)
            if a and a != 'undefined':
                print('3')
                print(queryset)
                queryset = queryset.filter(journey__id_tuyenDuong__id_noiDen__id=a)
                print(queryset)
            if t and t != 'undefined':
                print('4')
                print(queryset)
                queryset = queryset.filter(tags__id=t)
                print(queryset)
            if ti and ti != 'undefined':
                print('4')
                print(queryset)
                ti = datetime.strptime(ti, "%Y-%m-%d").date()
                print(ti)
                queryset = queryset.filter(journey__ngayDi__date__gte=ti)
                print(queryset)
            # if avg_rate_param and avg_rate_param!='undefined':  # Kiểm tra nếu avgRate được truyền làm query parameter
            #     avg_rate = float(avg_rate_param)  # Chuyển đổi thành số dấu phẩy động
            #     queryset = queryset.annotate(avg_rate=Avg('rating__rate')).filter(avg_rate__range=[ avg_rate,  avg_rate+1]) # Tính trung bình các đánh giá

        return queryset


# Create your views here.
class DanhMucViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = DanhMuc.objects.filter(active=True)
    serializer_class = DanhMucSerializer

    def get_queryset(self):
        queryset = self.queryset

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(name__icontains=q)

        return queryset


# class BaiDangTinTucViewSet(viewsets.ViewSet, generics.ListAPIView):
#     queryset = BaiDangTinTuc.objects.filter(active=True)
#     serializer_class = BaiDangTinTucSerializer
#
#     def get_queryset(self):
#         queryset = self.queryset
#
#         if self.action.__eq__('list'):
#             q = self.request.query_params.get('q')
#             if q:
#                 queryset = queryset.filter(title__icontains=q)
#             danh_muc = self.request.query_params.get('danhMuc')
#             if danh_muc:
#                 queryset = queryset.filter(danhmuc__name=danh_muc)
#
#         queryset = queryset.order_by('-updated_date')
#
#         return queryset
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

class ListTinTucViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = BaiDangTinTuc.objects.select_related('user_NV').order_by('-created_date')
    serializer_class = PostsTinTuc_userSerializer

    # Lấy tat ca cac post
    def get_queryset(self):  # Lọc post
        queryset = BaiDangTinTuc.objects.select_related('user_NV').order_by('-created_date')
        print('dawdawdadwd', timezone.now().date())
        print(queryset)
        if self.action.__eq__('list'):
            jn = self.request.query_params.get('q')
            if jn and jn != 'undefined':
                print('1')
                print(jn)
                queryset = queryset.filter(title__icontains=jn)
                print(queryset)
        return queryset


# Danh sách lưu trữ thông tin người dùng
user_info_list = []


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


# @csrf_exempt
# def save_user_data(request):
#     if request.method == 'POST':
#         # Lấy dữ liệu từ request body
#         data = json.loads(request.body)
#         first_name = data.get('firstName', '')
#         last_name = data.get('lastName', '')
#         phone_number = data.get('phoneNumber', '')
#         email = data.get('email', '')
#         address = data.get('address', '')
#         amount = data.get('amount', '')
#         order_info = data.get('orderInfo', '')
#
#         # Lưu thông tin vào session
#         request.session['user_data'] = {
#             'first_name': first_name,
#             'last_name': last_name,
#             'phone_number': phone_number,
#             'email': email,
#             'address': address,
#             'amount': amount,
#             'order_info': order_info
#         }
#
#         # Trả về phản hồi cho client
#         return JsonResponse({'message': 'User data saved to session.'})
#     else:
#         return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)


# -----------------------------------------------
class GetPostCartUser:
    @staticmethod
    def get_post_user(request, user):
        posts = BaiDangTour.objects.filter(nguoidangky__user_id=user, nguoidangky__active=False).order_by('-id')
        paginator = paginators.ListPostsPaginator()
        page = paginator.paginate_queryset(posts, request)
        if page is not None:
            serializer = PostGioHangSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response(PostGioHangSerializer.data)

    @staticmethod
    def get_post_userNV(request, user):
        posts = BaiDangTour.objects.filter(user_NV=user).order_by('-id')
        print(posts)
        paginator = paginators.UserPostsPaginator()
        page = paginator.paginate_queryset(posts, request)
        if page is not None:
            serializer = PostDetailEmployee(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response(PostDetailEmployee.data)

    @staticmethod
    def get_tintuc_userNV(request, user):
        tintuc = BaiDangTinTuc.objects.filter(user_NV=user).order_by('-id')
        paginator = paginators.UserPostsPaginator()
        page = paginator.paginate_queryset(tintuc, request)
        if page is not None:
            serializer = PostDetailtTinTucSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response(PostDetailSerializer.data)


def get_or_create_access_token(user):
    # Tìm application để cấp phát access token
    try:
        # Chọn ứng dụng mặc định hoặc theo logic của bạn
        application = Application.objects.get(name='tourApp')
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


# class PostTinTucViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.RetrieveAPIView):
#     queryset = BaiDangTinTuc.objects.prefetch_related('danhmuc')
#     serializer_class = PostDetailtTinTucSerializer
#
#     # cho nay viet luu ket hop vs luu thanh toan
#
#     @action(methods=['post', 'get'], url_path='comments', detail=True,
#             description="them và lấy comment cho post")
#     def add_comment(self, request, pk):
#         if request.method.__eq__('POST'):
#             print("re", request.user)
#             c = self.get_object().tintuc_comments_set.create(content=request.data.get('content'),
#                                                              user=request.user)
#             return Response(CommentTinTucSerializer(c).data, status=status.HTTP_201_CREATED)
#         elif request.method.__eq__('GET'):
#             comments = self.get_object().tintuccomments_set.select_related('user').order_by('-id')
#             paginator = paginators.ListPostsPaginator()
#             page = paginator.paginate_queryset(comments, request)
#             if page is not None:
#                 serializer = CommentTinTucSerializer(page, many=True)
#                 return paginator.get_paginated_response(serializer.data)
#             return Response(CommentTinTucSerializer(comments, many=True).data)


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


stripe.api_key = settings.STRIPE_SECRET_KEY

API_URL = "http://localhost:3000"


class CreateCheckOutSession(APIView):
    def post(self, request, *args, **kwargs):
        prod_id = self.kwargs["pk"]
        in4 = request.data.get('form')
        print('dadawdaw',in4)
        print("ada", prod_id)
        try:
            product = BaiDangTour.objects.get(id=prod_id)
            print(product);
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                        'price_data': {
                            'currency': 'usd',
                            'unit_amount': in4.get('tong'),
                            'product_data': {
                                'name': in4['hanhtrinh'].get('title'),

                            }
                        },
                        'quantity': int(in4['sl'].get('sl_NguoiLon')) + int(in4['sl'].get('sl_TreEm')),
                    },
                ],
                metadata={
                    "product_id": product.id
                },
                mode='payment',
                success_url=f'{settings.SITE_URL}success',
                cancel_url=f'{settings.SITE_URL}cancel',
            )
            print("dadads", checkout_session.id)
            return Response(checkout_session)
        except Exception as e:
            print("ecas", e);
            return Response({'msg': 'something went wrong while creating stripe session', 'error': str(e)}, status=500)




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

class PostALlViewSet(APIView):
    parser_classes = (MultiPartParser, FormParser)
    # luu bai post
    def post(self, request):
        try:
            print(request.data)
            print(request.data.get('diemDi'))
            print('dawdaw',request.data.getlist('pictureUserSelect'))
            print('dawdaw',request.FILES.getlist('pictureUserSelect'))
            print('dawdaw',request.FILES.getlist('pictureUserSelect')[0])

            print('dawdaw',type(request.FILES.getlist('pictureUserSelect')))

            start = Local.objects.get(pk=request.data.get('diemDi'))
            end = Local.objects.get(pk=request.data.get('diemDen'))
            router, bool_create = Route.objects.get_or_create(
                id_noiDi=start,
                id_noiDen=end
            )
            transport = Transportation.objects.get(pk=request.data.get('phuongtien'))




            journey , b= Journey.objects.get_or_create(
                ngayDi=request.data.get('ngayDi'),
                ngayDen=request.data.get('ngayDen'),
                id_tuyenDuong=router,
                id_PhuongTien=transport
            )

            tags_data = request.data.getlist('tag')
            content_data = request.data.get('content')
            tags_instances = []
            print(tags_data)
            print(request.data.get('pictureDaChon'))
            for tag in tags_data:
                tags_instances.append(Tag.objects.get(pk = int(tag)))
            for stop_data in json.loads(request.data.get('diaDiemTrungGian')):
               print('abcaida',type(stop_data))
               lc =  Local.objects.get(pk = stop_data.get('iddiaDiem'))
               print('lcafdawd',lc)
               DiaDiemDungChan.objects.get_or_create(ThoiGianDuKien=stop_data.get('timedung')
                                                     , id_DiaDiem_id=lc.id,
                                                     id_HanhTrinh_id=journey.id)
            #
            # # # Tạo mới đối tượng Post từ request.data và các đối tượng đã tạo
            post_instance = BaiDangTour.objects.create(
                title = request.data.get('title'),
                user_NV=request.user, #doi lai request user
                content=content_data,
                journey=journey,
                max = request.data.get('soluong')
            )
            chiphi = request.data.get('chiPhi')
            chiphiTreEm = request.data.get('chiPhiTreEm')
            print('a',post_instance)
            print('n',chiphi)
            print('c',chiphiTreEm)
            GiaVe.objects.get_or_create(tour=post_instance, gia = chiphi)
            GiaVe.objects.get_or_create(tour=post_instance, gia = chiphiTreEm)


            arrayPic = []

            for pic_data in request.data.getlist('pictureDaChon'):
                pc = JourneyPictures.objects.get(pk=int(pic_data))
                arrayPic.append(pc)
            files = request.FILES.getlist('pictureUserSelect')
            base_url = f'https://res.cloudinary.com/{cloudinary.config().cloud_name}/'
            for file in files:
                result = cloudinary.uploader.upload(file)
                picture_url = result.get('secure_url').replace(base_url, '')
                if picture_url:
                    pic_instance = JourneyPictures(picture=picture_url)
                    arrayPic.append(pic_instance)
                    pic_instance.save()

            # Gán tags cho post_instance (n-n)
            post_instance.pic.set(arrayPic)
            post_instance.tags.set(tags_instances)

            # Gán nhân viên ngẫu nhiên làm người phê duyệt
            post_instance.user_NV = request.user

            post_instance.save()
            return Response(PostDetailSerializer(post_instance).data,status=status.HTTP_201_CREATED)
        except:
          traceback.print_exc()


class PostTinTucViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.RetrieveAPIView, generics.ListCreateAPIView):
    queryset = BaiDangTinTuc.objects.select_related('danhmuc').prefetch_related('pic')

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return PostDetailtTinTucSerializer
        return PostTinTucSerializer

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(title__icontains=q)

        queryset = queryset.order_by('-updated_date')

        return queryset

    def perform_create(self, serializer):
        print('dadwawd',    self.request.user)
        serializer.save(user_NV=self.request.user ,active=False)

    @action(methods=['post', 'get'], url_path='comments', detail=True,
            description="them và lấy comment cho post")
    def add_comment(self, request, pk):
        if request.method.__eq__('POST'):
            print("re", request.user)
            c = self.get_object().tintuccomments_set.create(content=request.data.get('content'),
                                                             user=request.user)
            return Response(CommentTinTucSerializer(c).data, status=status.HTTP_201_CREATED)
        elif request.method.__eq__('GET'):
            comments = self.get_object().tintuccomments_set.select_related('user').order_by('-created_date')
            paginator = paginators.ListPostsPaginator()
            page = paginator.paginate_queryset(comments, request)
            if page is not None:
                serializer = CommentTinTucSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            return Response(CommentTinTucSerializer(comments, many=True).data)