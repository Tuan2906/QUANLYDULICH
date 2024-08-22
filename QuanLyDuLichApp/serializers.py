from django.db.models import Prefetch, Count, Avg
from rest_framework.serializers import ModelSerializer
from .models import *
from rest_framework import serializers

class ImageSerializer(ItemSerializer):
    picture = serializers.ImageField()

    def create(self, validated_data):
        data = validated_data.copy()

        picture = JourneyPictures(**data)
        picture.save()

        return picture

    class Meta:
        model = JourneyPictures
        fields = ["id","picture"]

class TagSerializer (serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id','name']

class PostDetailSerializer(PostSerializer):
    tags = TagSerializer(many=True)
    pic = ImageSerializer(many=True)
    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['content', 'tags', 'pic',"active"]

class NguoiThanSerializer(ModelSerializer):
    class Meta:
        model = NguoiThan
        fields = ['id', 'ten', 'namsinh', 'created_date', 'updated_date']
        extra_kwargs = {'user': {'read_only': True}, 'active': {'read_only': True}}