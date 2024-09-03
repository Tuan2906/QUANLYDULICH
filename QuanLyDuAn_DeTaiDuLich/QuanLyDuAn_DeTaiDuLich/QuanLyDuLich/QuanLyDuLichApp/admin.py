from django.contrib import admin
from QuanLyDuLichApp.models import *
import cloudinary
from django.contrib import admin
from django.contrib.auth.hashers import make_password
from django.db.models.functions import ExtractYear
from django.utils.html import mark_safe
from oauth2_provider.models import AccessToken

from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.db import connection
from django.utils.html import mark_safe
from django.urls import path
from django.db.models import Count, Sum, Avg, Subquery, OuterRef, ExpressionWrapper, F, FloatField
from django.template.response import TemplateResponse
from datetime import datetime


class MyAdminSite(admin.AdminSite):
    site_header = 'shareJourney'

    def get_urls(self):
        return [path('stats/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):  # danh gia user dua tren so rating thuoc 1 month
        if request.GET.get("month"):
            month =  int(request.GET.get("month", datetime.now().month))
        else:
            month = datetime.now().month
        print("mont", month);
        sql = """
            SELECT 
                e.id,
                e.diaChi AS diaChiDi,
                d.diaChi AS diaChiDen,
                h.soluonghanhkhach, -- Số lượng hành khách
                h.title AS title,
                SUM(h.revenue) AS doanhthu -- Tổng doanh thu từ các bài đăng trong mỗi journey
            FROM 
                quanlydulichapp_local e 
            JOIN 
                quanlydulichapp_route f ON e.id = f.id_noiDi_id
            JOIN 
                quanlydulichapp_local d ON d.id = f.id_noiDen_id
            JOIN 
                quanlydulichapp_journey a ON a.id_tuyenDuong_id = f.id
            JOIN (
                SELECT 
                    b.journey_id,
                    b.title,
                    SUM(j.user_count) AS soluonghanhkhach,
                    SUM(k.tongTien) AS revenue
                FROM 
                    quanlydulichapp_baidangtour b
                JOIN (
                    SELECT 
                        h.id, 
                        h.posts_id,
                        COUNT(i.user_id) AS user_count
                    FROM 
                        quanlydulichapp_nguoidangky h
                    JOIN 
                        quanlydulichapp_nguoithan i ON i.user_id = h.id
                    GROUP BY 
                        h.id, h.posts_id
                ) j ON b.id = j.posts_id
                JOIN 
                    quanlydulichapp_hoadon k ON j.id = k.user_id 
                WHERE 
                    MONTH(b.created_date) = %s 
                GROUP BY 
                    b.journey_id, b.title
            ) h ON h.journey_id = a.id
            GROUP BY 
                e.id, e.diaChi, d.diaChi, h.soluonghanhkhach, h.title;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, [month])
            results = cursor.fetchall()
        print("das",sql)
        data = [
            {
                "id": row[0],
                "diaChiDi": row[1],
                "diaChiDen": row[2],
                "soluonghanhkhach": row[3] if row[3] is not None else 0,
                "title": row[4] if row[4] is not None else "Chưa có tour",
                "doanhthu": row[5] if row[3] is not None else 0,

            }
            for row in results
        ]

        return TemplateResponse(request, 'admin/stats.html', {
            'stats': data,
            'so_luong': range(len(data)),
            'm': month,
            "tong_doanh_thu": sum(row[5] if row[5] is not None else 0 for row in results)
        })

admin_site = MyAdminSite(name='DU LICH')


class PostForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = BaiDang
        fields = '__all__'


class MyPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'created_date', 'updated_date', 'active']
    search_fields = ['title', 'content']
    list_filter = ['id', 'created_date', 'title']
    readonly_fields = ['my_image']
    form = PostForm

    def my_image(self, instance):
        if instance:
            if instance.image is cloudinary.CloudinaryResource:
                return mark_safe(f"<img width='120' src='{instance.image.url}' />")

            return mark_safe(f"<img width='120' src='/static/{instance.image.name}' />")

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }


class AccessTokenAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'expires', 'created')
    search_fields = ('user__username',)
    list_filter = ('user', 'created', 'user__is_staff')


class UserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'password', 'is_staff', 'avatar']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.password = make_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


class UserAdmin(admin.ModelAdmin):
    form = UserCreationForm
    list_display = ['username', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['username']
    list_filter = ['is_staff', 'is_active']


# Register your models here.
admin_site.register(BaiDangTour, MyPostAdmin)
admin_site.register(BaiDangTinTuc)
admin_site.register(DanhMuc)
admin_site.register(Tag)
admin_site.register(Comments)
admin_site.register(JourneyPictures)
admin_site.register(CommentReply)
admin_site.register(NguoiDangKy)
admin_site.register(Rating)
admin_site.register(Local)
admin_site.register(Transportation)
admin_site.register(User, UserAdmin)
admin_site.register(AccessToken, AccessTokenAdmin)
admin_site.register(NguoiThan)
admin_site.register(HoaDon)
admin_site.register(TinTucComments)
admin_site.register(Journey)
admin_site.register(Route)


