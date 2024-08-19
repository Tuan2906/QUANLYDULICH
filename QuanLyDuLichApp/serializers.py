from django.db.models import Prefetch, Count, Avg
from rest_framework.serializers import ModelSerializer
from .models import *
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url

        return rep

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data["password"])
        user.save()

        return user

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }



class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['picture'] = instance.picture.url

        return rep

class ImageSerializer(ItemSerializer):
    picture = serializers.ImageField()
    # def to_representation(self, instance):
    #     return instance.picture.url

    def create(self, validated_data):
        data = validated_data.copy()

        picture = JourneyPictures(**data)
        picture.save()

        return picture

    class Meta:
        model = JourneyPictures
        fields = ["id","picture"]



class PostTinTucSerializer(serializers.ModelSerializer):  # 1 user n post
    pic = ImageSerializer(many=True, read_only=True)
    danhmuc = serializers.PrimaryKeyRelatedField(queryset=DanhMuc.objects.all())

    def create(self, validated_data):
        pictures_data = validated_data.pop('pic', [])
        danhMuc = validated_data.pop('danhmuc', None)
        print('dawda',validated_data)
        post = BaiDangTinTuc.objects.create(
            **validated_data,
            danhmuc=danhMuc

        )
        return post

    class Meta:
        model = BaiDangTinTuc
        fields = ["id", "created_date", "content", "title", 'pic','danhmuc']


class HanhKhanhSerializer(serializers.ModelSerializer):
    class Meta:
        model = NguoiThan
        fields = ['id', 'ten', 'namsinh']


class NguoiThanSerializer(ModelSerializer):
    class Meta:
        model = NguoiThan
        fields = ['id', 'ten', 'namsinh', 'created_date', 'updated_date']
        extra_kwargs = {'user': {'read_only': True}, 'active': {'read_only': True}}


class NguoiDangKySerializer(ModelSerializer):
    nguoi_than = NguoiThanSerializer(many=True, write_only=True)

    class Meta:
        model = NguoiDangKy
        fields = ['id', 'user', 'posts', 'timeselect', 'created_date', 'updated_date', 'nguoi_than']
        extra_kwargs = {'user': {'read_only': True}, 'active': {'read_only': True}}


