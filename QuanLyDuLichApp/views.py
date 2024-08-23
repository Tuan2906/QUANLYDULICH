from rest_framework import viewsets, permissions, status, parsers, generics


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


class GetPostCartUser:

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


class PostViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = BaiDangTour.objects.prefetch_related('tags')
    serializer_class = PostDetailSerializer

    # Xóa hoặc lấy chi tiết bài viết
    def get_permissions(self):
        if self.action in ['add_comments']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

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


class PostALlViewSet(APIView):
    parser_classes = (MultiPartParser, FormParser)

    # luu bai post
    def post(self, request):
        try:
            print(request.data)
            print(request.data.get('diemDi'))
            print('dawdaw', request.data.getlist('pictureUserSelect'))
            print('dawdaw', request.FILES.getlist('pictureUserSelect'))
            print('dawdaw', request.FILES.getlist('pictureUserSelect')[0])

            print('dawdaw', type(request.FILES.getlist('pictureUserSelect')))

            start = Local.objects.get(pk=request.data.get('diemDi'))
            end = Local.objects.get(pk=request.data.get('diemDen'))
            router, bool_create = Route.objects.get_or_create(
                id_noiDi=start,
                id_noiDen=end
            )
            transport = Transportation.objects.get(pk=request.data.get('phuongtien'))

            journey, b = Journey.objects.get_or_create(
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
                tags_instances.append(Tag.objects.get(pk=int(tag)))
            for stop_data in json.loads(request.data.get('diaDiemTrungGian')):
                print('abcaida', type(stop_data))
                lc = Local.objects.get(pk=stop_data.get('iddiaDiem'))
                print('lcafdawd', lc)
                DiaDiemDungChan.objects.get_or_create(ThoiGianDuKien=stop_data.get('timedung')
                                                      , id_DiaDiem_id=lc.id,
                                                      id_HanhTrinh_id=journey.id)
            #
            # # # Tạo mới đối tượng Post từ request.data và các đối tượng đã tạo
            post_instance = BaiDangTour.objects.create(
                title=request.data.get('title'),
                user_NV=request.user,  # doi lai request user
                content=content_data,
                journey=journey,
                max=request.data.get('soluong')
            )
            chiphi = request.data.get('chiPhi')
            chiphiTreEm = request.data.get('chiPhiTreEm')
            print('a', post_instance)
            print('n', chiphi)
            print('c', chiphiTreEm)
            GiaVe.objects.get_or_create(tour=post_instance, gia=chiphi)
            GiaVe.objects.get_or_create(tour=post_instance, gia=chiphiTreEm)

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
            return Response(PostDetailSerializer(post_instance).data, status=status.HTTP_201_CREATED)
        except:
            traceback.print_exc()


class PostTinTucViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.RetrieveAPIView,
                        generics.ListCreateAPIView):
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
        print('dadwawd', self.request.user)
        serializer.save(user_NV=self.request.user, active=False)

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
